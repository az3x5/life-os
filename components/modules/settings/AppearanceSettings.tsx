
import React from 'react';
import { Sun, Moon, Monitor, Check, LayoutTemplate } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const AppearanceSettings: React.FC = () => {
    const { theme, setThemeMode, setRadius } = useTheme();

    return (
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
}

export default AppearanceSettings;
