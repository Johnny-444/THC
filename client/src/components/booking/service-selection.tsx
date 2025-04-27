import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBooking } from '@/context/booking-context';
import { Service, Category } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const ServiceSelection = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const { selectedService, setSelectedService, goToNextStep } = useBooking();
  
  // Fetch service categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories/service'],
  });
  
  // Fetch services
  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ['/api/services', selectedCategoryId],
    queryFn: async () => {
      const url = selectedCategoryId 
        ? `/api/services?categoryId=${selectedCategoryId}` 
        : '/api/services';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch services');
      return res.json();
    }
  });
  
  // Set the first category as selected when data loads
  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);
  
  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
  };
  
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    goToNextStep();
  };
  
  // We won't show a loading indicator anymore
  if (categoriesLoading || servicesLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-500">Loading services...</div>
      </div>
    );
  }
  
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-2xl font-heading">Select Service</h3>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={!selectedCategoryId ? "default" : "outline"}
            onClick={() => setSelectedCategoryId(null)}
          >
            All
          </Button>
          {categories?.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategoryId === category.id ? "default" : "outline"}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services?.map((service) => (
          <Card 
            key={service.id} 
            className={`service-card overflow-hidden cursor-pointer ${
              selectedService?.id === service.id ? 'ring-2 ring-secondary' : ''
            }`}
          >
            <CardContent className="p-6">
              <h4 className="text-xl font-bold mb-2">{service.name}</h4>
              <p className="text-neutral mb-4">{service.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">${service.price.toString()}</span>
                <span className="text-sm text-neutral">{service.duration} min</span>
              </div>
            </CardContent>
            <div 
              className={`px-6 py-3 text-white text-center cursor-pointer
                ${selectedService?.id === service.id 
                  ? 'bg-secondary' 
                  : 'bg-primary hover:bg-secondary transition-colors'}`}
              onClick={() => handleServiceSelect(service)}
            >
              {selectedService?.id === service.id ? 'Selected' : 'Select'}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServiceSelection;
