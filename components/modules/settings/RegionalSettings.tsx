
import React from 'react';
import { Globe, Clock, Coins, Calendar } from 'lucide-react';

const RegionalSettings: React.FC = () => {
    return (
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
}

export default RegionalSettings;
