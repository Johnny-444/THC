import { useEffect } from 'react';
import { useBooking } from '@/context/booking-context';
import BookingSteps from '@/components/booking/booking-steps';
import CustomerDetails from '@/components/booking/customer-details';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Scissors, User, Clock, CreditCard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  
  // Get the active tab value based on current step
  const activeTab = `step-${currentStep}`;
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    const stepNumber = parseInt(value.split('-')[1]);
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber);
    }
  };
  
  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-heading text-center mb-6">BOOK YOUR APPOINTMENT</h2>
        
        {/* Progress tabs - only shown for interactive calendar view (steps 1-3) */}
        {currentStep < 4 ? (
          <Tabs 
            value={activeTab} 
            onValueChange={handleTabChange} 
            className="mb-8 max-w-md mx-auto"
          >
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="step-1" className="flex flex-col items-center py-3 data-[state=active]:bg-secondary data-[state=active]:text-white">
                <Scissors className="h-4 w-4 mb-1" />
                <span className="text-xs">Service</span>
              </TabsTrigger>
              <TabsTrigger value="step-2" disabled={!selectedService} className="flex flex-col items-center py-3 data-[state=active]:bg-secondary data-[state=active]:text-white">
                <User className="h-4 w-4 mb-1" />
                <span className="text-xs">Barber</span>
              </TabsTrigger>
              <TabsTrigger value="step-3" disabled={!selectedBarber} className="flex flex-col items-center py-3 data-[state=active]:bg-secondary data-[state=active]:text-white">
                <Clock className="h-4 w-4 mb-1" />
                <span className="text-xs">Date/Time</span>
              </TabsTrigger>
              <TabsTrigger value="step-4" disabled={!selectedTime} className="flex flex-col items-center py-3 data-[state=active]:bg-secondary data-[state=active]:text-white">
                <CreditCard className="h-4 w-4 mb-1" />
                <span className="text-xs">Payment</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        ) : (
          // Show step indicator for customer details step
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
        )}
        
        {/* Back Button (for steps 2-4) */}
        {currentStep > 1 && (
          <div className="mb-4">
            <Button variant="ghost" onClick={goToPreviousStep} className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        )}
        
        {/* Booking Steps - Uses our interactive calendar for steps 1-3 */}
        <BookingSteps currentStep={currentStep} />
        
        {/* Booking Summary (shown on step 4) */}
        {currentStep === 4 && selectedService && (
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
    </section>
  );
};

export default Booking;
