import React, { useState, useEffect, useRef } from "react";
import { AppSidebar } from "@/components/dashboard/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/@/ui/sidebar";
import { SiteHeader } from "@/components/dashboard/layout/site-header";
import { Card, CardContent } from "@/components/@/ui/card";
import { Button } from "@/components/@/ui/button";
import { Input } from "@/components/@/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/@/ui/avatar";
import { Badge } from "@/components/@/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/@/ui/tabs";
import { Separator } from "@/components/@/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { useMessages } from "@/hooks/useMessages";
import { 
  Search, 
  Send, 
  Plus, 
  MoreVertical, 
  Phone, 
  Video, 
  Info, 
  Paperclip, 
  Smile, 
  Mic, 
  Image as ImageIcon, 
  File, 
  Star, 
  Clock, 
  CheckCheck, 
  Filter,
  Loader2,
  Pin,
  Trash2,
  X,
  Users,
  UserPlus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/@/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/@/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Conversation, Message, Profile } from "@/lib/types";

export default function MessagesPage() {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [searchedUsers, setSearchedUsers] = useState<Profile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([]);
  const [userSearchInput, setUserSearchInput] = useState("");
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  
  const { 
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
  } = useMessages(user?.id || '');

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery.trim()) return true;
    
    const participant = conversation.participants[0]?.profile;
    if (!participant) return false;
    
    return (
      participant.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;
    
    const result = await sendMessage(
      selectedConversation.id, 
      messageInput,
      selectedFiles.length > 0 ? selectedFiles : undefined
    );
    
    if (result.success) {
      setMessageInput("");
      setSelectedFiles([]);
    } else {
      toast.error(result.error || "Failed to send message");
    }
  };

  // Format timestamp to a readable format
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      // Today - show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffInDays < 7) {
      // Within a week - show day name
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      // Older - show date
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Get status icon for messages
  const getStatusIcon = (message: Message) => {
    if (message.sender_id === user?.id) {
      if (message.is_read) {
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      } else {
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      }
    }
    return null;
  };

  // Search for users to message
  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchedUsers([]);
      return;
    }
    
    setIsSearchingUsers(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, profile_url')
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .neq('id', user?.id)
        .limit(10);
      
      if (error) throw error;
      
      setSearchedUsers(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setIsSearchingUsers(false);
    }
  };

  // Handle selecting a user to message
  const handleSelectUser = (profile: Profile) => {
    if (!selectedUsers.some(u => u.id === profile.id)) {
      setSelectedUsers([...selectedUsers, profile]);
    }
    setUserSearchInput('');
    setSearchedUsers([]);
  };

  // Handle removing a selected user
  const handleRemoveUser = (profileId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== profileId));
  };

  // Start a new conversation
  const handleStartConversation = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }
    
    const participantIds = selectedUsers.map(u => u.id);
    const result = await createConversation(participantIds);
    
    if (result.success) {
      setShowNewMessageDialog(false);
      setSelectedUsers([]);
      
      // Find and select the new conversation
      await fetchConversations();
      const newConversation = conversations.find(c => c.id === result.conversationId);
      if (newConversation) {
        setSelectedConversation(newConversation);
        fetchMessages(newConversation.id);
      }
      
      if (result.isExisting) {
        toast.info('Opened existing conversation');
      } else {
        toast.success('New conversation created');
      }
    } else {
      toast.error(result.error || 'Failed to create conversation');
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  // Remove a selected file
  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle pin/unpin conversation
  const handleTogglePin = async (conversationId: string, isPinned: boolean) => {
    const result = await togglePinConversation(conversationId, isPinned);
    
    if (result.success) {
      toast.success(isPinned ? 'Conversation unpinned' : 'Conversation pinned');
    } else {
      toast.error(result.error || 'Failed to update conversation');
    }
  };

  // Handle delete conversation
  const handleDeleteConversation = (conversationId: string) => {
    setConversationToDelete(conversationId);
    setShowDeleteDialog(true);
  };

  // Confirm delete conversation
  const confirmDeleteConversation = async () => {
    if (!conversationToDelete) return;
    
    const result = await deleteConversation(conversationToDelete);
    
    if (result.success) {
      toast.success('Conversation deleted');
      if (selectedConversation?.id === conversationToDelete) {
        setSelectedConversation(null);
      }
    } else {
      toast.error(result.error || 'Failed to delete conversation');
    }
    
    setShowDeleteDialog(false);
    setConversationToDelete(null);
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 animate-fade-in">
            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
              {/* Conversations Sidebar */}
              <div className="w-80 border-r flex flex-col">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-lg">Messages</h2>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setShowNewMessageDialog(true)}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      placeholder="Search messages..." 
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <Tabs defaultValue="all" className="flex-1 flex flex-col">
                  <div className="px-2 pt-2">
                    <TabsList className="w-full">
                      <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                      <TabsTrigger value="unread" className="flex-1">
                        Unread
                        {unreadCount > 0 && (
                          <Badge variant="secondary\" className="ml-1">{unreadCount}</Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="pinned" className="flex-1">Pinned</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="all" className="flex-1 overflow-y-auto p-2">
                    {loading ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : filteredConversations.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <div className="bg-muted/50 p-4 rounded-full mb-4">
                          <MessageSquare className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium mb-1">No conversations found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {searchQuery ? "Try a different search term" : "Start a new conversation"}
                        </p>
                        {!searchQuery && (
                          <Button onClick={() => setShowNewMessageDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Message
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {filteredConversations.map((conversation) => {
                          const participant = conversation.participants[0]?.profile;
                          if (!participant) return null;
                          
                          return (
                            <div
                              key={conversation.id}
                              className={`p-2 rounded-lg cursor-pointer transition-colors ${
                                selectedConversation?.id === conversation.id 
                                  ? 'bg-accent' 
                                  : 'hover:bg-muted'
                              }`}
                              onClick={() => {
                                setSelectedConversation(conversation);
                                fetchMessages(conversation.id);
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <Avatar>
                                    <AvatarImage src={participant.profile_url} />
                                    <AvatarFallback>{participant.full_name?.[0] || participant.username?.[0]}</AvatarFallback>
                                  </Avatar>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium truncate">{participant.full_name || participant.username}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {conversation.last_message && formatTimestamp(conversation.last_message.created_at)}
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground truncate">
                                      {conversation.last_message?.content}
                                    </p>
                                    <div className="flex items-center">
                                      {conversation.is_pinned && (
                                        <Pin className="h-3 w-3 text-primary mr-1" />
                                      )}
                                      {conversation.unread_count > 0 && (
                                        <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                          {conversation.unread_count}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    handleTogglePin(conversation.id, conversation.is_pinned);
                                  }}>
                                    <Pin className="h-4 w-4 mr-2" />
                                    {conversation.is_pinned ? 'Unpin' : 'Pin'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-500"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteConversation(conversation.id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="unread" className="flex-1 overflow-y-auto p-2">
                    <div className="space-y-1">
                      {filteredConversations
                        .filter(conv => conv.unread_count > 0)
                        .map((conversation) => {
                          const participant = conversation.participants[0]?.profile;
                          if (!participant) return null;
                          
                          return (
                            <div
                              key={conversation.id}
                              className={`p-2 rounded-lg cursor-pointer transition-colors ${
                                selectedConversation?.id === conversation.id 
                                  ? 'bg-accent' 
                                  : 'hover:bg-muted'
                              }`}
                              onClick={() => {
                                setSelectedConversation(conversation);
                                fetchMessages(conversation.id);
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={participant.profile_url} />
                                  <AvatarFallback>{participant.full_name?.[0] || participant.username?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium truncate">{participant.full_name || participant.username}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {conversation.last_message && formatTimestamp(conversation.last_message.created_at)}
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground truncate">
                                      {conversation.last_message?.content}
                                    </p>
                                    <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                      {conversation.unread_count}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pinned" className="flex-1 overflow-y-auto p-2">
                    <div className="space-y-1">
                      {filteredConversations
                        .filter(conv => conv.is_pinned)
                        .map((conversation) => {
                          const participant = conversation.participants[0]?.profile;
                          if (!participant) return null;
                          
                          return (
                            <div
                              key={conversation.id}
                              className={`p-2 rounded-lg cursor-pointer transition-colors ${
                                selectedConversation?.id === conversation.id 
                                  ? 'bg-accent' 
                                  : 'hover:bg-muted'
                              }`}
                              onClick={() => {
                                setSelectedConversation(conversation);
                                fetchMessages(conversation.id);
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={participant.profile_url} />
                                  <AvatarFallback>{participant.full_name?.[0] || participant.username?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium truncate">{participant.full_name || participant.username}</p>
                                    <div className="flex items-center">
                                      <Pin className="h-3 w-3 text-primary mr-1" />
                                      <p className="text-xs text-muted-foreground">
                                        {conversation.last_message && formatTimestamp(conversation.last_message.created_at)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground truncate">
                                      {conversation.last_message?.content}
                                    </p>
                                    {conversation.unread_count > 0 && (
                                      <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                        {conversation.unread_count}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {selectedConversation.participants[0]?.profile && (
                          <Avatar>
                            <AvatarImage src={selectedConversation.participants[0].profile.profile_url} />
                            <AvatarFallback>
                              {selectedConversation.participants[0].profile.full_name?.[0] || 
                               selectedConversation.participants[0].profile.username?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <h3 className="font-medium">
                            {selectedConversation.participants[0]?.profile?.full_name || 
                             selectedConversation.participants[0]?.profile?.username}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Phone className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Video className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Info className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {loading ? (
                        <div className="h-full flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4">
                          <div className="bg-muted/50 p-4 rounded-full mb-4">
                            <MessageSquare className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="font-medium mb-1">No messages yet</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Send a message to start the conversation
                          </p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div 
                            key={message.id} 
                            className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex gap-2 max-w-[70%] ${message.sender_id === user?.id ? 'flex-row-reverse' : ''}`}>
                              {message.sender_id !== user?.id && (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={message.sender?.profile_url} />
                                  <AvatarFallback>
                                    {message.sender?.full_name?.[0] || message.sender?.username?.[0] || '?'}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div>
                                <div 
                                  className={`rounded-lg p-3 ${
                                    message.sender_id === user?.id 
                                      ? 'bg-primary text-primary-foreground' 
                                      : 'bg-muted'
                                  }`}
                                >
                                  <p>{message.content}</p>
                                  {message.attachments && message.attachments.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                      {message.attachments.map((attachment, index) => (
                                        <div 
                                          key={index} 
                                          className={`flex items-center gap-2 p-2 rounded ${
                                            message.sender_id === user?.id 
                                              ? 'bg-primary-foreground/10' 
                                              : 'bg-background'
                                          }`}
                                        >
                                          {attachment.file_type.startsWith('image/') && <ImageIcon className="h-4 w-4" />}
                                          {attachment.file_type.startsWith('audio/') && <Mic className="h-4 w-4" />}
                                          {!attachment.file_type.startsWith('image/') && 
                                           !attachment.file_type.startsWith('audio/') && <File className="h-4 w-4" />}
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate">{attachment.file_name}</p>
                                            {attachment.file_size && (
                                              <p className="text-xs opacity-70">
                                                {formatFileSize(attachment.file_size)}
                                              </p>
                                            )}
                                          </div>
                                          <a 
                                            href={attachment.file_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="block"
                                          >
                                            <Button 
                                              variant="ghost" 
                                              size="icon" 
                                              className="h-6 w-6"
                                            >
                                              <Download className="h-3 w-3" />
                                            </Button>
                                          </a>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div 
                                  className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                                    message.sender_id === user?.id ? 'justify-end' : ''
                                  }`}
                                >
                                  <span>{formatTimestamp(message.created_at)}</span>
                                  {message.sender_id === user?.id && getStatusIcon(message)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    
                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && (
                      <div className="px-4 py-2 border-t">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="relative flex-shrink-0">
                              <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
                                {file.type.startsWith('image/') ? (
                                  <ImageIcon className="h-4 w-4" />
                                ) : file.type.startsWith('audio/') ? (
                                  <Mic className="h-4 w-4" />
                                ) : (
                                  <File className="h-4 w-4" />
                                )}
                                <span className="text-xs truncate max-w-[100px]">{file.name}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-5 w-5 p-0"
                                  onClick={() => handleRemoveFile(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Message Input */}
                    <div className="p-4 border-t">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Smile className="h-5 w-5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Paperclip className="h-5 w-5" />
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            multiple
                            onChange={handleFileSelect}
                          />
                        </Button>
                        <Input 
                          placeholder="Type a message..." 
                          className="flex-1"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button 
                          variant={messageInput.trim() || selectedFiles.length > 0 ? "default" : "ghost"} 
                          size="icon"
                          disabled={!messageInput.trim() && selectedFiles.length === 0}
                          onClick={handleSendMessage}
                        >
                          <Send className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <div className="bg-muted/50 p-6 rounded-full mb-4">
                      <MessageSquare className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Your Messages</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Connect with collaborators, clients, and fellow musicians. Select a conversation or start a new one.
                    </p>
                    <Button onClick={() => setShowNewMessageDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Message
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* New Message Dialog */}
      <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>
              Start a conversation with other users
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 items-center border rounded-md p-2">
                {selectedUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                    <span className="text-sm">{user.full_name || user.username}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 p-0"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Input
                  placeholder="Search users..."
                  className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={userSearchInput}
                  onChange={(e) => {
                    setUserSearchInput(e.target.value);
                    searchUsers(e.target.value);
                  }}
                />
              </div>
              
              {isSearchingUsers && (
                <div className="flex justify-center p-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
              
              {!isSearchingUsers && searchedUsers.length > 0 && (
                <Card>
                  <CardContent className="p-2">
                    <div className="max-h-[200px] overflow-y-auto">
                      {searchedUsers.map(user => (
                        <div 
                          key={user.id}
                          className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                          onClick={() => handleSelectUser(user)}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profile_url} />
                            <AvatarFallback>{user.full_name?.[0] || user.username?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowNewMessageDialog(false);
              setSelectedUsers([]);
              setUserSearchInput('');
              setSearchedUsers([]);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleStartConversation}
              disabled={selectedUsers.length === 0}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Start Conversation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteConversation}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function MessageSquare(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function Download(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )
}