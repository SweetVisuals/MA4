import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Conversation, Message, MessageAttachment, Profile } from '@/lib/types';

export function useMessages(userId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch all conversations for the current user
  const fetchConversations = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get all conversations where the user is a participant
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          user_id,
          joined_at,
          last_read_at,
          is_pinned,
          conversations:conversation_id(
            id,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId);
      
      if (participantError) throw participantError;
      
      if (!participantData || participantData.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }
      
      // Extract conversation IDs
      const conversationIds = participantData.map(p => p.conversation_id);
      
      // Get the last message for each conversation
      const { data: lastMessagesData, error: lastMessagesError } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          created_at,
          updated_at,
          is_read,
          metadata,
          profiles:sender_id(
            id,
            full_name,
            username,
            profile_url
          )
        `)
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false })
        .limit(1, { foreignTable: 'conversation_id' });
      
      if (lastMessagesError) throw lastMessagesError;
      
      // Get all other participants in these conversations
      const { data: otherParticipantsData, error: otherParticipantsError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          user_id,
          profiles:user_id(
            id,
            full_name,
            username,
            profile_url
          )
        `)
        .in('conversation_id', conversationIds)
        .neq('user_id', userId);
      
      if (otherParticipantsError) throw otherParticipantsError;
      
      // Count unread messages
      const { data: unreadData, error: unreadError } = await supabase
        .from('messages')
        .select('conversation_id, count')
        .in('conversation_id', conversationIds)
        .neq('sender_id', userId)
        .eq('is_read', false)
        .group('conversation_id');
      
      if (unreadError) throw unreadError;
      
      // Build the conversations array
      const conversationsWithDetails = participantData.map(participant => {
        // Find the conversation
        const conversation = participant.conversations;
        
        // Find the last message for this conversation
        const lastMessage = lastMessagesData?.find(msg => msg.conversation_id === participant.conversation_id);
        
        // Find other participants
        const otherParticipants = otherParticipantsData
          ?.filter(p => p.conversation_id === participant.conversation_id)
          .map(p => ({
            conversation_id: p.conversation_id,
            user_id: p.user_id,
            joined_at: participant.joined_at,
            last_read_at: participant.last_read_at,
            is_pinned: participant.is_pinned,
            profile: p.profiles
          }));
        
        // Find unread count
        const unreadCount = unreadData
          ?.find(u => u.conversation_id === participant.conversation_id)
          ?.count || 0;
        
        return {
          ...conversation,
          participants: otherParticipants || [],
          last_message: lastMessage,
          unread_count: unreadCount,
          is_pinned: participant.is_pinned
        };
      });
      
      // Sort conversations by last message date (most recent first)
      conversationsWithDetails.sort((a, b) => {
        const dateA = a.last_message ? new Date(a.last_message.created_at).getTime() : new Date(a.updated_at).getTime();
        const dateB = b.last_message ? new Date(b.last_message.created_at).getTime() : new Date(b.updated_at).getTime();
        return dateB - dateA;
      });
      
      setConversations(conversationsWithDetails);
      
      // Calculate total unread count
      const totalUnread = unreadData?.reduce((sum, item) => sum + parseInt(item.count), 0) || 0;
      setUnreadCount(totalUnread);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a specific conversation
  const fetchMessages = async (conversationId: string) => {
    if (!userId || !conversationId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          created_at,
          updated_at,
          is_read,
          metadata,
          profiles:sender_id(
            id,
            full_name,
            username,
            profile_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (messagesError) throw messagesError;
      
      // Get attachments for these messages
      const messageIds = messagesData?.map(m => m.id) || [];
      
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from('message_attachments')
        .select('*')
        .in('message_id', messageIds);
      
      if (attachmentsError) throw attachmentsError;
      
      // Combine messages with their attachments
      const messagesWithAttachments = messagesData?.map(message => {
        const attachments = attachmentsData
          ?.filter(a => a.message_id === message.id)
          .map(a => ({
            id: a.id,
            message_id: a.message_id,
            file_url: a.file_url,
            file_type: a.file_type,
            file_name: a.file_name,
            file_size: a.file_size,
            created_at: a.created_at
          }));
        
        return {
          ...message,
          sender: message.profiles,
          attachments
        };
      });
      
      setMessages(messagesWithAttachments || []);
      
      // Mark messages as read
      if (messagesData && messagesData.length > 0) {
        const unreadMessages = messagesData
          .filter(m => m.sender_id !== userId && !m.is_read)
          .map(m => m.id);
        
        if (unreadMessages.length > 0) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadMessages);
          
          // Update last_read_at for the user in this conversation
          await supabase
            .from('conversation_participants')
            .update({ last_read_at: new Date().toISOString() })
            .eq('conversation_id', conversationId)
            .eq('user_id', userId);
          
          // Refresh conversations to update unread counts
          fetchConversations();
        }
      }
      
      // Set the selected conversation
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Send a new message
  const sendMessage = async (conversationId: string, content: string, attachments?: File[]) => {
    if (!userId || !conversationId || !content.trim()) {
      return { success: false, error: 'Invalid message data' };
    }
    
    try {
      // Insert the message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          content: content.trim(),
          is_read: false
        })
        .select()
        .single();
      
      if (messageError) throw messageError;
      
      // Handle attachments if any
      if (attachments && attachments.length > 0 && messageData) {
        for (const file of attachments) {
          // Upload file to storage
          const fileExt = file.name.split('.').pop();
          const filePath = `${userId}/${conversationId}/${messageData.id}/${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('message_attachments')
            .upload(filePath, file);
          
          if (uploadError) throw uploadError;
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('message_attachments')
            .getPublicUrl(filePath);
          
          // Add attachment record
          const { error: attachmentError } = await supabase
            .from('message_attachments')
            .insert({
              message_id: messageData.id,
              file_url: publicUrl,
              file_type: file.type,
              file_name: file.name,
              file_size: file.size
            });
          
          if (attachmentError) throw attachmentError;
        }
      }
      
      // Update conversation's updated_at timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
      
      // Refresh messages and conversations
      await fetchMessages(conversationId);
      await fetchConversations();
      
      return { success: true, messageId: messageData?.id };
    } catch (err) {
      console.error('Error sending message:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to send message'
      };
    }
  };

  // Create a new conversation
  const createConversation = async (participantIds: string[]) => {
    if (!userId || !participantIds.length) {
      return { success: false, error: 'Invalid participant data' };
    }
    
    try {
      // Check if conversation already exists between these users
      const allParticipants = [userId, ...participantIds];
      
      // For each potential participant, get their conversations
      const { data: existingParticipations, error: participationsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, user_id')
        .in('user_id', allParticipants);
      
      if (participationsError) throw participationsError;
      
      // Group by conversation_id
      const conversationParticipants: Record<string, string[]> = {};
      existingParticipations?.forEach(p => {
        if (!conversationParticipants[p.conversation_id]) {
          conversationParticipants[p.conversation_id] = [];
        }
        conversationParticipants[p.conversation_id].push(p.user_id);
      });
      
      // Check if there's a conversation with exactly these participants
      const existingConversationId = Object.entries(conversationParticipants)
        .find(([_, participants]) => {
          return participants.length === allParticipants.length && 
                 allParticipants.every(id => participants.includes(id));
        })?.[0];
      
      if (existingConversationId) {
        // Conversation already exists, just return it
        await fetchConversations();
        return { 
          success: true, 
          conversationId: existingConversationId,
          isExisting: true
        };
      }
      
      // Create new conversation
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();
      
      if (conversationError) throw conversationError;
      
      // Add all participants
      const participantsToAdd = allParticipants.map(participantId => ({
        conversation_id: conversationData.id,
        user_id: participantId
      }));
      
      const { error: addParticipantsError } = await supabase
        .from('conversation_participants')
        .insert(participantsToAdd);
      
      if (addParticipantsError) throw addParticipantsError;
      
      // Refresh conversations
      await fetchConversations();
      
      return { 
        success: true, 
        conversationId: conversationData.id,
        isExisting: false
      };
    } catch (err) {
      console.error('Error creating conversation:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to create conversation'
      };
    }
  };

  // Pin/unpin a conversation
  const togglePinConversation = async (conversationId: string, isPinned: boolean) => {
    if (!userId || !conversationId) {
      return { success: false, error: 'Invalid conversation data' };
    }
    
    try {
      const { error } = await supabase
        .from('conversation_participants')
        .update({ is_pinned: !isPinned })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Refresh conversations
      await fetchConversations();
      
      return { success: true };
    } catch (err) {
      console.error('Error toggling pin status:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update conversation'
      };
    }
  };

  // Delete a conversation (for the current user only)
  const deleteConversation = async (conversationId: string) => {
    if (!userId || !conversationId) {
      return { success: false, error: 'Invalid conversation data' };
    }
    
    try {
      // Remove the user from the conversation
      const { error } = await supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Refresh conversations
      await fetchConversations();
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting conversation:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to delete conversation'
      };
    }
  };

  // Initialize by fetching conversations
  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!userId) return;
    
    const subscription = supabase
      .channel('messages-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=in.(${conversations.map(c => c.id).join(',')})`
      }, (payload) => {
        // If the message is for the selected conversation, add it to the messages list
        if (selectedConversation && payload.new.conversation_id === selectedConversation.id) {
          // Fetch the complete message with sender info and attachments
          fetchMessages(selectedConversation.id);
        }
        
        // Refresh conversations to update last message and unread counts
        fetchConversations();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId, conversations, selectedConversation]);

  return {
    conversations,
    selectedConversation,
    setSelectedConversation,
    messages,
    loading,
    error,
    unreadCount,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    togglePinConversation,
    deleteConversation
  };
}