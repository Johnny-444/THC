import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, addWeeks, isSameDay, parseISO, isBefore } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { useBooking } from '@/context/booking-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Service, Barber } from '@shared/schema';

// Helper function to get time period (morning, afternoon, evening)
const getTimePeriod = (time: string) => {
  if (time.includes('AM')) return 'morning';
  if (time.startsWith('12:') || parseInt(time.split(':')[0]) < 5) return 'afternoon';
  return 'evening';
};

const InteractiveCalendar = () => {
  const {
    selectedService, setSelectedService,
    selectedBarber, setSelectedBarber,
    selectedDate, setSelectedDate,
    selectedTime, setSelectedTime,
    goToNextStep
  } = useBooking();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [timePeriod, setTimePeriod] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  
  // Fetch services
  const { data: services } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });
  
  // Fetch barbers
  const { data: barbers } = useQuery<Barber[]>({
    queryKey: ['/api/barbers'],
  });
  
  // Fetch available time slots when date and barber changes
  useEffect(() => {
    if (selectedDate && selectedBarber) {
      const fetchTimeSlots = async () => {
        try {
          const formattedDate = format(selectedDate, 'yyyy-MM-dd');
          const response = await apiRequest('GET', `/api/time-slots?date=${formattedDate}&barberId=${selectedBarber.id}`);
          const slots = await response.json();
          setAvailableTimes(slots);
        } catch (error) {
          console.error('Error fetching time slots:', error);
          setAvailableTimes([]);
        }
      };
      
      fetchTimeSlots();
    }
  }, [selectedDate, selectedBarber]);
  
  // Filter times by period (morning, afternoon, evening)
  const filteredTimes = availableTimes.filter(time => {
    const period = getTimePeriod(time);
    return period === timePeriod;
  });
  
  // Check if user can proceed to next step
  const canProceed = selectedService && selectedBarber && selectedDate && selectedTime;
  
  // Render time slots grid
  const renderTimeSlots = () => {
    if (!selectedDate || !selectedBarber) {
      return (
        <div className="text-center text-gray-500 py-4">
          Please select a date and barber to see available time slots
        </div>
      );
    }
    
    if (filteredTimes.length === 0) {
      return (
        <div className="text-center text-gray-500 py-4">
          No available time slots for this {timePeriod}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-3 gap-2 mt-2">
        {filteredTimes.map((time) => (
          <Button
            key={time}
            variant={selectedTime === time ? "default" : "outline"}
            className={selectedTime === time ? "bg-secondary text-white" : ""}
            onClick={() => setSelectedTime(time)}
          >
            {time}
          </Button>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Services Selection Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Select Service
            </h3>
            <div className="space-y-2">
              {services?.map((service) => (
                <Button
                  key={service.id}
                  variant={selectedService?.id === service.id ? "default" : "outline"}
                  className={`w-full justify-between ${
                    selectedService?.id === service.id ? "bg-secondary text-white" : ""
                  }`}
                  onClick={() => setSelectedService(service)}
                >
                  <span>{service.name}</span>
                  <span>${service.price}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Barbers Selection Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <User className="mr-2 h-5 w-5" />
              Select Barber
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {barbers?.map((barber) => (
                <div
                  key={barber.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedBarber?.id === barber.id
                      ? "border-secondary bg-secondary/10"
                      : "border-gray-200 hover:border-secondary"
                  }`}
                  onClick={() => setSelectedBarber(barber)}
                >
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={barber.imageUrl || ""} alt={barber.name} />
                      <AvatarFallback>{barber.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{barber.name}</p>
                      <p className="text-sm text-gray-500">{barber.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Date Selection Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Select Date
            </h3>
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => isBefore(date, new Date()) || date.getDay() === 0}
              initialFocus
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Time Selection Card */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Select Time
          </h3>
          <Tabs 
            defaultValue="morning" 
            onValueChange={(value) => setTimePeriod(value as 'morning' | 'afternoon' | 'evening')}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="morning">Morning</TabsTrigger>
              <TabsTrigger value="afternoon">Afternoon</TabsTrigger>
              <TabsTrigger value="evening">Evening</TabsTrigger>
            </TabsList>
            
            <TabsContent value="morning" className="mt-0">
              {renderTimeSlots()}
            </TabsContent>
            <TabsContent value="afternoon" className="mt-0">
              {renderTimeSlots()}
            </TabsContent>
            <TabsContent value="evening" className="mt-0">
              {renderTimeSlots()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Booking Summary Card */}
      <Card className="bg-white">
        <CardContent className="pt-6">
          <h3 className="text-lg font-bold mb-4">Booking Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">{selectedService?.name || '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Barber:</span>
              <span className="font-medium">{selectedBarber?.name || '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{selectedTime || '—'}</span>
            </div>
            {selectedService && (
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="font-bold">Total:</span>
                <span className="font-bold">${selectedService.price}</span>
              </div>
            )}
          </div>
          
          <Button
            onClick={goToNextStep}
            disabled={!canProceed}
            className="w-full mt-6 bg-secondary hover:bg-red-700"
          >
            Continue to Customer Details
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveCalendar;