import { useEffect } from 'react';
import { useBooking } from '@/context/booking-context';
import BookingSteps from '@/components/booking/booking-steps';
import ServiceSelection from '@/components/booking/service-selection';
import BarberSelection from '@/components/booking/barber-selection';
import DateTimeSelection from '@/components/booking/date-time-selection';
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
        <h2 className="text-4xl font-heading text-center mb-12">BOOK YOUR APPOINTMENT</h2>
        
        {/* Booking Steps Indicator */}
        <BookingSteps currentStep={currentStep} />
        
        {/* Back Button (for steps 2-4) */}
        {currentStep > 1 && (
          <div className="mb-4">
            <Button variant="ghost" onClick={goToPreviousStep} className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        )}
        
        {/* Step 1: Service Selection */}
        {currentStep === 1 && <ServiceSelection />}
        
        {/* Step 2: Barber Selection */}
        {currentStep === 2 && selectedService && (
          <div className={currentStep === 2 ? '' : 'opacity-50 pointer-events-none'}>
            <BarberSelection />
          </div>
        )}
        
        {/* Step 3: Date & Time Selection */}
        {currentStep === 3 && selectedService && selectedBarber && (
          <div className={currentStep === 3 ? '' : 'opacity-50 pointer-events-none'}>
            <DateTimeSelection />
          </div>
        )}
        
        {/* Step 4: Customer Details & Payment */}
        {currentStep === 4 && selectedService && selectedBarber && selectedDate && selectedTime && (
          <div className={currentStep === 4 ? '' : 'opacity-50 pointer-events-none'}>
            <h3 className="text-2xl font-heading mb-4">Your Details</h3>
            <CustomerDetails />
          </div>
        )}
        
        {/* Booking Summary (shown on steps 2-4) */}
        {currentStep > 1 && selectedService && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="font-bold">Current Selection:</p>
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
    </section>
  );
};

export default Booking;
