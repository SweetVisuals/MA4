import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface WalletTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'purchase' | 'sale' | 'gem_purchase';
  description: string;
  created_at: string;
  metadata?: any;
}

export function useWallet(userId: string) {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch wallet balance
  const fetchBalance = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setBalance(Number(data.balance) || 0);
      } else {
        // Create wallet if it doesn't exist
        await createWallet();
      }
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
      setError(err instanceof Error ? err.message : 'Failed to load wallet balance');
    } finally {
      setLoading(false);
    }
  };

  // Create a new wallet
  const createWallet = async () => {
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .insert([{ user_id: userId, balance: 0 }])
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        setBalance(Number(data[0].balance) || 0);
      }
    } catch (err) {
      console.error('Error creating wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to create wallet');
    }
  };

  // Fetch wallet transactions
  const fetchTransactions = async (limit: number = 10) => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching wallet transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // Add funds to wallet
  const addFunds = async (amount: number, description: string = 'Deposit', metadata: any = {}) => {
    if (!userId) return { success: false, error: 'User not authenticated' };
    if (amount <= 0) return { success: false, error: 'Amount must be positive' };
    
    try {
      // Start a transaction
      const { data: walletData, error: walletError } = await supabase
        .from('user_wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();
      
      if (walletError) throw walletError;
      
      const currentBalance = Number(walletData.balance) || 0;
      const newBalance = currentBalance + amount;
      
      // Update wallet balance
      const { error: updateError } = await supabase
        .from('user_wallets')
        .update({ balance: newBalance })
        .eq('user_id', userId);
      
      if (updateError) throw updateError;
      
      // Record transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert([{
          user_id: userId,
          amount,
          type: 'deposit',
          description,
          metadata
        }])
        .select();
      
      if (transactionError) throw transactionError;
      
      // Update local state
      setBalance(newBalance);
      setTransactions(prev => [transactionData[0], ...prev]);
      
      return { success: true, balance: newBalance };
    } catch (err) {
      console.error('Error adding funds:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to add funds'
      };
    }
  };

  // Withdraw funds from wallet
  const withdrawFunds = async (amount: number, description: string = 'Withdrawal', metadata: any = {}) => {
    if (!userId) return { success: false, error: 'User not authenticated' };
    if (amount <= 0) return { success: false, error: 'Amount must be positive' };
    
    try {
      // Start a transaction
      const { data: walletData, error: walletError } = await supabase
        .from('user_wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();
      
      if (walletError) throw walletError;
      
      const currentBalance = Number(walletData.balance) || 0;
      
      // Check if sufficient funds
      if (currentBalance < amount) {
        return { success: false, error: 'Insufficient funds' };
      }
      
      const newBalance = currentBalance - amount;
      
      // Update wallet balance
      const { error: updateError } = await supabase
        .from('user_wallets')
        .update({ balance: newBalance })
        .eq('user_id', userId);
      
      if (updateError) throw updateError;
      
      // Record transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert([{
          user_id: userId,
          amount: -amount, // Negative amount for withdrawal
          type: 'withdrawal',
          description,
          metadata
        }])
        .select();
      
      if (transactionError) throw transactionError;
      
      // Update local state
      setBalance(newBalance);
      setTransactions(prev => [transactionData[0], ...prev]);
      
      return { success: true, balance: newBalance };
    } catch (err) {
      console.error('Error withdrawing funds:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to withdraw funds'
      };
    }
  };

  // Purchase gems with wallet funds
  const purchaseGems = async (gemCount: number, costPerGem: number = 1) => {
    if (!userId) return { success: false, error: 'User not authenticated' };
    if (gemCount <= 0) return { success: false, error: 'Gem count must be positive' };
    
    const totalCost = gemCount * costPerGem;
    
    try {
      // Check if sufficient funds
      const { data: walletData, error: walletError } = await supabase
        .from('user_wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();
      
      if (walletError) throw walletError;
      
      const currentBalance = Number(walletData.balance) || 0;
      
      if (currentBalance < totalCost) {
        return { success: false, error: 'Insufficient funds' };
      }
      
      // Update wallet balance
      const newBalance = currentBalance - totalCost;
      const { error: updateWalletError } = await supabase
        .from('user_wallets')
        .update({ balance: newBalance })
        .eq('user_id', userId);
      
      if (updateWalletError) throw updateWalletError;
      
      // Update user's gem count
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('gems')
        .eq('user_id', userId)
        .single();
      
      if (statsError && statsError.code !== 'PGRST116') throw statsError;
      
      const currentGems = statsData?.gems || 0;
      const newGems = currentGems + gemCount;
      
      if (statsData) {
        // Update existing stats
        const { error: updateStatsError } = await supabase
          .from('user_stats')
          .update({ gems: newGems })
          .eq('user_id', userId);
        
        if (updateStatsError) throw updateStatsError;
      } else {
        // Create new stats record
        const { error: insertStatsError } = await supabase
          .from('user_stats')
          .insert([{ user_id: userId, gems: gemCount }]);
        
        if (insertStatsError) throw insertStatsError;
      }
      
      // Record transaction
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert([{
          user_id: userId,
          amount: -totalCost,
          type: 'gem_purchase',
          description: `Purchased ${gemCount} gems`,
          metadata: { gem_count: gemCount, cost_per_gem: costPerGem }
        }]);
      
      if (transactionError) throw transactionError;
      
      // Record analytics event
      const { error: analyticsError } = await supabase
        .from('analytics_events')
        .insert([{
          user_id: userId,
          event_name: 'gem_purchase',
          event_category: 'monetization',
          event_value: totalCost,
          metadata: { gem_count: gemCount, cost_per_gem: costPerGem }
        }]);
      
      if (analyticsError) throw analyticsError;
      
      // Update local state
      setBalance(newBalance);
      
      // Trigger a custom event to update the gem count in the header
      window.dispatchEvent(new CustomEvent('gem-balance-update'));
      
      return { success: true, balance: newBalance, gems: newGems };
    } catch (err) {
      console.error('Error purchasing gems:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to purchase gems'
      };
    }
  };

  // Initialize by fetching balance
  useEffect(() => {
    if (userId) {
      fetchBalance();
      fetchTransactions();
    }
  }, [userId]);

  return {
    balance,
    transactions,
    loading,
    error,
    fetchBalance,
    fetchTransactions,
    addFunds,
    withdrawFunds,
    purchaseGems
  };
}