import { CheckCircle2 } from 'lucide-react';

interface BookingStepsProps {
  currentStep: number;
}

const BookingSteps: React.FC<BookingStepsProps> = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Select Service' },
    { number: 2, label: 'Choose Barber' },
    { number: 3, label: 'Pick Date & Time' },
    { number: 4, label: 'Your Details' }
  ];

  return (
    <div className="flex justify-center mb-10">
      {steps.map((step, index) => (
        <div key={step.number} className="relative">
          <div className="flex items-center">
            <div 
              className={`z-10 flex items-center justify-center w-10 h-10 rounded-full font-bold
                ${currentStep > step.number 
                  ? 'bg-green-500 text-white' 
                  : currentStep === step.number 
                    ? 'bg-secondary text-white' 
                    : 'bg-gray-300 text-primary'}`}
            >
              {currentStep > step.number ? <CheckCircle2 className="h-6 w-6" /> : step.number}
            </div>
            <div className="hidden md:block ml-2 mr-16 text-sm font-medium text-gray-500">
              <span className={currentStep >= step.number ? 'text-primary font-medium' : ''}>
                {step.label}
              </span>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div 
              className={`hidden md:block absolute top-5 left-10 w-[calc(100%-20px)] h-0.5 
                ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'}`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BookingSteps;
