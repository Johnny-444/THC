import { useEffect } from 'react';
import { useBooking } from '@/context/booking-context';
import InteractiveCalendar from '@/components/booking/interactive-calendar';
import CustomerDetails from '@/components/booking/customer-details';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Booking = () => {
  const { 
    currentStep, 
    setCurrentStep,
    selectedService,
    selectedBarber,
    selectedDate,
    selectedTime,
    goToPreviousStep
  } = useBooking();
  
  // Reset to step 1 when component mounts
  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);
  
  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-heading text-center mb-6">BOOK YOUR APPOINTMENT</h2>
        
        {/* Back Button (for steps 2-4) */}
        {currentStep > 1 && (
          <div className="mb-4">
            <Button variant="ghost" onClick={goToPreviousStep} className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        )}
        
        {/* Booking content */}
        {currentStep < 4 ? (
          <InteractiveCalendar />
        ) : (
          <div>
            {/* Simple progress indicator for customer details step */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary text-white">
                  1
                </div>
                <div className="w-16 h-1 bg-secondary"></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary text-white">
                  2
                </div>
                <div className="w-16 h-1 bg-secondary"></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary text-white">
                  3
                </div>
                <div className="w-16 h-1 bg-secondary"></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary text-white">
                  4
                </div>
              </div>
            </div>
            
            {/* Customer details form */}
            <CustomerDetails />
            
            {/* Booking Summary */}
            {selectedService && (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg max-w-md mx-auto">
                <p className="font-bold">Appointment Summary:</p>
                <p><span className="font-medium">Service:</span> {selectedService.name} (${selectedService.price.toString()})</p>
                {selectedBarber && <p><span className="font-medium">Barber:</span> {selectedBarber.name}</p>}
                {selectedDate && selectedTime && (
                  <p>
                    <span className="font-medium">Date & Time:</span> {selectedDate.toLocaleDateString()} at {selectedTime}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Booking;
