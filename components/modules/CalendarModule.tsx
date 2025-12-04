import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  Calendar as CalendarIcon, 
  MoreHorizontal,
  X,
  AlignLeft,
  Tag,
  Moon
} from 'lucide-react';
import { 
  format, 
  endOfMonth, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  isToday 
} from 'date-fns';
import { CalendarEvent } from '../../types';
import { MOCK_EVENTS, MOCK_REMINDERS, MOCK_HABITS } from '../../constants';

const CalendarModule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<'work'|'personal'|'health'|'islamic'>('work');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEventStartTime, setNewEventStartTime] = useState('09:00');
  const [newEventEndTime, setNewEventEndTime] = useState('10:00');
  const [newEventLocation, setNewEventLocation] = useState('');

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Helper functions to replace missing date-fns exports
  const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 is Sunday
    const diff = d.getDate() - day;
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Hijri Date Formatter
  const formatHijri = (date: Date, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) => {
    try {
      return new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', options).format(date);
    } catch (e) {
      return '';
    }
  };

  // Generate calendar grid days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(addMonths(currentDate, -1));
  const jumpToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  const handleAddEvent = () => {
    // In a real app, dispatch to store/API
    console.log("Adding event:", { newEventTitle, newEventDate, newEventStartTime });
    setIsAddModalOpen(false);
    // Reset form
    setNewEventTitle('');
    setNewEventLocation('');
  };

  const openAddModal = () => {
    setNewEventDate(format(selectedDate, 'yyyy-MM-dd'));
    setIsAddModalOpen(true);
  };

  // Mock filtering logic for the side panel
  const selectedDayEvents = MOCK_EVENTS.filter(event => 
    isSameDay(event.date, selectedDate)
  );
  
  // For demo purposes, show reminders and habits only on "today" or generally available
  const isSelectedToday = isToday(selectedDate);
  const todaysReminders = isSelectedToday ? MOCK_REMINDERS : [];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'personal': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'health': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'islamic': return 'bg-teal-100 text-teal-700 border-teal-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-auto xl:h-[calc(100vh-6rem)] overflow-visible xl:overflow-hidden">
      {/* Main Calendar View */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden min-h-[400px]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-none mb-1">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center gap-1.5 text-emerald-600">
                <Moon size={12} className="fill-current" />
                <span className="text-sm font-medium font-amiri">
                  {formatHijri(currentDate, { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start mt-1">
              <button 
                onClick={prevMonth}
                className="p-2 hover:bg-white rounded-md text-slate-500 hover:text-slate-900 transition-all shadow-sm hover:shadow active:scale-95"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 hover:bg-white rounded-md text-slate-500 hover:text-slate-900 transition-all shadow-sm hover:shadow active:scale-95"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={jumpToToday}
              className="px-3 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors active:scale-95 hidden sm:block"
            >
              Today
            </button>
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-lg shadow-slate-200 active:scale-95"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Event</span>
            </button>
          </div>
        </div>

        {/* Weekday Header */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {weekDays.map(day => (
            <div key={day} className="py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6">
          {calendarDays.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = isSameDay(day, selectedDate);
            const isDayToday = isToday(day);
            const dayEvents = MOCK_EVENTS.filter(e => isSameDay(e.date, day));

            return (
              <div 
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`
                  relative border-b border-r border-slate-50 p-1 sm:p-2 md:p-3 cursor-pointer transition-colors group h-full
                  ${!isCurrentMonth ? 'bg-slate-50/30' : 'bg-white'}
                  ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'}
                `}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className={`
                    w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-xs sm:text-sm font-medium transition-all
                    ${isDayToday 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                      : isSelected 
                        ? 'bg-white text-blue-600 ring-2 ring-blue-200'
                        : !isCurrentMonth ? 'text-slate-300' : 'text-slate-700 group-hover:bg-slate-200'
                    }
                  `}>
                    {format(day, 'd')}
                  </span>
                  {isCurrentMonth && (
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-amiri font-medium mt-1 mr-1 hidden sm:block">
                      {formatHijri(day, { day: 'numeric' })}
                    </span>
                  )}
                </div>
                
                {/* Event Indicators */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {dayEvents.map(event => (
                    <div key={event.id} className="hidden lg:block">
                      <div className={`
                        text-[10px] truncate px-1.5 py-0.5 rounded-md border
                        ${getCategoryColor(event.category)}
                      `}>
                        {event.title}
                      </div>
                    </div>
                  ))}
                  {/* Mobile Dot Indicator */}
                  <div className="flex lg:hidden gap-1 mt-1 justify-center flex-wrap px-1">
                     {dayEvents.map(event => (
                        <div key={event.id} className={`w-1.5 h-1.5 rounded-full ${
                          event.category === 'work' ? 'bg-blue-400' : 
                          event.category === 'personal' ? 'bg-purple-400' :
                          event.category === 'health' ? 'bg-emerald-400' : 'bg-teal-400'
                        }`} />
                     ))}
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute inset-0 ring-2 ring-inset ring-blue-500/20 pointer-events-none rounded-none" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Details Panel */}
      <div className="w-full xl:w-96 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden shrink-0 h-auto xl:h-full">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-slate-900">
              {format(selectedDate, 'EEEE')}
            </h3>
            <button className="text-slate-400 hover:text-slate-600 p-2">
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="flex flex-col">
            <p className="text-slate-500 font-medium">{format(selectedDate, 'MMMM d, yyyy')}</p>
            <p className="text-emerald-600 font-medium font-amiri text-sm mt-0.5 flex items-center gap-2">
              <Moon size={12} className="fill-current" />
              {formatHijri(selectedDate)}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Events Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Schedule</h4>
              <button 
                onClick={openAddModal}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors active:bg-blue-100"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="space-y-3">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map(event => (
                  <div key={event.id} className="relative pl-4 py-1 group">
                    <div className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full ${
                      event.category === 'work' ? 'bg-blue-400' : 
                      event.category === 'personal' ? 'bg-purple-400' :
                      event.category === 'health' ? 'bg-emerald-400' : 'bg-teal-400'
                    }`} />
                    <div className="bg-slate-50 group-hover:bg-slate-100 p-3 rounded-xl border border-transparent group-hover:border-slate-200 transition-all cursor-pointer">
                      <h5 className="text-sm font-semibold text-slate-900">{event.title}</h5>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          {event.startTime} - {event.endTime}
                        </div>
                        {event.location && (
                           <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <CalendarIcon size={24} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">No events scheduled</p>
                </div>
              )}
            </div>
          </section>

          {/* Tasks/Reminders Section */}
          <section>
             <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tasks</h4>
              <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors active:bg-blue-100">
                <Plus size={16} />
              </button>
            </div>
            
            <div className="space-y-2">
              {todaysReminders.length > 0 ? (
                 todaysReminders.map(reminder => (
                  <div key={reminder.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <div className={`w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center ${
                      reminder.completed ? 'bg-blue-500 border-blue-500' : 'border-slate-300'
                    }`}>
                      {reminder.completed && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className={`text-sm ${reminder.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {reminder.title}
                    </span>
                    <span className="ml-auto text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                      {format(reminder.dueDate, 'h:mm a')}
                    </span>
                  </div>
                 ))
              ) : (
                 <p className="text-sm text-slate-400 italic pl-1">No tasks for today</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setIsAddModalOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl font-bold text-slate-900 mb-6">New Event</h3>
            
            <div className="space-y-5">
              <div>
                <input 
                  type="text" 
                  autoFocus
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full text-2xl font-bold border-b border-slate-200 px-0 py-2 focus:ring-0 focus:border-slate-900 placeholder-slate-400 outline-none bg-transparent text-slate-900" 
                  placeholder="Event Title" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <CalendarIcon size={12} /> Date
                   </label>
                   <input 
                      type="date" 
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all text-slate-900" 
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Tag size={12} /> Category
                   </label>
                   <select 
                      value={newEventCategory}
                      onChange={(e) => setNewEventCategory(e.target.value as any)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all text-slate-900 capitalize"
                   >
                      <option value="work">Work</option>
                      <option value="personal">Personal</option>
                      <option value="health">Health</option>
                      <option value="islamic">Islamic</option>
                   </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                       <Clock size={12} /> Start Time
                    </label>
                    <input 
                       type="time" 
                       value={newEventStartTime}
                       onChange={(e) => setNewEventStartTime(e.target.value)}
                       className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all text-slate-900" 
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                       <Clock size={12} /> End Time
                    </label>
                    <input 
                       type="time" 
                       value={newEventEndTime}
                       onChange={(e) => setNewEventEndTime(e.target.value)}
                       className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all text-slate-900" 
                    />
                 </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <MapPin size={12} /> Location
                 </label>
                 <div className="relative">
                    <input 
                       type="text" 
                       value={newEventLocation}
                       onChange={(e) => setNewEventLocation(e.target.value)}
                       placeholder="Add location"
                       className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all placeholder-slate-400 text-slate-900" 
                    />
                 </div>
              </div>
              
              <div className="pt-4">
                 <button 
                    onClick={handleAddEvent}
                    disabled={!newEventTitle}
                    className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-200 active:scale-95"
                 >
                    Create Event
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarModule;