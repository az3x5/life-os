
import React, { useState } from 'react';
import { Calendar, CheckCircle, DollarSign, Moon, Activity } from 'lucide-react';
import Switch from './Switch';

const NotificationsSettings: React.FC = () => {
    const [toggles, setToggles] = useState({
        emailNotifs: true,
        pushNotifs: true,
    });

    const toggle = (key: keyof typeof toggles) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
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
                            <Switch checked={true} onChange={() => { }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default NotificationsSettings;
