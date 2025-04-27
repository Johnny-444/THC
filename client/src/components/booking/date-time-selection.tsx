import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore, parseISO } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useBooking } from '@/context/booking-context';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TimeOfDay = {
  Morning: 'morning',
  Afternoon: 'afternoon',
  Evening: 'evening'
};

const DateTimeSelection = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<string | null>(null);
  const { selectedBarber, selectedTime, setSelectedTime, selectedDate: bookingDate, setSelectedDate: setBookingDate, goToNextStep } = useBooking();
  
  // Reset when component loads or barber changes
  useEffect(() => {
    setSelectedDate(null);
    setSelectedTime(null);
    setTimeOfDay(null);
  }, [selectedBarber, setSelectedTime]);
  
  // Fetch available time slots when a date is selected
  const { data: timeSlots, isLoading: timeSlotsLoading } = useQuery({
    queryKey: ['/api/time-slots', selectedDate?.toISOString(), selectedBarber?.id],
    queryFn: async () => {
      if (!selectedDate || !selectedBarber) return [];
      
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const res = await fetch(`/api/time-slots?date=${dateStr}&barberId=${selectedBarber.id}`);
      if (!res.ok) throw new Error('Failed to fetch time slots');
      return res.json();
    },
    enabled: !!selectedDate && !!selectedBarber
  });
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1));
  };
  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };
  
  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
    
    if (selectedDate) {
      const fullDate = new Date(selectedDate);
      // Parse time (e.g., "9:00 AM") to set hours and minutes
      const [hourMinute, period] = time.split(' ');
      const [hour, minute] = hourMinute.split(':').map(Number);
      
      fullDate.setHours(
        period === 'PM' && hour !== 12 ? hour + 12 : hour === 12 && period === 'AM' ? 0 : hour,
        minute
      );
      
      setBookingDate(fullDate);
    }
  };
  
  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      goToNextStep();
    }
  };
  
  // Get days of current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Filter time slots based on time of day
  const filteredTimeSlots = timeSlots ? timeSlots.filter((time: string) => {
    if (!timeOfDay) return true;
    
    const hour = parseInt(time.split(':')[0]);
    const isPM = time.includes('PM');
    
    if (timeOfDay === TimeOfDay.Morning) {
      return !isPM && hour < 12;
    } else if (timeOfDay === TimeOfDay.Afternoon) {
      return (isPM && hour < 5) || (hour === 12 && isPM);
    } else if (timeOfDay === TimeOfDay.Evening) {
      return isPM && hour >= 5;
    }
    
    return true;
  }) : [];
  
  // Group time slots by time of day
  const morningSlots = filteredTimeSlots?.filter((time: string) => {
    const hour = parseInt(time.split(':')[0]);
    return !time.includes('PM') && hour < 12;
  });
  
  const afternoonSlots = filteredTimeSlots?.filter((time: string) => {
    const hour = parseInt(time.split(':')[0]);
    return (time.includes('PM') && hour < 5) || (hour === 12 && time.includes('PM'));
  });
  
  const eveningSlots = filteredTimeSlots?.filter((time: string) => {
    const hour = parseInt(time.split(':')[0]);
    return time.includes('PM') && hour >= 5;
  });
  
  const today = new Date();
  
  return (
    <div className="mb-8">
      <h3 className="text-2xl font-heading mb-4">Pick a Date & Time</h3>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Calendar */}
        <div className="bg-white rounded-lg shadow-md p-4 md:w-2/3">
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigateMonth('prev')}
              disabled={isBefore(monthStart, startOfMonth(today))}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <h4 className="text-lg font-bold">{format(currentMonth, 'MMMM yyyy')}</h4>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="grid grid-cols-7 gap-2 text-center mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-neutral text-sm font-medium">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2 text-center">
            {/* Fill in leading days of first week */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-start-${i}`} className="text-gray-400 calendar-day calendar-day-disabled p-2 rounded-md"></div>
            ))}
            
            {/* Render the days of the month */}
            {daysInMonth.map((day) => {
              const isDisabled = isBefore(day, today) && !isToday(day);
              const isSelected = selectedDate && day.getDate() === selectedDate.getDate() && 
                                  day.getMonth() === selectedDate.getMonth() && 
                                  day.getFullYear() === selectedDate.getFullYear();
                                  
              return (
                <div 
                  key={day.toISOString()}
                  className={`p-2 calendar-day rounded-md cursor-pointer
                    ${isDisabled ? 'text-gray-400 calendar-day-disabled cursor-not-allowed' : ''}
                    ${isSelected ? 'bg-secondary text-white' : ''}
                    ${isToday(day) && !isSelected ? 'bg-gray-100 font-semibold' : ''}
                  `}
                  onClick={() => !isDisabled && handleDateClick(day)}
                >
                  {day.getDate()}
                </div>
              );
            })}
            
            {/* Fill in trailing days of last week */}
            {Array.from({ length: 6 - monthEnd.getDay() }).map((_, i) => (
              <div key={`empty-end-${i}`} className="text-gray-400 calendar-day calendar-day-disabled p-2 rounded-md"></div>
            ))}
          </div>
        </div>
        
        {/* Time Slots */}
        <div className="bg-white rounded-lg shadow-md p-4 md:w-1/3">
          {selectedDate ? (
            <>
              <h4 className="text-lg font-bold mb-4">
                Available Times for {format(selectedDate, 'MMM d')}
              </h4>
              
              <div className="mb-4 flex gap-2">
                <Button
                  variant={timeOfDay === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeOfDay(null)}
                >
                  All
                </Button>
                <Button
                  variant={timeOfDay === TimeOfDay.Morning ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeOfDay(TimeOfDay.Morning)}
                  disabled={!morningSlots?.length}
                >
                  Morning
                </Button>
                <Button
                  variant={timeOfDay === TimeOfDay.Afternoon ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeOfDay(TimeOfDay.Afternoon)}
                  disabled={!afternoonSlots?.length}
                >
                  Afternoon
                </Button>
                <Button
                  variant={timeOfDay === TimeOfDay.Evening ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeOfDay(TimeOfDay.Evening)}
                  disabled={!eveningSlots?.length}
                >
                  Evening
                </Button>
              </div>
              
              {timeSlotsLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                </div>
              ) : (
                <>
                  {(timeOfDay === null || timeOfDay === TimeOfDay.Morning) && morningSlots?.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-md font-medium mb-2">Morning</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {morningSlots.map((time: string) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            className={selectedTime === time ? "bg-secondary text-white" : ""}
                            onClick={() => handleTimeClick(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(timeOfDay === null || timeOfDay === TimeOfDay.Afternoon) && afternoonSlots?.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-md font-medium mb-2">Afternoon</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {afternoonSlots.map((time: string) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            className={selectedTime === time ? "bg-secondary text-white" : ""}
                            onClick={() => handleTimeClick(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(timeOfDay === null || timeOfDay === TimeOfDay.Evening) && eveningSlots?.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-md font-medium mb-2">Evening</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {eveningSlots.map((time: string) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            className={selectedTime === time ? "bg-secondary text-white" : ""}
                            onClick={() => handleTimeClick(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {filteredTimeSlots.length === 0 && (
                    <div className="text-center py-6 text-neutral">
                      No available time slots for this date. Please select another date.
                    </div>
                  )}
                  
                  {selectedTime && (
                    <div className="mt-6">
                      <Button 
                        className="w-full bg-secondary hover:bg-red-700" 
                        onClick={handleContinue}
                      >
                        Continue
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-neutral">
              Please select a date from the calendar to view available times.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelection;
