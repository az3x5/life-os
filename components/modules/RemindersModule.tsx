import React, { useState, useEffect } from 'react';
import {
  Bell,
  Calendar,
  Flag,
  CheckCircle,
  Plus,
  Search,
  Briefcase,
  User,
  Activity,
  DollarSign,
  Moon,
  Layers,
  Calendar as CalendarIcon,
  X,
  Trash2,
  PanelLeft,
  MoreVertical,
  CheckSquare,
  Tag,
  Edit2,
  LayoutGrid,
  List,
  Loader2
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast, isFuture } from 'date-fns';
import { Reminder } from '../../types';
import { useReminders } from '../../hooks/useData';

type FilterType = 'all' | 'today' | 'scheduled' | 'flagged' | 'completed';
type CategoryType = 'work' | 'personal' | 'health' | 'finance' | 'islamic' | 'general' | null;

const RemindersModule: React.FC = () => {
  // API Hook
  const {
    reminders: apiReminders,
    loading,
    createReminder: apiCreateReminder,
    updateReminder: apiUpdateReminder,
    toggleComplete: apiToggleComplete,
    deleteReminder: apiDeleteReminder
  } = useReminders();

  // Local state synced with API
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // Sync API reminders to local state
  useEffect(() => {
    if (apiReminders.length > 0 || !loading) {
      setReminders(apiReminders);
    }
  }, [apiReminders, loading]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeCategory, setActiveCategory] = useState<CategoryType>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // Layout State
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New/Edit Reminder Form State
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newPriority, setNewPriority] = useState<'low'|'medium'|'high'>('medium');
  const [newCategory, setNewCategory] = useState<string>('personal');

  // Filtering Logic
  const filteredReminders = reminders.filter(r => {
    // Search
    if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Category
    if (activeCategory && r.category !== activeCategory) return false;

    // Main Filters
    if (activeFilter === 'completed') return r.completed;
    if (r.completed) return false; // Hide completed in other views by default

    switch (activeFilter) {
      case 'today': return isToday(r.dueDate);
      case 'scheduled': return isFuture(r.dueDate);
      case 'flagged': return r.priority === 'high';
      default: return true;
    }
  });

  // Sorting: Priority high first, then date ascending
  const sortedReminders = [...filteredReminders].sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (a.priority !== 'high' && b.priority === 'high') return 1;
    return a.dueDate.getTime() - b.dueDate.getTime();
  });

  // Actions
  const toggleComplete = async (id: string) => {
    try {
      await apiToggleComplete(id);
      setReminders(reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
    } catch (error) {
      console.error('Failed to toggle reminder:', error);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      await apiDeleteReminder(id);
      setReminders(reminders.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
    setActiveMenuId(null);
  };

  const openAddModal = () => {
     setEditingReminder(null);
     setNewTitle('');
     setNewDate('');
     setNewPriority('medium');
     setNewCategory('personal');
     setIsAddModalOpen(true);
     setActiveMenuId(null);
  }

  const openEditModal = (reminder: Reminder) => {
     setEditingReminder(reminder);
     setNewTitle(reminder.title);
     // Format date for datetime-local input: YYYY-MM-DDTHH:mm
     const d = new Date(reminder.dueDate);
     d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
     setNewDate(d.toISOString().slice(0, 16));
     setNewPriority(reminder.priority);
     setNewCategory(reminder.category);
     setIsAddModalOpen(true);
     setActiveMenuId(null);
  }

  const saveReminder = async () => {
    if (!newTitle) return;

    const dateObj = newDate ? new Date(newDate) : new Date();
    const reminderData = {
      title: newTitle,
      dueDate: dateObj,
      priority: newPriority,
      category: newCategory as any,
    };

    try {
      if (editingReminder) {
         await apiUpdateReminder(editingReminder.id, reminderData);
         setReminders(reminders.map(r => r.id === editingReminder.id ? { ...editingReminder, ...reminderData } : r));
      } else {
         const newReminder = await apiCreateReminder(reminderData);
         setReminders([...reminders, newReminder]);
      }
    } catch (error) {
      console.error('Failed to save reminder:', error);
    }

    setIsAddModalOpen(false);
  };

  // Helpers
  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'high': return 'text-red-600 bg-red-50 border-red-100';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-slate-200 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          <p className="text-slate-500">Loading reminders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-6rem)] md:bg-white md:rounded-2xl md:shadow-sm md:border border-slate-200 overflow-hidden relative">

      {/* Left Sidebar */}
      <div className={`
        bg-slate-50 border-r border-slate-200 flex-col flex-shrink-0 transition-all duration-300
        fixed inset-y-0 left-0 z-40 h-full overflow-hidden
        ${mobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shadow-none
        ${isSidebarVisible ? 'md:w-64' : 'md:w-0 md:border-r-0'}
      `}>
        {/* Inner wrapper to maintain width during transition */}
        <div className="w-64 h-full flex flex-col">
          
          {/* Search Bar */}
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search reminders..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400 text-slate-900"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-3 space-y-6">
            
            {/* Smart Filters */}
            <div className="space-y-1">
               <button 
                onClick={() => { setActiveFilter('all'); setActiveCategory(null); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'all' && !activeCategory ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <div className="flex items-center gap-3">
                   <Layers size={18} className={activeFilter === 'all' && !activeCategory ? 'text-blue-500' : 'text-slate-400'} />
                   <span>All Reminders</span>
                </div>
                <span className="text-xs font-semibold text-slate-400">{reminders.filter(r => !r.completed).length}</span>
              </button>

              <button 
                onClick={() => { setActiveFilter('today'); setActiveCategory(null); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'today' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <div className="flex items-center gap-3">
                   <Calendar size={18} className={activeFilter === 'today' ? 'text-blue-500' : 'text-slate-400'} />
                   <span>Today</span>
                </div>
                <span className="text-xs font-semibold text-slate-400">{reminders.filter(r => !r.completed && isToday(r.dueDate)).length}</span>
              </button>

              <button 
                onClick={() => { setActiveFilter('scheduled'); setActiveCategory(null); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'scheduled' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <div className="flex items-center gap-3">
                   <CalendarIcon size={18} className={activeFilter === 'scheduled' ? 'text-red-500' : 'text-slate-400'} />
                   <span>Scheduled</span>
                </div>
                <span className="text-xs font-semibold text-slate-400">{reminders.filter(r => !r.completed && isFuture(r.dueDate)).length}</span>
              </button>

              <button 
                onClick={() => { setActiveFilter('flagged'); setActiveCategory(null); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'flagged' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <div className="flex items-center gap-3">
                   <Flag size={18} className={activeFilter === 'flagged' ? 'text-orange-500' : 'text-slate-400'} />
                   <span>Flagged</span>
                </div>
                <span className="text-xs font-semibold text-slate-400">{reminders.filter(r => !r.completed && r.priority === 'high').length}</span>
              </button>
              
               <button 
                onClick={() => { setActiveFilter('completed'); setActiveCategory(null); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'completed' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <div className="flex items-center gap-3">
                   <CheckCircle size={18} className={activeFilter === 'completed' ? 'text-emerald-500' : 'text-slate-400'} />
                   <span>Completed</span>
                </div>
                <span className="text-xs font-semibold text-slate-400">{reminders.filter(r => r.completed).length}</span>
              </button>
            </div>

            {/* Lists/Categories */}
            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Lists</h3>
                 <button className="text-slate-400 hover:text-slate-600 transition-colors p-1" title="Manage Lists">
                    <MoreVertical size={16} />
                 </button>
              </div>
              <div className="space-y-1">
                {[
                  { id: 'work', icon: Briefcase },
                  { id: 'personal', icon: User },
                  { id: 'health', icon: Activity },
                  { id: 'finance', icon: DollarSign },
                  { id: 'islamic', icon: Moon },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const count = reminders.filter(r => !r.completed && r.category === cat.id).length;
                  return (
                    <div key={cat.id} className="group relative">
                       <button 
                        onClick={() => { setActiveCategory(cat.id as any); setActiveFilter('all'); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeCategory === cat.id ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        <div className="flex items-center gap-3">
                           <Icon size={18} className={activeCategory === cat.id ? 'text-blue-500' : 'text-slate-400'} />
                           <span className="capitalize">{cat.id}</span>
                        </div>
                        {count > 0 && <span className="text-xs font-semibold text-slate-400 group-hover:hidden">{count}</span>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Header */}
        <div className="h-16 px-4 md:px-6 border-b border-slate-100 flex items-center justify-between bg-white z-10 sticky top-0">
          <div className="flex items-center gap-3">
            {/* Mobile Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg active:bg-slate-200"
            >
              <MoreVertical size={22} />
            </button>

            {/* Desktop Toggle */}
            <button 
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="hidden md:flex p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
            >
              <PanelLeft size={20} />
            </button>

            <h2 className="text-xl font-bold text-slate-900 capitalize truncate max-w-[120px] sm:max-w-none">
              {activeCategory || activeFilter}
            </h2>
            <span className="text-sm text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full hidden sm:block">
              {sortedReminders.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 mr-1">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all active:scale-95 ${viewMode === 'list' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <List size={18} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all active:scale-95 ${viewMode === 'grid' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutGrid size={18} />
              </button>
            </div>

            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-slate-200 active:scale-95"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>

        {/* Reminders List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/30">
          {sortedReminders.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
              : "space-y-3 max-w-4xl mx-auto"
            }>
               {sortedReminders.map(reminder => (
                 <div 
                    key={reminder.id}
                    className={`
                      group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.99] md:active:scale-100 relative
                      ${viewMode === 'grid' ? 'p-5 flex flex-col gap-4' : 'p-4 flex items-center gap-4'}
                    `}
                    onClick={() => toggleComplete(reminder.id)}
                 >
                    {/* Header: Checkbox & Priority (Grid) */}
                    <div className={`flex items-start justify-between ${viewMode === 'list' ? 'w-auto' : 'w-full'}`}>
                       {/* Checkbox Wrapper */}
                       <div 
                         className={`cursor-pointer flex items-center justify-center p-2 -m-2 z-10`}
                         onClick={(e) => { e.stopPropagation(); toggleComplete(reminder.id); }}
                       >
                         <div className={`
                           w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0
                           ${reminder.completed 
                               ? 'bg-blue-500 border-blue-500' 
                               : 'border-slate-300 hover:border-blue-500 group-hover:border-blue-400 bg-white'
                           }
                         `}>
                            {reminder.completed && <CheckCircle size={16} className="text-white" />}
                         </div>
                       </div>
                       
                       {/* Priority Badge for Grid */}
                       {viewMode === 'grid' && reminder.priority === 'high' && (
                          <div className="px-2 py-1 rounded-md bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                             <Flag size={10} fill="currentColor" />
                             <span>High</span>
                          </div>
                       )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 w-full">
                       <h3 className={`font-medium text-base text-slate-900 truncate ${reminder.completed ? 'line-through text-slate-400' : ''}`}>
                          {reminder.title}
                       </h3>
                       
                       <div className={`flex items-center gap-4 mt-1.5 ${viewMode === 'grid' ? 'justify-between w-full' : ''}`}>
                          <div className={`flex items-center gap-1.5 text-xs ${isPast(reminder.dueDate) && !isToday(reminder.dueDate) && !reminder.completed ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
                             <Calendar size={12} />
                             {getDateLabel(reminder.dueDate)}
                             {viewMode === 'list' && reminder.dueDate.getHours() > 0 && <span>• {format(reminder.dueDate, 'h:mm a')}</span>}
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 capitalize">
                             <Tag size={12} />
                             {reminder.category}
                          </div>
                       </div>
                    </div>

                    {/* Actions / Meta (List View) */}
                    {viewMode === 'list' && (
                       <div className="flex items-center gap-1 sm:gap-3">
                          {reminder.priority === 'high' && (
                             <div className="px-2 py-1 rounded-md bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                <Flag size={10} fill="currentColor" />
                                <span className="hidden md:inline">High</span>
                             </div>
                          )}
                          
                          {/* 3-Dot Menu */}
                          <div className="relative">
                            <button 
                               onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === reminder.id ? null : reminder.id); }}
                               className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors"
                            >
                               <MoreVertical size={18} />
                            </button>
                            
                            {activeMenuId === reminder.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} />
                                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-20 flex flex-col p-1 animate-in fade-in zoom-in-95 duration-100">
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); openEditModal(reminder); }}
                                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                                   >
                                      <Edit2 size={16} /> Edit
                                   </button>
                                   <div className="h-px bg-slate-100 my-1" />
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); deleteReminder(reminder.id); }}
                                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                   >
                                      <Trash2 size={16} /> Delete
                                   </button>
                                </div>
                              </>
                            )}
                          </div>
                       </div>
                    )}

                    {/* Grid Footer Actions (Replaced by top 3-dot or kept simple) */}
                    {viewMode === 'grid' && (
                       <div className="absolute top-4 right-4">
                          <div className="relative">
                            <button 
                               onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === reminder.id ? null : reminder.id); }}
                               className="p-1.5 text-slate-300 hover:text-slate-600 rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors"
                            >
                               <MoreVertical size={16} />
                            </button>
                             {activeMenuId === reminder.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} />
                                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-20 flex flex-col p-1 animate-in fade-in zoom-in-95 duration-100">
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); openEditModal(reminder); }}
                                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                                   >
                                      <Edit2 size={16} /> Edit
                                   </button>
                                   <div className="h-px bg-slate-100 my-1" />
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); deleteReminder(reminder.id); }}
                                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                   >
                                      <Trash2 size={16} /> Delete
                                   </button>
                                </div>
                              </>
                            )}
                          </div>
                       </div>
                    )}
                 </div>
               ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center mb-4 text-slate-300">
                   <Bell size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No reminders found</h3>
                <p className="text-slate-500 mt-1 max-w-xs">You are all caught up! Create a new reminder to stay organized.</p>
             </div>
          )}
        </div>
      </div>

      {/* Add/Edit Reminder Modal */}
      {isAddModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
               <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2">
                  <X size={24} />
               </button>
               
               <h3 className="text-xl font-bold text-slate-900 mb-6">{editingReminder ? 'Edit Reminder' : 'New Reminder'}</h3>
               
               <div className="space-y-6">
                  <div>
                     <input 
                        type="text" 
                        autoFocus
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full text-2xl font-bold border-b border-slate-200 px-0 py-2 focus:ring-0 focus:border-slate-900 placeholder-slate-400 outline-none bg-transparent text-slate-900" 
                        placeholder="What needs to be done?" 
                     />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Due Date</label>
                        <input 
                           type="datetime-local" 
                           value={newDate}
                           onChange={(e) => setNewDate(e.target.value)}
                           className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none bg-slate-50 text-slate-900" 
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Priority</label>
                        <div className="flex gap-2">
                           {['low', 'medium', 'high'].map(p => (
                              <button 
                                 key={p}
                                 onClick={() => setNewPriority(p as any)}
                                 className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase transition-all border ${newPriority === p ? getPriorityColor(p) + ' shadow-sm' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                              >
                                 {p}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">List</label>
                     <div className="flex flex-wrap gap-2">
                        {['work', 'personal', 'health', 'finance', 'islamic'].map(cat => (
                           <button 
                              key={cat}
                              onClick={() => setNewCategory(cat)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all ${newCategory === cat ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                           >
                              {cat}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="pt-4">
                     <button 
                        onClick={saveReminder}
                        disabled={!newTitle}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-slate-200 active:scale-95"
                     >
                        {editingReminder ? 'Save Changes' : 'Create Reminder'}
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default RemindersModule;