
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
  PanelLeft,
  Moon,
  Sun,
  Monitor,
  Check,
  LayoutTemplate,
  Camera,
  Mail,
  Phone,
  Lock,
  Smartphone,
  History,
  AlertCircle,
  Key,
  Download,
  Trash2,
  Cloud,
  Upload,
  Link,
  CheckCircle,
  Eye,
  Type,
  Move,
  Clock,
  Coins,
  ChevronRight,
  Calendar,
  Activity,
  DollarSign,
  Music,
  Github,
  Chrome,
  Save
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

type SettingsTab = 'account' | 'security' | 'notifications' | 'appearance' | 'privacy' | 'backup' | 'integrations' | 'accessibility' | 'regional';

const SettingsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setThemeMode, setRadius } = useTheme();

  // Mock State for Toggles
  const [toggles, setToggles] = useState({
     emailNotifs: true,
     pushNotifs: true,
     marketingEmails: false,
     twoFactor: false,
     publicProfile: true,
     dataSharing: false,
     autoBackup: true,
     screenReader: false,
     reducedMotion: false,
     highContrast: false,
     syncAcrossDevices: true
  });

  const toggle = (key: keyof typeof toggles) => {
     setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const tabs = [
    { id: 'account', label: 'Account & Profile', icon: User },
    { id: 'appearance', label: 'Theme & Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Auth & Security', icon: Shield },
    { id: 'privacy', label: 'Data & Privacy', icon: Layers },
    { id: 'backup', label: 'Backup & Sync', icon: RefreshCw },
    { id: 'integrations', label: 'Integrations', icon: Cpu },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'regional', label: 'Language & Region', icon: Globe },
  ];

  // Reusable Toggle Component
  const Switch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button 
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out flex items-center ${checked ? 'bg-slate-900' : 'bg-slate-200'}`}
    >
      <span className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ml-0.5 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  // --- RENDER FUNCTIONS ---

  const renderAccount = () => (
    <div className="space-y-6 animate-fade-in">
       {/* Profile Header */}
       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-bold text-slate-900">Profile Information</h3>
             <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
                <Save size={16} />
                <span>Save Changes</span>
             </button>
          </div>
          
          <div className="flex flex-col md:flex-row items-start gap-8">
             <div className="relative group mx-auto md:mx-0">
                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 overflow-hidden border-2 border-slate-100">
                   <User size={48} />
                </div>
                <button className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                   <Camera size={24} />
                </button>
             </div>
             <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Full Name</label>
                   <input type="text" defaultValue="Ali Developer" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-shadow placeholder-slate-400" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Username</label>
                   <input type="text" defaultValue="@alidev" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-shadow placeholder-slate-400" />
                </div>
                <div className="md:col-span-2">
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Bio</label>
                   <textarea rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none resize-none transition-shadow placeholder-slate-400" defaultValue="Building LifeOS to organize my entire life." />
                </div>
             </div>
          </div>
       </div>

       {/* Contact Details */}
       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Contact Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email Address</label>
                 <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="email" defaultValue="ali@example.com" className="w-full pl-10 border border-slate-200 rounded-xl px-4 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none placeholder-slate-400" />
                 </div>
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Phone Number</label>
                 <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="tel" defaultValue="+1 (555) 000-0000" className="w-full pl-10 border border-slate-200 rounded-xl px-4 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none placeholder-slate-400" />
                 </div>
              </div>
          </div>
       </div>
       
       {/* Danger Zone */}
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
          <h3 className="text-lg font-bold text-red-700 mb-2">Danger Zone</h3>
          <p className="text-sm text-red-600/80 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
          <button className="px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-colors shadow-sm">
             Delete Account
          </button>
       </div>
    </div>
  );

  const renderAppearance = () => (
    <div className="space-y-6 animate-fade-in">
       {/* Theme Mode */}
       <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Theme Mode</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             {[
               { id: 'light', label: 'Light', icon: Sun, bg: 'bg-slate-50', preview: 'bg-white' },
               { id: 'dark', label: 'Dark', icon: Moon, bg: 'bg-slate-900', preview: 'bg-slate-800' },
               { id: 'system', label: 'System', icon: Monitor, bg: 'bg-gradient-to-br from-white to-slate-900', preview: '' }
             ].map((option) => (
               <button 
                  key={option.id}
                  onClick={() => setThemeMode(option.id as any)}
                  className={`
                    border-2 rounded-xl p-4 text-left relative overflow-hidden group transition-all
                    ${theme.mode === option.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300'}
                    ${option.id === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}
                  `}
               >
                  <div className={`w-full h-24 rounded-lg mb-3 border shadow-sm flex items-center justify-center ${option.preview} ${option.id === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                     <option.icon size={24} className={option.id === 'dark' ? 'text-white' : 'text-slate-900'} />
                  </div>
                  <span className={`font-bold block ${option.id === 'dark' ? 'text-white' : 'text-slate-900'}`}>{option.label}</span>
                  {theme.mode === option.id && (
                    <div className="absolute top-3 right-3 text-blue-500 bg-white rounded-full p-0.5"><Check size={14} /></div>
                  )}
               </button>
             ))}
          </div>
       </div>

       {/* UI Density & Radius */}
       <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Interface Style</h3>
          <div className="space-y-8">
             <div>
                <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-900">Corner Radius</label>
                   <span className="text-xs font-bold text-slate-500">{theme.radius}px</span>
                </div>
                <input 
                   type="range" 
                   min="0" 
                   max="32" 
                   step="4" 
                   value={theme.radius}
                   onChange={(e) => setRadius(parseInt(e.target.value))}
                   className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" 
                />
                <div className="flex justify-between mt-2 text-[10px] text-slate-400 uppercase font-bold">
                   <span>Square</span>
                   <span>Standard</span>
                   <span>Round</span>
                </div>
             </div>

             <div className="pt-6 border-t border-slate-100">
                <label className="text-sm font-medium text-slate-900 mb-4 block">Card Preview</label>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                   <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 max-w-sm mx-auto">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                            <LayoutTemplate size={20} />
                         </div>
                         <div>
                            <div className="h-4 w-24 bg-slate-900 rounded-md mb-1.5 opacity-80"></div>
                            <div className="h-3 w-16 bg-slate-400 rounded-md opacity-50"></div>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <div className="h-3 w-full bg-slate-200 rounded-md"></div>
                         <div className="h-3 w-4/5 bg-slate-200 rounded-md"></div>
                      </div>
                      <button className="w-full mt-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Action</button>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6 animate-fade-in">
       {/* Password */}
       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Password & Authentication</h3>
          <div className="space-y-4 max-w-lg">
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Current Password</label>
                <div className="relative">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input type="password" placeholder="••••••••" className="w-full pl-10 border border-slate-200 rounded-xl px-4 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none placeholder-slate-400" />
                </div>
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">New Password</label>
                <div className="relative">
                   <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input type="password" placeholder="••••••••" className="w-full pl-10 border border-slate-200 rounded-xl px-4 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none placeholder-slate-400" />
                </div>
             </div>
             <div className="pt-2">
                <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                   Update Password
                </button>
             </div>
          </div>
       </div>

       {/* 2FA */}
       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
             <h3 className="text-base font-bold text-slate-900">Two-Factor Authentication</h3>
             <p className="text-sm text-slate-500 mt-1">Add an extra layer of security to your account.</p>
          </div>
          <Switch checked={toggles.twoFactor} onChange={() => toggle('twoFactor')} />
       </div>

       {/* Sessions */}
       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Active Sessions</h3>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-4">
                   <div className="p-2 bg-white rounded-lg text-slate-600 shadow-sm">
                      <Monitor size={20} />
                   </div>
                   <div>
                      <div className="text-sm font-bold text-slate-900">MacBook Pro 16" <span className="text-emerald-600 text-xs ml-2 bg-emerald-50 px-2 py-0.5 rounded-full">Current</span></div>
                      <div className="text-xs text-slate-500 mt-0.5">San Francisco, USA • Chrome 122.0</div>
                   </div>
                </div>
             </div>
             <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100">
                <div className="flex items-center gap-4">
                   <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                      <Smartphone size={20} />
                   </div>
                   <div>
                      <div className="text-sm font-bold text-slate-900">iPhone 15 Pro</div>
                      <div className="text-xs text-slate-500 mt-0.5">San Francisco, USA • App 2.4.0</div>
                   </div>
                </div>
                <button className="text-xs font-bold text-red-600 hover:text-red-700">Revoke</button>
             </div>
          </div>
       </div>
    </div>
  );

  const renderNotifications = () => (
     <div className="space-y-6 animate-fade-in">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 mb-6">Global Preferences</h3>
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <div>
                    <h4 className="text-sm font-bold text-slate-900">Push Notifications</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Receive alerts on your device.</p>
                 </div>
                 <Switch checked={toggles.pushNotifs} onChange={() => toggle('pushNotifs')} />
              </div>
              <div className="flex items-center justify-between">
                 <div>
                    <h4 className="text-sm font-bold text-slate-900">Email Notifications</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Receive digests and updates via email.</p>
                 </div>
                 <Switch checked={toggles.emailNotifs} onChange={() => toggle('emailNotifs')} />
              </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 mb-6">Module Alerts</h3>
           <div className="space-y-4">
              {[
                 { label: 'Calendar Events', desc: 'Reminders 15 mins before events', icon: Calendar },
                 { label: 'Habit Reminders', desc: 'Daily nudges to complete habits', icon: CheckCircle },
                 { label: 'Bill Due Dates', desc: 'Alerts 3 days before bills are due', icon: DollarSign },
                 { label: 'Prayer Times', desc: 'Adhan notification for each prayer', icon: Moon },
                 { label: 'Health Goals', desc: 'Weekly progress summary', icon: Activity },
              ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="flex items-center gap-4">
                       <div className="p-2 bg-slate-100 text-slate-500 rounded-lg">
                          <item.icon size={18} />
                       </div>
                       <div>
                          <h4 className="text-sm font-bold text-slate-900">{item.label}</h4>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                       </div>
                    </div>
                    <Switch checked={true} onChange={() => {}} />
                 </div>
              ))}
           </div>
        </div>
     </div>
  );

  const renderPrivacy = () => (
     <div className="space-y-6 animate-fade-in">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 mb-6">Data Management</h3>
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <div>
                    <h4 className="text-sm font-bold text-slate-900">Public Profile</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Allow others to find your profile.</p>
                 </div>
                 <Switch checked={toggles.publicProfile} onChange={() => toggle('publicProfile')} />
              </div>
              <div className="flex items-center justify-between">
                 <div>
                    <h4 className="text-sm font-bold text-slate-900">Share Usage Data</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Help us improve LifeOS by sharing anonymous stats.</p>
                 </div>
                 <Switch checked={toggles.dataSharing} onChange={() => toggle('dataSharing')} />
              </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 mb-6">Export & Erase</h3>
           <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-left">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                       <Download size={20} />
                    </div>
                    <div>
                       <h4 className="text-sm font-bold text-slate-900">Export Your Data</h4>
                       <p className="text-xs text-slate-500">Download a JSON copy of all your data.</p>
                    </div>
                 </div>
                 <ChevronRight size={18} className="text-slate-300" />
              </button>
              
              <button className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-red-50 hover:border-red-100 transition-colors text-left group">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-white group-hover:text-red-500">
                       <Trash2 size={20} />
                    </div>
                    <div>
                       <h4 className="text-sm font-bold text-slate-900 group-hover:text-red-600">Clear All Data</h4>
                       <p className="text-xs text-slate-500 group-hover:text-red-400">Permanently remove all local data.</p>
                    </div>
                 </div>
              </button>
           </div>
        </div>
     </div>
  );

  const renderBackup = () => (
     <div className="space-y-6 animate-fade-in">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
           <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                 <div className="flex items-center gap-2 mb-2">
                    <Cloud className="text-emerald-400" size={24} />
                    <span className="text-emerald-400 font-bold text-sm tracking-wide uppercase">Cloud Sync Active</span>
                 </div>
                 <h3 className="text-3xl font-bold mb-2">Everything is safe.</h3>
                 <p className="text-slate-400 max-w-sm">Your data was last synchronized 12 minutes ago.</p>
              </div>
              <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-lg">
                 Back Up Now
              </button>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 mb-6">Backup Settings</h3>
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <div>
                    <h4 className="text-sm font-bold text-slate-900">Automatic Backup</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Daily backups to your connected cloud.</p>
                 </div>
                 <Switch checked={toggles.autoBackup} onChange={() => toggle('autoBackup')} />
              </div>
              <div className="flex items-center justify-between">
                 <div>
                    <h4 className="text-sm font-bold text-slate-900">Sync Across Devices</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Keep your iPad and Phone in sync.</p>
                 </div>
                 <Switch checked={toggles.syncAcrossDevices} onChange={() => toggle('syncAcrossDevices')} />
              </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 mb-6">Restore</h3>
           <button className="w-full flex items-center justify-center gap-2 p-8 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all">
              <Upload size={24} />
              <span className="font-medium">Upload backup file to restore</span>
           </button>
        </div>
     </div>
  );

  const renderIntegrations = () => (
     <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {[
              { name: 'Google Calendar', icon: Calendar, connected: true, desc: 'Sync events and meetings' },
              { name: 'Slack', icon: Link, connected: false, desc: 'Share updates with your team' },
              { name: 'Spotify', icon: Music, connected: true, desc: 'Focus music control' },
              { name: 'GitHub', icon: Github, connected: false, desc: 'Link commits to tasks' },
              { name: 'Chrome', icon: Chrome, connected: true, desc: 'Web clipper extension' },
              { name: 'Notion', icon: LayoutTemplate, connected: false, desc: 'Import pages and docs' },
           ].map((app) => (
              <div key={app.name} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
                 <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 border border-slate-100">
                       <app.icon size={24} />
                    </div>
                    <div>
                       <h4 className="font-bold text-slate-900">{app.name}</h4>
                       <p className="text-xs text-slate-500 mt-1">{app.desc}</p>
                    </div>
                 </div>
                 <button 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                       app.connected 
                       ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                       : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                 >
                    {app.connected ? 'Connected' : 'Connect'}
                 </button>
              </div>
           ))}
        </div>
     </div>
  );

  const renderAccessibility = () => (
     <div className="space-y-6 animate-fade-in">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 mb-6">Visual</h3>
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <div>
                    <h4 className="text-sm font-bold text-slate-900">High Contrast</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Increase color contrast for better legibility.</p>
                 </div>
                 <Switch checked={toggles.highContrast} onChange={() => toggle('highContrast')} />
              </div>
              <div className="flex items-center justify-between">
                 <div>
                    <h4 className="text-sm font-bold text-slate-900">Reduce Motion</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Minimize animations across the interface.</p>
                 </div>
                 <Switch checked={toggles.reducedMotion} onChange={() => toggle('reducedMotion')} />
              </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 mb-6">Screen Reader</h3>
           <div className="flex items-center justify-between">
              <div>
                 <h4 className="text-sm font-bold text-slate-900">Screen Reader Optimization</h4>
                 <p className="text-xs text-slate-500 mt-0.5">Add extra ARIA labels and simplified structure.</p>
              </div>
              <Switch checked={toggles.screenReader} onChange={() => toggle('screenReader')} />
           </div>
        </div>
     </div>
  );

  const renderRegional = () => (
     <div className="space-y-6 animate-fade-in">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 mb-6">Language & Region</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Globe size={12} /> Language</label>
                 <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-base md:text-sm bg-white focus:ring-2 focus:ring-slate-900 outline-none text-slate-900">
                    <option>English (United States)</option>
                    <option>Arabic</option>
                    <option>Spanish</option>
                    <option>French</option>
                 </select>
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Clock size={12} /> Time Zone</label>
                 <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-base md:text-sm bg-white focus:ring-2 focus:ring-slate-900 outline-none text-slate-900">
                    <option>Pacific Time (UTC-08:00)</option>
                    <option>Eastern Time (UTC-05:00)</option>
                    <option>London (UTC+00:00)</option>
                    <option>Dubai (UTC+04:00)</option>
                 </select>
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Coins size={12} /> Currency</label>
                 <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-base md:text-sm bg-white focus:ring-2 focus:ring-slate-900 outline-none text-slate-900">
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                    <option>AED (د.إ)</option>
                 </select>
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Calendar size={12} /> Date Format</label>
                 <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-base md:text-sm bg-white focus:ring-2 focus:ring-slate-900 outline-none text-slate-900">
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                 </select>
              </div>
           </div>
        </div>
     </div>
  );

  // --- MAIN RENDER ---
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
               {activeTab === 'account' && renderAccount()}
               {activeTab === 'appearance' && renderAppearance()}
               {activeTab === 'security' && renderSecurity()}
               {activeTab === 'notifications' && renderNotifications()}
               {activeTab === 'privacy' && renderPrivacy()}
               {activeTab === 'backup' && renderBackup()}
               {activeTab === 'integrations' && renderIntegrations()}
               {activeTab === 'accessibility' && renderAccessibility()}
               {activeTab === 'regional' && renderRegional()}
            </div>
         </div>
      </div>
    </div>
  );
};

export default SettingsModule;