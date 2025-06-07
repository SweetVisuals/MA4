import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/dashboard/layout/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/@/ui/sidebar"
import { SiteHeader } from "@/components/dashboard/layout/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWallet } from "@/hooks/useWallet"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import {
  Wallet,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Gem,
  Loader2,
  Clock,
  Calendar,
  ChevronRight
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/@/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/@/ui/table"
import { format } from "date-fns"

export default function WalletPage() {
  const { user } = useAuth()
  const { 
    balance, 
    transactions, 
    loading, 
    addFunds, 
    withdrawFunds, 
    purchaseGems,
    fetchTransactions
  } = useWallet(user?.id || '')
  
  const [isAddFundsDialogOpen, setIsAddFundsDialogOpen] = useState(false)
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)
  const [isBuyGemsDialogOpen, setIsBuyGemsDialogOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [gemCount, setGemCount] = useState(10)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      fetchTransactions(10)
    }
  }, [user])

  useEffect(() => {
    // Generate some demo transactions if none exist
    if (!loading && transactions.length === 0) {
      const demoTransactions = [
        {
          id: '1',
          type: 'deposit',
          amount: 100,
          description: 'Wallet deposit',
          created_at: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
        },
        {
          id: '2',
          type: 'gem_purchase',
          amount: -20,
          description: 'Purchased 20 gems',
          created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
          id: '3',
          type: 'sale',
          amount: 49.99,
          description: 'Beat sale: Summer Vibes',
          created_at: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
        }
      ]
      setRecentTransactions(demoTransactions)
    } else {
      setRecentTransactions(transactions)
    }
  }, [transactions, loading])

  const handleAddFunds = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    
    setIsProcessing(true)
    try {
      const result = await addFunds(Number(amount), 'Wallet deposit')
      
      if (result.success) {
        toast.success(`$${amount} added to your wallet`)
        setIsAddFundsDialogOpen(false)
        setAmount('')
      } else {
        toast.error(result.error || 'Failed to add funds')
      }
    } catch (error) {
      console.error('Error adding funds:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleWithdraw = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    
    if (Number(amount) > balance) {
      toast.error('Insufficient funds')
      return
    }
    
    setIsProcessing(true)
    try {
      const result = await withdrawFunds(Number(amount), 'Wallet withdrawal')
      
      if (result.success) {
        toast.success(`$${amount} withdrawn from your wallet`)
        setIsWithdrawDialogOpen(false)
        setAmount('')
      } else {
        toast.error(result.error || 'Failed to withdraw funds')
      }
    } catch (error) {
      console.error('Error withdrawing funds:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBuyGems = async () => {
    if (gemCount <= 0) {
      toast.error('Please select a valid number of gems')
      return
    }
    
    const costPerGem = 1 // $1 per gem
    const totalCost = gemCount * costPerGem
    
    if (totalCost > balance) {
      toast.error('Insufficient funds')
      return
    }
    
    setIsProcessing(true)
    try {
      const result = await purchaseGems(gemCount, costPerGem)
      
      if (result.success) {
        toast.success(`Purchased ${gemCount} gems successfully`)
        setIsBuyGemsDialogOpen(false)
        setGemCount(10)
      } else {
        toast.error(result.error || 'Failed to purchase gems')
      }
    } catch (error) {
      console.error('Error purchasing gems:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case 'withdrawal':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />
      case 'purchase':
        return <CreditCard className="h-4 w-4 text-blue-500" />
      case 'sale':
        return <DollarSign className="h-4 w-4 text-green-500" />
      case 'gem_purchase':
        return <Gem className="h-4 w-4 text-violet-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 animate-fade-in p-8">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold">Wallet</h1>
              <p className="text-muted-foreground">Manage your funds and transactions</p>
            </div>

            {/* Wallet Overview */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Wallet Balance</CardTitle>
                  <CardDescription>Your current available funds</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Wallet className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      {loading ? (
                        <div className="flex items-center">
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          <span className="text-muted-foreground">Loading...</span>
                        </div>
                      ) : (
                        <div className="text-3xl font-bold">${balance.toFixed(2)}</div>
                      )}
                      <p className="text-sm text-muted-foreground">Available Balance</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setIsAddFundsDialogOpen(true)}>
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Add Funds
                  </Button>
                  <Button variant="outline" onClick={() => setIsWithdrawDialogOpen(true)}>
                    <ArrowDownRight className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                </CardFooter>
              </Card>

              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Gems</CardTitle>
                  <CardDescription>Purchase gems to support creators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-violet-500/10 flex items-center justify-center">
                      <Gem className="h-8 w-8 text-violet-500" />
                    </div>
                    <div>
                      <div className="text-lg">
                        Give gems to your favorite creators to show support and help them earn more.
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => setIsBuyGemsDialogOpen(true)}>
                    <Gem className="h-4 w-4 mr-2" />
                    Buy Gems
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your recent wallet activity</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : recentTransactions.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No transactions yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(transaction.type)}
                              <span className="capitalize">{transaction.type.replace('_', ' ')}</span>
                            </div>
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {format(new Date(transaction.created_at), 'MMM d, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${Number(transaction.amount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Number(transaction.amount) >= 0 ? '+' : ''}{Number(transaction.amount).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>

      {/* Add Funds Dialog */}
      <Dialog open={isAddFundsDialogOpen} onOpenChange={setIsAddFundsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
            <DialogDescription>
              Add funds to your wallet to purchase items and services.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-8"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" onClick={() => setAmount('10')}>$10</Button>
              <Button variant="outline" onClick={() => setAmount('25')}>$25</Button>
              <Button variant="outline" onClick={() => setAmount('50')}>$50</Button>
              <Button variant="outline" onClick={() => setAmount('100')}>$100</Button>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <CreditCard className="h-4 w-4" />
                <span>Credit Card ending in 1234</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFundsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFunds} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Add Funds'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Withdraw funds from your wallet to your bank account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="withdraw-amount">Amount (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="withdraw-amount"
                  type="number"
                  min="1"
                  max={balance}
                  step="0.01"
                  placeholder="0.00"
                  className="pl-8"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Available balance: ${balance.toFixed(2)}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="withdraw-method">Withdrawal Method</Label>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <CreditCard className="h-4 w-4" />
                <span>Bank Account ending in 5678</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWithdrawDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleWithdraw} disabled={isProcessing || Number(amount) > balance}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Withdraw'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Buy Gems Dialog */}
      <Dialog open={isBuyGemsDialogOpen} onOpenChange={setIsBuyGemsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy Gems</DialogTitle>
            <DialogDescription>
              Purchase gems to support your favorite creators.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="gem-count">Number of Gems</Label>
              <Input
                id="gem-count"
                type="number"
                min="1"
                value={gemCount}
                onChange={(e) => setGemCount(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" onClick={() => setGemCount(10)}>10</Button>
              <Button variant="outline" onClick={() => setGemCount(20)}>20</Button>
              <Button variant="outline" onClick={() => setGemCount(50)}>50</Button>
              <Button variant="outline" onClick={() => setGemCount(100)}>100</Button>
            </div>
            <div className="p-4 bg-muted rounded-md">
              <div className="flex justify-between mb-2">
                <span>Price per gem:</span>
                <span>$1.00</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total cost:</span>
                <span>${(gemCount * 1).toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Available balance: ${balance.toFixed(2)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBuyGemsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBuyGems} 
              disabled={isProcessing || gemCount <= 0 || gemCount * 1 > balance}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Buy Gems'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}