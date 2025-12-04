
import React, { useState } from 'react';
import { Cloud, Upload } from 'lucide-react';
import Switch from './Switch';

const BackupSettings: React.FC = () => {
    const [toggles, setToggles] = useState({
        autoBackup: true,
        syncAcrossDevices: true,
    });

    const toggle = (key: keyof typeof toggles) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
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
}

export default BackupSettings;
