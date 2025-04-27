import { useEffect } from 'react';
import { Link, useSearch } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

const PaymentFailed = () => {
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const type = searchParams.get('type') || '';
  
  // Set page title
  useEffect(() => {
    document.title = 'Payment Failed | The House of Cuts';
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="rounded-full bg-red-100 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
              
              <p className="text-gray-600 mb-6">
                {type === 'appointment'
                  ? "We couldn't process your payment for the appointment. Please try again or contact us for assistance."
                  : "We couldn't process your payment for this order. Please try again or contact us for assistance."}
              </p>
              
              <div className="mb-6 text-left bg-gray-100 p-4 rounded-md">
                <h3 className="font-bold mb-2">Common issues:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Insufficient funds</li>
                  <li>Incorrect card details</li>
                  <li>Card declined by bank</li>
                  <li>Connection issues</li>
                </ul>
              </div>
              
              <div className="flex flex-col space-y-3">
                {type === 'appointment' ? (
                  <Link href="/booking">
                    <Button className="w-full bg-secondary hover:bg-red-700">Try Again</Button>
                  </Link>
                ) : (
                  <Link href="/checkout">
                    <Button className="w-full bg-secondary hover:bg-red-700">Try Again</Button>
                  </Link>
                )}
                
                <Link href="/">
                  <Button variant="outline" className="w-full">Back to Home</Button>
                </Link>
                
                <Link href="#contact">
                  <Button variant="link" className="w-full">Contact Support</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
