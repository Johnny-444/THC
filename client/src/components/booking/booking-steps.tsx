import React from 'react';
import { useBooking } from '@/context/booking-context';
import ServiceSelection from './service-selection';
import BarberSelection from './barber-selection';
import DateTimeSelection from './date-time-selection';
import CustomerDetailsForm from './customer-details';
import InteractiveCalendar from './interactive-calendar';

interface BookingStepsProps {
  currentStep: number;
}

const BookingSteps: React.FC<BookingStepsProps> = ({ currentStep }) => {
  const { resetBooking } = useBooking();

  // Legacy step-by-step booking flow
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ServiceSelection />;
      case 2:
        return <BarberSelection />;
      case 3:
        return <DateTimeSelection />;
      case 4:
        return <CustomerDetailsForm />;
      default:
        return <div>Invalid step</div>;
    }
  };

  // Use the unified interactive calendar for the first 3 steps
  // and only show customer details form for the last step
  return (
    <div className="w-full max-w-6xl mx-auto">
      {currentStep < 4 ? (
        <InteractiveCalendar />
      ) : (
        <CustomerDetailsForm />
      )}
    </div>
  );
};

export default BookingSteps;