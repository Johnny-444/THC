import { useEffect } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
  const [location] = useLocation();
  const search = useLocation()[1].search;
  const searchParams = new URLSearchParams(search);
  const type = searchParams.get('type') || '';
  const id = searchParams.get('id') || '';
  
  // Set page title
  useEffect(() => {
    document.title = 'Payment Successful | The House of Cuts';
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="rounded-full bg-green-100 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful</h1>
              
              {type === 'appointment' ? (
                <>
                  <p className="text-gray-600 mb-6">
                    Thank you for booking an appointment with us! Your appointment has been confirmed.
                    A confirmation email has been sent to your email address.
                  </p>
                  <div className="mb-6 text-left bg-gray-100 p-4 rounded-md">
                    <h3 className="font-bold mb-2">Appointment Details</h3>
                    <p>Appointment ID: {id}</p>
                    <p>Please arrive 10 minutes before your scheduled time.</p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-600 mb-6">
                    Thank you for your purchase! Your order has been confirmed and is being processed.
                    You will receive a confirmation email with your order details shortly.
                  </p>
                  <div className="mb-6 text-left bg-gray-100 p-4 rounded-md">
                    <h3 className="font-bold mb-2">Order Details</h3>
                    <p>Order ID: {id}</p>
                    <p>Your products will be shipped within 1-2 business days.</p>
                  </div>
                </>
              )}
              
              <div className="flex flex-col space-y-3">
                <Link href="/">
                  <Button className="w-full">Back to Home</Button>
                </Link>
                {type === 'appointment' ? (
                  <Link href="/booking">
                    <Button variant="outline" className="w-full">Book Another Appointment</Button>
                  </Link>
                ) : (
                  <Link href="/shop">
                    <Button variant="outline" className="w-full">Continue Shopping</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
