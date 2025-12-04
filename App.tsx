import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CalendarModule from './components/modules/CalendarModule';
import NotesModule from './components/modules/NotesModule';
import HabitsModule from './components/modules/HabitsModule';
import RemindersModule from './components/modules/RemindersModule';
import SettingsModule from './components/modules/SettingsModule';
import HealthModule from './components/modules/HealthModule';
import FinanceModule from './components/modules/FinanceModule';
import IslamicModule from './components/modules/IslamicModule';
import { ThemeProvider } from './context/ThemeContext';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'calendar':
        return <CalendarModule />;
      case 'notes':
        return <NotesModule />;
      case 'habits':
        return <HabitsModule />;
      case 'reminders':
        return <RemindersModule />;
      case 'health':
        return <HealthModule />;
      case 'finance':
        return <FinanceModule />;
      case 'islamic':
        return <IslamicModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-300 mb-2 capitalize">{activeTab}</h2>
              <p>This module is under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen h-[100dvh] bg-slate-50 text-slate-900 font-sans transition-colors duration-300 overflow-hidden supports-[height:100dvh]:h-[100dvh]">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className={`flex-1 flex flex-col h-full transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Mobile Header - Sticky with safe area padding */}
        <header className="lg:hidden min-h-[3.5rem] bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-4 sticky top-0 z-30 pt-[env(safe-area-inset-top)] pb-2 transition-all">
          <div className="flex items-center w-full mt-2">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg active:bg-slate-200 touch-manipulation"
              aria-label="Open Menu"
            >
              <Menu size={24} />
            </button>
            <span className="ml-3 font-semibold text-lg text-slate-900">LifeOS</span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden pb-[calc(2rem+env(safe-area-inset-bottom))] scroll-smooth">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;