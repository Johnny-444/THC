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
import { Service, Barber, Category } from '@shared/schema';

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
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  
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
  
  // Handle opening the service selection modal
  const openServiceSelection = () => {
    setSelectedCategoryId(null); // Reset category filter
    setShowServiceSelect(true);
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
    <div className="relative bg-white rounded-lg shadow-lg max-w-6xl mx-auto z-10">
      {/* Modal header */}
      <div className="flex justify-between items-center p-5 border-b">
        <h2 className="text-xl font-bold">Book an Appointment</h2>
        <button className="p-1 rounded-full hover:bg-gray-100">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      {/* 8-hour advance booking notice */}
      <div className="mx-5 mt-3 mb-0 text-center text-sm text-gray-500 bg-gray-100 p-2 rounded">
        <p>Please note: Appointments must be booked at least 8 hours in advance.</p>
      </div>
      
      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row">
        {/* Left Column - Service & Barber Selection */}
        <div className="p-5 md:w-1/3 md:border-r">
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4">1. Select a Service</h3>
            {selectedServices.length > 0 ? (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{selectedService?.name}</h3>
                  <p className="text-secondary">${selectedService?.price}</p>
                </div>
                <button 
                  className="text-secondary"
                  onClick={openServiceSelection}
                >
                  Change
                </button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full flex justify-between items-center border-dashed border-2 p-4 h-auto"
                onClick={openServiceSelection}
              >
                <span>Select a service</span>
                <PlusCircle className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4">2. Select a Barber</h3>
            {selectedBarber ? (
              <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={selectedBarber.imageUrl || ""} alt={selectedBarber.name} />
                    <AvatarFallback>{selectedBarber.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold">{selectedBarber.name}</h3>
                    <p className="text-gray-600">{selectedBarber.title}</p>
                  </div>
                </div>
                <button 
                  className="text-secondary"
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
                <span>Select a barber</span>
                <PlusCircle className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          {/* Add another service link */}
          {selectedService && (
            <div className="mb-6">
              <button 
                className="flex items-center text-secondary font-medium"
                onClick={openServiceSelection}
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Add another service
              </button>
            </div>
          )}
          
          {/* Total section */}
          <div className="p-4 bg-gray-50 rounded-lg mb-4 flex justify-between items-center">
            <div>
              <span className="font-bold text-lg">Total:</span>
              {selectedService && <span className="text-gray-500 ml-2 text-sm">{selectedService.duration}min</span>}
            </div>
            <span className="font-bold text-xl">${selectedService?.price || "0.00"}</span>
          </div>
        </div>
        
        {/* Right Column - Calendar & Time Selection */}
        <div className="p-5 md:w-2/3">
          <h3 className="text-lg font-bold mb-4">3. Select Date & Time</h3>
          
          {/* Calendar header with month/year and navigation */}
          <div className="p-2 border-b mb-4">
            <div className="flex items-center justify-between mb-2">
              <button 
                onClick={() => navigateWeek('prev')} 
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <h4 className="text-lg font-medium">{getMonthYearDisplay()}</h4>
              
              <button 
                onClick={() => navigateWeek('next')} 
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Calendar days row */}
          <div className="mb-6">
            <div className="flex space-x-2 overflow-x-auto md:justify-center">
              {weekDays.map((day, index) => (
                <button
                  key={index}
                  className={`flex flex-col items-center justify-center min-w-[70px] p-3 rounded-lg transition-all ${
                    selectedDay && isSameDay(day, selectedDay)
                      ? 'bg-secondary text-white'
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
                    <div className="h-1 w-10 bg-secondary rounded-full mt-1 opacity-50" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Time period tabs */}
          <div className="border rounded-lg">
            <Tabs 
              defaultValue="morning" 
              onValueChange={(value) => setTimePeriod(value as 'morning' | 'afternoon' | 'evening')}
            >
              <TabsList className="grid grid-cols-3 rounded-none border-0">
                <TabsTrigger 
                  value="morning" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:shadow-none rounded-none"
                >
                  Morning
                </TabsTrigger>
                <TabsTrigger 
                  value="afternoon" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:shadow-none rounded-none"
                >
                  Afternoon
                </TabsTrigger>
                <TabsTrigger 
                  value="evening" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:shadow-none rounded-none"
                >
                  Evening
                </TabsTrigger>
              </TabsList>
              
              {/* Time slots */}
              <div className="p-4">
                {selectedService && selectedBarber ? (
                  <>
                    <TabsContent value="morning" className="m-0">
                      <div className="flex flex-wrap gap-2">
                        {filteredTimes.length > 0 ? (
                          filteredTimes.map((time) => (
                            <Button
                              key={time}
                              variant="outline"
                              className={`rounded-md border ${
                                selectedTime === time 
                                  ? 'bg-secondary text-white border-secondary' 
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
                                  ? 'bg-secondary text-white border-secondary' 
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
                                  ? 'bg-secondary text-white border-secondary' 
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
                  </>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    Please select a service and barber first to see available time slots.
                  </div>
                )}
              </div>
            </Tabs>
          </div>
          
          {/* Selected time summary */}
          {selectedTime && selectedDate && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-center font-medium">
                Selected: {format(selectedDate, 'MMM d, yyyy')} at {selectedTime}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Continue button */}
      <div className="p-4 border-t mt-4">
        <Button 
          className="w-full bg-secondary hover:bg-secondary/90"
          disabled={!canProceed}
          onClick={goToNextStep}
        >
          Continue to Customer Details
        </Button>
      </div>
      
      {/* Service selection modal */}
      {showServiceSelect && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] shadow-xl overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  className="mr-4"
                  onClick={() => setShowServiceSelect(false)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-bold">Select a Service</h3>
              </div>
              <button
                onClick={() => setShowServiceSelect(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {/* Fetch categories and group services by category */}
              {services && (
                <>
                  {/* Category filter tabs */}
                  <div className="mb-4 border-b">
                    <div className="flex overflow-x-auto pb-2 gap-1" style={{ scrollbarWidth: 'none' }}>
                      <button 
                        className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                          ${selectedCategoryId === null ? 'bg-secondary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        onClick={() => setSelectedCategoryId(null)}
                      >
                        All Services
                      </button>
                      {(() => {
                        const categoryNames: {[key: number]: string} = {
                          1: 'Haircuts',
                          2: 'Beard',
                          3: 'Packages', 
                          4: 'Color Services',
                          5: 'Specialty Services',
                          6: 'Kids Services'
                        };
                        
                        // Create unique categories from services
                        const categories = new Set<number>();
                        services.forEach(service => {
                          if (service.categoryId !== null && service.categoryId !== undefined) {
                            categories.add(service.categoryId);
                          }
                        });
                        
                        return Array.from(categories).map(categoryId => (
                          <button 
                            key={categoryId}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                              ${selectedCategoryId === categoryId ? 'bg-secondary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                            onClick={() => setSelectedCategoryId(categoryId)}
                          >
                            {categoryNames[categoryId] || `Category ${categoryId}`}
                          </button>
                        ));
                      })()}
                    </div>
                  </div>
                  
                  {/* Services list */}
                  <div className="space-y-6 mt-4">
                    {(() => {
                      // Filter services by selected category if any
                      const filteredServices = selectedCategoryId === null
                        ? services
                        : services.filter(service => service.categoryId === selectedCategoryId);
                      
                      // Group services by category
                      const servicesByCategory: {[key: number]: Service[]} = {};
                      const categoryNames: {[key: number]: string} = {
                        1: 'Haircuts',
                        2: 'Beard',
                        3: 'Packages', 
                        4: 'Color Services',
                        5: 'Specialty Services',
                        6: 'Kids Services'
                      };
                      
                      // If a category is selected, don't group them
                      if (selectedCategoryId !== null) {
                        return (
                          <div className="space-y-3">
                            {filteredServices.map(service => (
                              <div 
                                key={service.id}
                                className="p-4 border rounded-lg cursor-pointer hover:border-secondary hover:bg-gray-50 transition-colors"
                                onClick={() => addService(service)}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-bold">{service.name}</h4>
                                    <p className="text-gray-500">{service.duration} min</p>
                                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                                  </div>
                                  <span className="font-bold text-secondary whitespace-nowrap ml-4">${service.price}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      
                      // Group by category if no category filter is applied
                      filteredServices.forEach(service => {
                        if (service.categoryId !== null && service.categoryId !== undefined) {
                          if (!servicesByCategory[service.categoryId]) {
                            servicesByCategory[service.categoryId] = [];
                          }
                          servicesByCategory[service.categoryId].push(service);
                        }
                      });
                      
                      return Object.keys(servicesByCategory).map(categoryId => {
                        const id = parseInt(categoryId);
                        const categoryServices = servicesByCategory[id];
                        const categoryName = categoryNames[id] || `Category ${id}`;
                        
                        return (
                          <div key={categoryId} className="mb-4">
                            <h3 className="text-lg font-bold mb-2 pb-1 border-b">{categoryName}</h3>
                            <div className="space-y-3">
                              {categoryServices.map(service => (
                                <div 
                                  key={service.id}
                                  className="p-4 border rounded-lg cursor-pointer hover:border-secondary hover:bg-gray-50 transition-colors"
                                  onClick={() => addService(service)}
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-bold">{service.name}</h4>
                                      <p className="text-gray-500">{service.duration} min</p>
                                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                                    </div>
                                    <span className="font-bold text-secondary whitespace-nowrap ml-4">${service.price}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Barber selection modal */}
      {showBarberSelect && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] shadow-xl overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  className="mr-4"
                  onClick={() => setShowBarberSelect(false)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-bold">Select a Barber</h3>
              </div>
              <button
                onClick={() => setShowBarberSelect(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
              {barbers?.map(barber => (
                <div 
                  key={barber.id}
                  className="p-4 border rounded-lg cursor-pointer hover:border-secondary hover:bg-gray-50 transition-colors"
                  onClick={() => selectBarber(barber)}
                >
                  <div className="flex items-center">
                    <Avatar className="h-16 w-16 mr-4">
                      <AvatarImage src={barber.imageUrl || ""} alt={barber.name} />
                      <AvatarFallback>{barber.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-lg">{barber.name}</h4>
                      <p className="text-gray-700">{barber.title}</p>
                      <div className="flex items-center mt-1">
                        {Array.from({ length: Math.floor(Number(barber.rating)) }).map((_, i) => (
                          <div key={i} className="text-yellow-500">★</div>
                        ))}
                        {Number(barber.rating) % 1 > 0 && <div className="text-yellow-500">½</div>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



export default InteractiveCalendar;