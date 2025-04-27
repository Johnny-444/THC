import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useBooking } from '@/context/booking-context';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useLocation } from 'wouter';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
  notes: z.string().optional(),
});

type CustomerDetailsFormValues = z.infer<typeof formSchema>;

const CustomerDetailsForm = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [appointmentId, setAppointmentId] = useState<number | null>(null);
  const { selectedService, selectedBarber, selectedDate, selectedTime, resetBooking } = useBooking();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  const form = useForm<CustomerDetailsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      notes: '',
    },
  });
  
  // Create appointment mutation
  const createAppointment = useMutation({
    mutationFn: async (formData: CustomerDetailsFormValues) => {
      if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) {
        throw new Error('Missing booking information');
      }
      
      const appointmentData = {
        serviceId: selectedService.id,
        barberId: selectedBarber.id,
        date: selectedDate,
        time: selectedTime,
        timeOfDay: selectedTime.includes('AM') 
          ? 'morning' 
          : (parseInt(selectedTime.split(':')[0]) < 5 || selectedTime.startsWith('12:')) && selectedTime.includes('PM') 
            ? 'afternoon' 
            : 'evening',
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes || '',
        totalPrice: selectedService.price,
      };
      
      const res = await apiRequest('POST', '/api/appointments', appointmentData);
      return res.json();
    },
    onSuccess: async (data) => {
      setAppointmentId(data.id);
      
      try {
        // Create payment intent for the appointment
        const paymentRes = await apiRequest('POST', '/api/create-appointment-payment', {
          appointmentId: data.id,
          amount: selectedService?.price,
        });
        
        const { clientSecret } = await paymentRes.json();
        setClientSecret(clientSecret);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to initialize payment. Please try again.',
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create appointment',
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (formData: CustomerDetailsFormValues) => {
    createAppointment.mutate(formData);
  };
  
  if (clientSecret) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-bold mb-4">Payment Information</h4>
        <div className="mb-4">
          <Elements stripe={stripePromise!} options={{ clientSecret }}>
            <PaymentForm 
              appointmentId={appointmentId!}
              totalPrice={selectedService?.price.toString() || '0'}
              resetBooking={resetBooking}
            />
          </Elements>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
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
                    <Input placeholder="Enter your first name" {...field} />
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
                    <Input placeholder="Enter your last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" type="email" {...field} />
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
                    <Input placeholder="Enter your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any special requests or information for your barber" 
                    rows={3} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Card className="border border-gray-200 rounded-md">
            <CardContent className="pt-4">
              <h4 className="font-bold mb-2">Booking Summary</h4>
              <div className="flex justify-between mb-2">
                <span className="text-neutral">Service:</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-neutral">Barber:</span>
                <span className="font-medium">{selectedBarber?.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-neutral">Date:</span>
                <span className="font-medium">
                  {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-neutral">Time:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-gray-200 pt-2">
                <span>Total:</span>
                <span>${selectedService?.price.toString()}</span>
              </div>
            </CardContent>
          </Card>
          
          <Button 
            type="submit" 
            className="w-full bg-secondary hover:bg-red-700"
            disabled={createAppointment.isPending}
          >
            {createAppointment.isPending ? 'Processing...' : 'Proceed to Payment'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

interface PaymentFormProps {
  appointmentId: number;
  totalPrice: string;
  resetBooking: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ appointmentId, totalPrice, resetBooking }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
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
        return_url: window.location.origin + '/payment-success?type=appointment&id=' + appointmentId,
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
      navigate('/payment-failed?type=appointment');
    } else {
      // Payment succeeded
      toast({
        title: 'Payment Successful',
        description: 'Your appointment has been confirmed!',
      });
      setIsProcessing(false);
      resetBooking();
      navigate('/payment-success?type=appointment&id=' + appointmentId);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <h4 className="text-lg font-bold mb-4">Payment Details</h4>
        <PaymentElement />
      </div>
      
      <div className="border-t border-gray-200 py-4 mb-6">
        <div className="flex justify-between font-bold">
          <span>Total Amount:</span>
          <span>${totalPrice}</span>
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
  );
};

export default CustomerDetailsForm;
