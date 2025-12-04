
import React from 'react';
import { Calendar, Link, Music, Github, Chrome, LayoutTemplate } from 'lucide-react';

const IntegrationsSettings: React.FC = () => {
    return (
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
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${app.connected
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
}

export default IntegrationsSettings;
