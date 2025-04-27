import { useQuery } from '@tanstack/react-query';
import { useBooking } from '@/context/booking-context';
import { Barber } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const BarberSelection = () => {
  const { selectedBarber, setSelectedBarber, goToNextStep } = useBooking();
  
  const { data: barbers, isLoading } = useQuery<Barber[]>({
    queryKey: ['/api/barbers'],
  });
  
  const handleBarberSelect = (barber: Barber) => {
    setSelectedBarber(barber);
    goToNextStep();
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-500">Loading barbers...</div>
      </div>
    );
  }
  
  return (
    <div className="mb-8">
      <h3 className="text-2xl font-heading mb-4">Choose Barber</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {barbers?.map((barber) => (
          <Card 
            key={barber.id} 
            className={`overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${
              selectedBarber?.id === barber.id ? 'ring-2 ring-secondary' : ''
            }`}
            onClick={() => handleBarberSelect(barber)}
          >
            <img 
              src={barber.imageUrl} 
              alt={`Barber ${barber.name}`} 
              className="w-full h-48 object-cover" 
            />
            <CardContent className="p-4">
              <h4 className="text-lg font-bold mb-1">{barber.name}</h4>
              <p className="text-neutral text-sm mb-2">{barber.title}</p>
              <div className="flex text-secondary">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="h-5 w-5" 
                    fill={i < Math.floor(Number(barber.rating)) ? "currentColor" : "none"} 
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BarberSelection;
