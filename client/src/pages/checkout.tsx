import { useState, useEffect } from 'react';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

if (!stripePromise) {
  console.warn('Stripe public key is missing. Payment processing will not work correctly.');
}

// Schema for form validation
const formSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
  address: z.string().min(5, { message: 'Please enter a valid address' }),
  city: z.string().min(2, { message: 'Please enter a valid city' }),
  state: z.string().min(2, { message: 'Please enter a valid state' }),
  zipCode: z.string().min(5, { message: 'Please enter a valid zip code' }),
});

type CheckoutFormValues = z.infer<typeof formSchema>;

const CheckoutPage = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [shippingInfo, setShippingInfo] = useState<CheckoutFormValues | null>(null);
  const { cartItems, cartTotal, shippingCost, cartId } = useCart();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // Redirect to shop if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Please add some items to your cart before checking out",
      });
      navigate('/shop');
    }
  }, [cartItems, navigate, toast]);
  
  if (cartItems.length === 0) {
    return null; // Avoid rendering the form if cart is empty
  }
  
  if (clientSecret) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-heading text-center mb-8">Complete Your Purchase</h2>
          
          <div className="max-w-3xl mx-auto">
            <Elements stripe={stripePromise!} options={{ clientSecret }}>
              <PaymentForm 
                cartId={cartId}
                totalAmount={(cartTotal + shippingCost).toFixed(2)}
                shippingInfo={shippingInfo!}
              />
            </Elements>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-heading text-center mb-8">Checkout</h2>
        
        <div className="flex justify-between flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
          <ShippingForm 
            onComplete={(data) => {
              setShippingInfo(data);
              
              // Create a payment intent
              apiRequest('POST', '/api/create-product-payment', {
                cartId,
                amount: cartTotal + shippingCost
              })
                .then(res => res.json())
                .then(data => {
                  setClientSecret(data.clientSecret);
                })
                .catch(error => {
                  toast({
                    title: 'Error',
                    description: 'Failed to initialize payment. Please try again.',
                    variant: 'destructive',
                  });
                });
            }}
          />
          
          <OrderSummary 
            cartItems={cartItems} 
            cartTotal={cartTotal} 
            shippingCost={shippingCost} 
          />
        </div>
      </div>
    </section>
  );
};

interface ShippingFormProps {
  onComplete: (data: CheckoutFormValues) => void;
}

const ShippingForm: React.FC<ShippingFormProps> = ({ onComplete }) => {
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
  });
  
  const onSubmit = (data: CheckoutFormValues) => {
    onComplete(data);
  };
  
  return (
    <div className="w-full lg:w-3/5">
      <Card>
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-secondary hover:bg-red-700"
              >
                Continue to Payment
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

interface OrderSummaryProps {
  cartItems: any[];
  cartTotal: number;
  shippingCost: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ cartItems, cartTotal, shippingCost }) => {
  return (
    <div className="w-full lg:w-2/5">
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-md overflow-hidden mr-4">
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-neutral">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-medium">
                  ${(Number(item.product.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${shippingCost.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${(cartTotal + shippingCost).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface PaymentFormProps {
  cartId: string;
  totalAmount: string;
  shippingInfo: CheckoutFormValues;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ cartId, totalAmount, shippingInfo }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const { clearCart } = useCart();
  const [_, navigate] = useLocation();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setIsProcessing(true);
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/payment-success?type=product&id=' + cartId,
      },
      redirect: 'if_required',
    });
    
    if (error) {
      toast({
        title: 'Payment Failed',
        description: error.message || 'An error occurred during payment processing',
        variant: 'destructive',
      });
      setIsProcessing(false);
      navigate('/payment-failed?type=product');
    } else {
      // Payment succeeded
      toast({
        title: 'Payment Successful',
        description: 'Your order has been placed successfully!',
      });
      clearCart();
      setIsProcessing(false);
      navigate('/payment-success?type=product');
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 mr-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>Payment Information</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Shipping To</h3>
          <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
          <p>{shippingInfo.address}</p>
          <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
          <p>{shippingInfo.email}</p>
          <p>{shippingInfo.phone}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Card Details</h3>
            <PaymentElement />
          </div>
          
          <div className="border-t border-gray-200 py-4 mb-6">
            <div className="flex justify-between font-bold">
              <span>Total Amount:</span>
              <span>${totalAmount}</span>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-secondary hover:bg-red-700"
            disabled={!stripe || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-center text-sm text-neutral">
        <div className="flex items-center">
          <ShoppingBag className="h-4 w-4 mr-2" />
          <span>Your order is secure and encrypted</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CheckoutPage;
