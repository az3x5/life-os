
import React, { useState } from 'react';
import { Download, Trash2, ChevronRight } from 'lucide-react';
import Switch from './Switch';

const PrivacySettings: React.FC = () => {
    const [toggles, setToggles] = useState({
        publicProfile: true,
        dataSharing: false,
    });

    const toggle = (key: keyof typeof toggles) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
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
}

export default PrivacySettings;
