
import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Palette, 
  Shield, 
  RefreshCw, 
  Layers, 
  Accessibility, 
  Globe, 
  Cpu, 
  LogOut, 
  MoreVertical, 
  PanelLeft
} from 'lucide-react';

import AccountSettings from './settings/AccountSettings';
import AppearanceSettings from './settings/AppearanceSettings';
import SecuritySettings from './settings/SecuritySettings';
import NotificationsSettings from './settings/NotificationsSettings';
import PrivacySettings from './settings/PrivacySettings';
import BackupSettings from './settings/BackupSettings';
import IntegrationsSettings from './settings/IntegrationsSettings';
import AccessibilitySettings from './settings/AccessibilitySettings';
import RegionalSettings from './settings/RegionalSettings';

type SettingsTab = 'account' | 'security' | 'notifications' | 'appearance' | 'privacy' | 'backup' | 'integrations' | 'accessibility' | 'regional';

const SettingsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'account', label: 'Account & Profile', icon: User, component: <AccountSettings /> },
    { id: 'appearance', label: 'Theme & Appearance', icon: Palette, component: <AppearanceSettings /> },
    { id: 'notifications', label: 'Notifications', icon: Bell, component: <NotificationsSettings /> },
    { id: 'security', label: 'Auth & Security', icon: Shield, component: <SecuritySettings /> },
    { id: 'privacy', label: 'Data & Privacy', icon: Layers, component: <PrivacySettings /> },
    { id: 'backup', label: 'Backup & Sync', icon: RefreshCw, component: <BackupSettings /> },
    { id: 'integrations', label: 'Integrations', icon: Cpu, component: <IntegrationsSettings /> },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility, component: <AccessibilitySettings /> },
    { id: 'regional', label: 'Language & Region', icon: Globe, component: <RegionalSettings /> },
  ];

  const renderContent = () => {
    const activeComponent = tabs.find(tab => tab.id === activeTab)?.component;
    return activeComponent || null;
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
      
      {/* Sidebar Navigation */}
      <div className={`
        bg-slate-50 border-r border-slate-200 flex-col flex-shrink-0 transition-all duration-300
        fixed inset-y-0 left-0 z-20 h-full overflow-hidden
        ${mobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shadow-none
        ${isSidebarVisible ? 'md:w-64' : 'md:w-0 md:border-r-0'}
      `}>
        <div className="w-64 h-full flex flex-col">
          <div className="p-6 border-b border-slate-200">
             <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Settings
             </h2>
             <p className="text-xs text-slate-500 mt-1">Manage your LifeOS experience</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
             {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as SettingsTab); setMobileMenuOpen(false); }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${activeTab === tab.id 
                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' 
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                      }
                    `}
                  >
                    <Icon size={18} className={activeTab === tab.id ? 'text-slate-900' : 'text-slate-400'} />
                    {tab.label}
                  </button>
                );
             })}
          </nav>
          
          <div className="p-4 border-t border-slate-200">
             <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                <LogOut size={18} />
                Sign Out
             </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
         
         {/* Header */}
         <div className="h-16 px-6 md:px-8 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white z-20">
            <div className="flex items-center gap-3">
               <button 
                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                 className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
               >
                 <MoreVertical size={20} />
               </button>
               <button 
                 onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                 className="hidden md:flex p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
               >
                 <PanelLeft size={20} />
               </button>
               <h2 className="text-xl font-bold text-slate-900">
                  {tabs.find(t => t.id === activeTab)?.label}
               </h2>
            </div>
         </div>

         {/* Settings Content */}
         <div className="flex-1 overflow-y-auto bg-slate-50/30 p-4 md:p-8">
            <div className="max-w-3xl mx-auto pb-10">
               {renderContent()}
            </div>
         </div>
      </div>
    </div>
  );
};

export default SettingsModule;
