
import React, { useState } from 'react';
import { Lock, Key, Monitor, Smartphone } from 'lucide-react';
import Switch from './Switch';

const SecuritySettings: React.FC = () => {
    const [toggles, setToggles] = useState({
        twoFactor: false,
    });

    const toggle = (key: keyof typeof toggles) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
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
}

export default SecuritySettings;
