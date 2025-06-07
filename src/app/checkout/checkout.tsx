import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSidebar } from "@/components/homepage/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/@/ui/sidebar";
import { SiteHeader } from "@/components/homepage/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/@/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/@/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/@/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/@/ui/tabs";
import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { 
  CreditCard, 
  Wallet, 
  Bitcoin, 
  ChevronLeft, 
  ShieldCheck, 
  Lock, 
  CreditCardIcon, 
  Loader2,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/@/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/@/ui/tooltip";
import { supabase } from "@/lib/supabase";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'crypto'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [walletBalance, setWalletBalance] = useState(500); // Mock wallet balance
  const [savePaymentInfo, setSavePaymentInfo] = useState(false);
  const [guestCheckout, setGuestCheckout] = useState(!user);
  const [orderId, setOrderId] = useState<string>('');
  
  // Form state
  const [formData, setFormData] = useState({
    // Billing info
    firstName: user?.user_metadata?.full_name?.split(' ')[0] || '',
    lastName: user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    
    // Card details
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    
    // Crypto details
    cryptoAddress: '',
    
    // Coupon
    couponCode: '',
  });
  
  // Calculate order summary
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const processingFee = subtotal * 0.03; // 3% processing fee
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax + processingFee;
  
  // Check if cart is empty and redirect if needed
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/');
    }
  }, [cart, navigate]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle payment method change
  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value as 'card' | 'wallet' | 'crypto');
  };
  
  // Apply coupon code
  const handleApplyCoupon = () => {
    if (formData.couponCode.trim()) {
      toast.info("Coupon code applied: 10% discount");
      // In a real app, you would validate the coupon code with the backend
    }
  };
  
  // Process payment
  const handleProcessPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check payment method specific validations
      if (paymentMethod === 'card') {
        // Validate card details
        if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
          throw new Error('Please fill in all card details');
        }
        
        // Basic card number validation
        if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
          throw new Error('Invalid card number');
        }
      } else if (paymentMethod === 'wallet') {
        // Check if wallet has enough balance
        if (walletBalance < total) {
          throw new Error('Insufficient wallet balance');
        }
      } else if (paymentMethod === 'crypto') {
        // Validate crypto address
        if (!formData.cryptoAddress) {
          throw new Error('Please enter a crypto wallet address');
        }
      }
      
      // Create order in database
      const orderData = {
        user_id: user?.id || null,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`,
        payment_method: paymentMethod,
        subtotal: subtotal,
        processing_fee: processingFee,
        tax: tax,
        total: total,
        status: 'completed',
        items: cart.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          type: item.type || 'Beat'
        }))
      };
      
      // If user is logged in, save order to database
      if (user) {
        // In a real app, you would save the order to your database
        // For this example, we'll just generate a random order ID
        const generatedOrderId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        setOrderId(generatedOrderId);
      } else {
        // For guest checkout, just generate a random order ID
        const generatedOrderId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        setOrderId(generatedOrderId);
      }
      
      // Simulate successful payment
      clearCart();
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Payment processing failed');
      setShowErrorDialog(true);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 animate-fade-in p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => navigate(-1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Checkout</h1>
                  <p className="text-muted-foreground">Complete your purchase</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  <span>Secure Checkout</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Checkout Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Account Options */}
                {!user && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Options</CardTitle>
                      <CardDescription>Sign in or continue as a guest</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => navigate('/auth/login')}
                        >
                          Sign In
                        </Button>
                        <Button 
                          variant={guestCheckout ? "default" : "outline"} 
                          className="flex-1"
                          onClick={() => setGuestCheckout(true)}
                        >
                          Continue as Guest
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Billing Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                    <CardDescription>Enter your billing details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          name="firstName" 
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="John"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          name="lastName" 
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          name="phone" 
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="(123) 456-7890"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address" 
                        name="address" 
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="123 Main St"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="city">City</Label>
                        <Input 
                          id="city" 
                          name="city" 
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="New York"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input 
                          id="state" 
                          name="state" 
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="NY"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">Zip Code</Label>
                        <Input 
                          id="zipCode" 
                          name="zipCode" 
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          placeholder="10001"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <select
                        id="country"
                        name="country"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.country}
                        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                        required
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Japan">Japan</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>Select your preferred payment method</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup 
                      value={paymentMethod} 
                      onValueChange={handlePaymentMethodChange}
                      className="space-y-4"
                    >
                      <div className={`flex items-center justify-between rounded-lg border p-4 ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : ''}`}>
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="card" id="card" />
                          <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                            <CreditCard className="h-5 w-5" />
                            <span>Credit / Debit Card</span>
                          </Label>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-6 w-10 rounded bg-blue-600"></div>
                          <div className="h-6 w-10 rounded bg-red-500"></div>
                          <div className="h-6 w-10 rounded bg-yellow-500"></div>
                        </div>
                      </div>
                      
                      {user && (
                        <div className={`flex items-center justify-between rounded-lg border p-4 ${paymentMethod === 'wallet' ? 'border-primary bg-primary/5' : ''}`}>
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="wallet" id="wallet" />
                            <Label htmlFor="wallet" className="flex items-center gap-2 cursor-pointer">
                              <Wallet className="h-5 w-5" />
                              <span>Wallet Balance</span>
                            </Label>
                          </div>
                          <div className="text-sm font-medium">
                            ${walletBalance.toFixed(2)} available
                          </div>
                        </div>
                      )}
                      
                      <div className={`flex items-center justify-between rounded-lg border p-4 ${paymentMethod === 'crypto' ? 'border-primary bg-primary/5' : ''}`}>
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="crypto" id="crypto" />
                          <Label htmlFor="crypto" className="flex items-center gap-2 cursor-pointer">
                            <Bitcoin className="h-5 w-5" />
                            <span>Cryptocurrency</span>
                          </Label>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">₿</div>
                          <div className="h-6 w-6 rounded-full bg-blue-400 flex items-center justify-center text-white text-xs font-bold">Ξ</div>
                        </div>
                      </div>
                    </RadioGroup>
                    
                    {/* Payment Method Details */}
                    <div className="mt-4">
                      {paymentMethod === 'card' && (
                        <div className="space-y-4 pt-4 border-t">
                          <div className="space-y-2">
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <div className="relative">
                              <Input 
                                id="cardNumber" 
                                name="cardNumber" 
                                value={formData.cardNumber}
                                onChange={(e) => setFormData(prev => ({ 
                                  ...prev, 
                                  cardNumber: formatCardNumber(e.target.value) 
                                }))}
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                className="pl-10"
                                required={paymentMethod === 'card'}
                              />
                              <CreditCardIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="cardName">Name on Card</Label>
                            <Input 
                              id="cardName" 
                              name="cardName" 
                              value={formData.cardName}
                              onChange={handleInputChange}
                              placeholder="John Doe"
                              required={paymentMethod === 'card'}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="expiryDate">Expiry Date</Label>
                              <Input 
                                id="expiryDate" 
                                name="expiryDate" 
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                                placeholder="MM/YY"
                                maxLength={5}
                                required={paymentMethod === 'card'}
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>3 or 4 digit security code on the back of your card</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <div className="relative">
                                <Input 
                                  id="cvv" 
                                  name="cvv" 
                                  value={formData.cvv}
                                  onChange={handleInputChange}
                                  placeholder="123"
                                  maxLength={4}
                                  className="pl-10"
                                  required={paymentMethod === 'card'}
                                />
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 pt-2">
                            <Checkbox 
                              id="savePaymentInfo" 
                              checked={savePaymentInfo}
                              onCheckedChange={(checked) => setSavePaymentInfo(!!checked)}
                            />
                            <label
                              htmlFor="savePaymentInfo"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Save payment information for future purchases
                            </label>
                          </div>
                        </div>
                      )}
                      
                      {paymentMethod === 'wallet' && (
                        <div className="space-y-4 pt-4 border-t">
                          <div className="rounded-lg border p-4 bg-muted/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-primary" />
                                <span className="font-medium">Current Balance</span>
                              </div>
                              <span className="font-bold">${walletBalance.toFixed(2)}</span>
                            </div>
                            
                            {walletBalance < total && (
                              <div className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                <XCircle className="h-4 w-4" />
                                <span>Insufficient balance for this purchase</span>
                              </div>
                            )}
                            
                            {walletBalance >= total && (
                              <div className="mt-2 text-sm text-green-500 flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Sufficient balance for this purchase</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            Your wallet balance will be debited immediately upon completing this purchase.
                          </div>
                        </div>
                      )}
                      
                      {paymentMethod === 'crypto' && (
                        <div className="space-y-4 pt-4 border-t">
                          <Tabs defaultValue="bitcoin" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="bitcoin">Bitcoin</TabsTrigger>
                              <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
                            </TabsList>
                            <TabsContent value="bitcoin" className="space-y-4 pt-4">
                              <div className="space-y-2">
                                <Label htmlFor="cryptoAddress">Your Bitcoin Address</Label>
                                <Input 
                                  id="cryptoAddress" 
                                  name="cryptoAddress" 
                                  value={formData.cryptoAddress}
                                  onChange={handleInputChange}
                                  placeholder="Enter your Bitcoin wallet address"
                                  required={paymentMethod === 'crypto'}
                                />
                              </div>
                              <div className="rounded-lg border p-4 bg-muted/20">
                                <p className="text-sm text-muted-foreground mb-2">
                                  Send exactly <span className="font-bold">0.00324 BTC</span> to:
                                </p>
                                <div className="p-2 bg-muted rounded-md text-xs font-mono break-all">
                                  bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                  The exchange rate will be locked for 15 minutes. Your order will be processed once the payment is confirmed on the blockchain.
                                </p>
                              </div>
                            </TabsContent>
                            <TabsContent value="ethereum" className="space-y-4 pt-4">
                              <div className="space-y-2">
                                <Label htmlFor="cryptoAddress">Your Ethereum Address</Label>
                                <Input 
                                  id="cryptoAddress" 
                                  name="cryptoAddress" 
                                  value={formData.cryptoAddress}
                                  onChange={handleInputChange}
                                  placeholder="Enter your Ethereum wallet address"
                                  required={paymentMethod === 'crypto'}
                                />
                              </div>
                              <div className="rounded-lg border p-4 bg-muted/20">
                                <p className="text-sm text-muted-foreground mb-2">
                                  Send exactly <span className="font-bold">0.0182 ETH</span> to:
                                </p>
                                <div className="p-2 bg-muted rounded-md text-xs font-mono break-all">
                                  0x71C7656EC7ab88b098defB751B7401B5f6d8976F
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                  The exchange rate will be locked for 15 minutes. Your order will be processed once the payment is confirmed on the blockchain.
                                </p>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Right Column - Order Summary */}
              <div className="space-y-6">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                    <CardDescription>Review your order details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Items */}
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          {item.artworkUrl && (
                            <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                              <img 
                                src={item.artworkUrl} 
                                alt={item.title} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.type || 'Beat'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Separator />
                    
                    {/* Coupon Code */}
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Coupon code" 
                        name="couponCode"
                        value={formData.couponCode}
                        onChange={handleInputChange}
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleApplyCoupon}
                        disabled={!formData.couponCode.trim()}
                      >
                        Apply
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    {/* Totals */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Processing Fee (3%)</span>
                        <span>${processingFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax (8%)</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-4">
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleProcessPayment}
                      disabled={isProcessing || (paymentMethod === 'wallet' && walletBalance < total)}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Complete Order
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      By completing this order, you agree to our{' '}
                      <a href="#" className="underline">Terms of Service</a> and{' '}
                      <a href="#" className="underline">Privacy Policy</a>.
                    </p>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
      
      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="h-5 w-5" />
              Order Successful
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>Your order has been successfully processed!</p>
            <div className="rounded-lg border p-4 bg-muted/20">
              <p className="font-medium">Order Details</p>
              <p className="text-sm text-muted-foreground">Order #: {orderId || Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}</p>
              <p className="text-sm text-muted-foreground">Total: ${total.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Payment Method: {
                paymentMethod === 'card' ? 'Credit/Debit Card' : 
                paymentMethod === 'wallet' ? 'Wallet Balance' : 
                'Cryptocurrency'
              }</p>
            </div>
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to {formData.email}. You can download your purchased items from your account dashboard.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setShowSuccessDialog(false);
              navigate('/orders/history');
            }}>
              View Order History
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <XCircle className="h-5 w-5" />
              Payment Failed
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>There was an error processing your payment:</p>
            <div className="rounded-lg border border-red-200 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400">
              {errorMessage}
            </div>
            <p className="text-sm text-muted-foreground">
              Please check your payment details and try again. If the problem persists, please contact customer support.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowErrorDialog(false)}>
              Try Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}