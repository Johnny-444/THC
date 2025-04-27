import { createContext, useContext, useState, ReactNode } from 'react';
import { Service, Barber } from '@shared/schema';

interface BookingContextType {
  currentStep: number;
  selectedService: Service | null;
  selectedBarber: Barber | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  
  setCurrentStep: (step: number) => void;
  setSelectedService: (service: Service | null) => void;
  setSelectedBarber: (barber: Barber | null) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTime: (time: string | null) => void;
  
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const goToNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const resetBooking = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedBarber(null);
    setSelectedDate(null);
    setSelectedTime(null);
  };
  
  return (
    <BookingContext.Provider
      value={{
        currentStep,
        selectedService,
        selectedBarber,
        selectedDate,
        selectedTime,
        
        setCurrentStep,
        setSelectedService,
        setSelectedBarber,
        setSelectedDate,
        setSelectedTime,
        
        goToNextStep,
        goToPreviousStep,
        resetBooking
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

// Custom hook to use the booking context
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
