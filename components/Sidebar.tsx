import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  NotebookPen, 
  Bell, 
  CheckCircle, 
  Activity, 
  DollarSign, 
  Moon, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'notes', label: 'Notes', icon: NotebookPen },
  { id: 'reminders', label: 'Reminders', icon: Bell },
  { id: 'habits', label: 'Habits', icon: CheckCircle },
  { id: 'health', label: 'Health', icon: Activity },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'islamic', label: 'Islamic', icon: Moon },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-full bg-white border-r border-slate-200 
          transition-transform duration-300 ease-in-out 
          pt-[calc(1rem+env(safe-area-inset-top))] pb-[env(safe-area-inset-bottom)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-20' : 'w-64'}
          shadow-2xl lg:shadow-none
        `}
      >
        <div className="flex flex-col h-full relative">
          {/* Toggle Button */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-9 bg-white border border-slate-200 rounded-full p-1 shadow-sm text-slate-400 hover:text-slate-600 hidden lg:flex z-40"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Header */}
          <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-8'} border-b border-slate-100 transition-all overflow-hidden shrink-0`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className={`text-xl font-bold text-slate-900 tracking-tight transition-opacity duration-200 whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>LifeOS</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  title={isCollapsed ? item.label : ''}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98] touch-manipulation
                    ${isActive 
                      ? 'bg-slate-100 text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 active:bg-slate-50'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                >
                  <Icon size={22} className={`flex-shrink-0 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                  <span className={`whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 shrink-0">
            <button 
              title={isCollapsed ? "Sign Out" : ""}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 active:bg-red-50 active:scale-[0.98] transition-all ${isCollapsed ? 'justify-center' : ''}`}
            >
              <LogOut size={22} className="flex-shrink-0" />
              <span className={`whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;