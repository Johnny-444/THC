import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, addWeeks, isSameDay, parseISO, isBefore, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, getDate, getDay, isWithinInterval, isEqual } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { useBooking } from '@/context/booking-context';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
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
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Clock, User, PlusCircle, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Service, Barber } from '@shared/schema';

// Helper function to get time period (morning, afternoon, evening)
const getTimePeriod = (time: string) => {
  if (time.includes('AM')) return 'morning';
  if (time.startsWith('12:') || parseInt(time.split(':')[0]) < 5) return 'afternoon';
  return 'evening';
};

type TimeSlot = {
  time: string;
  isAvailable: boolean;
};

const InteractiveCalendar = () => {
  const {
    selectedService, setSelectedService,
    selectedBarber, setSelectedBarber,
    selectedDate, setSelectedDate,
    selectedTime, setSelectedTime,
    goToNextStep
  } = useBooking();

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [timePeriod, setTimePeriod] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [showServiceSelect, setShowServiceSelect] = useState(false);
  const [showBarberSelect, setShowBarberSelect] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  
  // Fetch services
  const { data: services } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });
  
  // Fetch barbers
  const { data: barbers } = useQuery<Barber[]>({
    queryKey: ['/api/barbers'],
  });
  
  // Initialize week days when component mounts
  useEffect(() => {
    const today = new Date();
    updateWeekDays(today);
    setSelectedDay(today);
    setSelectedDate(today);
  }, [setSelectedDate]);
  
  // Update week days when date changes
  const updateWeekDays = (date: Date) => {
    const startDate = startOfWeek(date, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
    setWeekDays(weekDays);
  };
  
  // Navigate to previous or next week
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' 
      ? addDays(weekDays[0], -7) 
      : addDays(weekDays[0], 7);
    updateWeekDays(newDate);
  };
  
  // Format month heading
  const getMonthYearDisplay = () => {
    const firstDay = weekDays[0];
    const lastDay = weekDays[6];
    
    if (firstDay && lastDay) {
      if (firstDay.getMonth() === lastDay.getMonth()) {
        return format(firstDay, 'MMMM yyyy');
      } else {
        return `${format(firstDay, 'MMMM')} - ${format(lastDay, 'MMMM yyyy')}`;
      }
    }
    return format(currentMonth, 'MMMM yyyy');
  };
  
  // Handle day selection
  const handleDaySelect = (day: Date) => {
    setSelectedDay(day);
    setSelectedDate(day);
  };
  
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
  
  // Check if the user can proceed to the next step
  const canProceed = selectedService && selectedBarber && selectedDate && selectedTime;
  
  // Add a service to the selection
  const addService = (service: Service) => {
    setSelectedService(service);
    setSelectedServices([service]);
    setShowServiceSelect(false);
  };
  
  // Update the selected barber
  const selectBarber = (barber: Barber) => {
    setSelectedBarber(barber);
    setShowBarberSelect(false);
  };
  
  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };
  
  return (
    <div className="relative bg-white rounded-lg shadow-lg max-w-4xl mx-auto z-10">
      {/* Modal header with month/year and close button */}
      <div className="flex justify-between items-center p-5 border-b">
        <h2 className="text-xl font-bold">{getMonthYearDisplay()}</h2>
        <button className="p-1 rounded-full hover:bg-gray-100">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      {/* Calendar days row */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => navigateWeek('prev')} 
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex space-x-2 overflow-x-auto">
            {weekDays.map((day, index) => (
              <button
                key={index}
                className={`flex flex-col items-center justify-center min-w-[70px] p-3 rounded-lg transition-all ${
                  selectedDay && isSameDay(day, selectedDay)
                    ? 'bg-[#2193b0] text-white'
                    : 'hover:bg-gray-100'
                } ${
                  // Disable past days
                  isBefore(day, new Date()) && !isToday(day)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
                onClick={() => !isBefore(day, new Date()) && handleDaySelect(day)}
                disabled={isBefore(day, new Date()) && !isToday(day)}
              >
                <span className="text-sm font-medium">
                  {format(day, 'EEE')}
                </span>
                <span className="text-lg font-bold my-1">
                  {format(day, 'd')}
                </span>
                {isToday(day) && (
                  <div className="h-1 w-10 bg-green-500 rounded-full mt-1" />
                )}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => navigateWeek('next')} 
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Time period tabs */}
      <div className="border-b">
        <Tabs 
          defaultValue="morning" 
          onValueChange={(value) => setTimePeriod(value as 'morning' | 'afternoon' | 'evening')}
        >
          <TabsList className="grid grid-cols-3 rounded-none border-0">
            <TabsTrigger 
              value="morning" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#2193b0] data-[state=active]:shadow-none rounded-none"
            >
              Morning
            </TabsTrigger>
            <TabsTrigger 
              value="afternoon" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#2193b0] data-[state=active]:shadow-none rounded-none"
            >
              Afternoon
            </TabsTrigger>
            <TabsTrigger 
              value="evening" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#2193b0] data-[state=active]:shadow-none rounded-none"
            >
              Evening
            </TabsTrigger>
          </TabsList>
          
          {/* Time slots */}
          <div className="p-4">
            <TabsContent value="morning" className="m-0">
              <div className="flex flex-wrap gap-2">
                {filteredTimes.length > 0 ? (
                  filteredTimes.map((time) => (
                    <Button
                      key={time}
                      variant="outline"
                      className={`rounded-md border ${
                        selectedTime === time 
                          ? 'bg-[#2193b0] text-white border-[#2193b0]' 
                          : 'border-gray-300'
                      }`}
                      onClick={() => handleTimeSelect(time)}
                    >
                      {time}
                    </Button>
                  ))
                ) : (
                  <p className="text-gray-500 w-full text-center py-4">
                    No available time slots in the morning
                  </p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="afternoon" className="m-0">
              <div className="flex flex-wrap gap-2">
                {filteredTimes.length > 0 ? (
                  filteredTimes.map((time) => (
                    <Button
                      key={time}
                      variant="outline"
                      className={`rounded-md border ${
                        selectedTime === time 
                          ? 'bg-[#2193b0] text-white border-[#2193b0]' 
                          : 'border-gray-300'
                      }`}
                      onClick={() => handleTimeSelect(time)}
                    >
                      {time}
                    </Button>
                  ))
                ) : (
                  <p className="text-gray-500 w-full text-center py-4">
                    No available time slots in the afternoon
                  </p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="evening" className="m-0">
              <div className="flex flex-wrap gap-2">
                {filteredTimes.length > 0 ? (
                  filteredTimes.map((time) => (
                    <Button
                      key={time}
                      variant="outline"
                      className={`rounded-md border ${
                        selectedTime === time 
                          ? 'bg-[#2193b0] text-white border-[#2193b0]' 
                          : 'border-gray-300'
                      }`}
                      onClick={() => handleTimeSelect(time)}
                    >
                      {time}
                    </Button>
                  ))
                ) : (
                  <p className="text-gray-500 w-full text-center py-4">
                    No available time slots in the evening
                  </p>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      {/* Selected service & barber summary */}
      <div className="p-4 border-b">
        {/* Service section */}
        {selectedServices.length > 0 ? (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold">{selectedService?.name}</h3>
              <p className="text-gray-600">{selectedTime && selectedDate ? `${format(selectedDate, 'MMM d, yyyy')} · ${selectedTime} - ${selectedTime.split(':')[0] === '11' ? '12:00 PM' : `${parseInt(selectedTime.split(':')[0]) + 1}:00 ${selectedTime.includes('AM') ? 'AM' : 'PM'}`}` : 'No time selected'}</p>
              <p className="text-[#2193b0]">${selectedService?.price}</p>
            </div>
            <button 
              className="text-[#2193b0]"
              onClick={() => setShowServiceSelect(true)}
            >
              Change
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <Button 
              variant="outline" 
              className="w-full flex justify-between items-center border-dashed border-2 p-4 h-auto"
              onClick={() => setShowServiceSelect(true)}
            >
              <span>Add a service</span>
              <PlusCircle className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        {/* Barber section */}
        {selectedBarber ? (
          <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={selectedBarber.imageUrl || ""} alt={selectedBarber.name} />
                <AvatarFallback>{selectedBarber.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold">Staff: {selectedBarber.name}</h3>
                <p className="text-gray-600">{selectedBarber.title}</p>
              </div>
            </div>
            <button 
              className="text-[#2193b0]"
              onClick={() => setShowBarberSelect(true)}
            >
              Change
            </button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            className="w-full flex justify-between items-center border-dashed border-2 p-4 h-auto"
            onClick={() => setShowBarberSelect(true)}
          >
            <span>Select staff</span>
            <PlusCircle className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      {/* Add another service link */}
      {selectedService && (
        <div className="p-4 border-b">
          <button 
            className="flex items-center text-[#2193b0] font-medium"
            onClick={() => setShowServiceSelect(true)}
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add another service
          </button>
        </div>
      )}
      
      {/* Total section */}
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <span className="font-bold text-lg">Total:</span>
          <span className="text-gray-500 ml-2 text-sm">1h</span>
        </div>
        <span className="font-bold text-xl">${selectedService?.price || "0.00"}</span>
      </div>
      
      {/* Continue button */}
      <div className="p-4">
        <Button 
          className="w-full bg-[#2193b0] hover:bg-[#1c7c94]"
          disabled={!canProceed}
          onClick={goToNextStep}
        >
          Continue
        </Button>
      </div>
      
      {/* Service selection modal */}
      {showServiceSelect && (
        <div className="absolute inset-0 bg-white z-20 overflow-y-auto">
          <div className="p-4 border-b flex items-center">
            <button 
              className="mr-4"
              onClick={() => setShowServiceSelect(false)}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold">Select a Service</h3>
          </div>
          
          <div className="p-4 space-y-3">
            {services?.map(service => (
              <div 
                key={service.id}
                className="p-4 border rounded-lg cursor-pointer hover:border-[#2193b0]"
                onClick={() => addService(service)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold">{service.name}</h4>
                    <p className="text-gray-500">{service.duration} min</p>
                  </div>
                  <span className="font-bold">${service.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Barber selection modal */}
      {showBarberSelect && (
        <div className="absolute inset-0 bg-white z-20 overflow-y-auto">
          <div className="p-4 border-b flex items-center">
            <button 
              className="mr-4"
              onClick={() => setShowBarberSelect(false)}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold">Select Staff</h3>
          </div>
          
          <div className="p-4 space-y-3">
            {barbers?.map(barber => (
              <div 
                key={barber.id}
                className="p-4 border rounded-lg cursor-pointer hover:border-[#2193b0] flex items-center"
                onClick={() => selectBarber(barber)}
              >
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={barber.imageUrl || ""} alt={barber.name} />
                  <AvatarFallback>{barber.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold">{barber.name}</h4>
                  <p className="text-gray-500">{barber.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveCalendar;