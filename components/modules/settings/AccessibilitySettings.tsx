
import React, { useState } from 'react';
import Switch from './Switch';

const AccessibilitySettings: React.FC = () => {
    const [toggles, setToggles] = useState({
        highContrast: false,
        reducedMotion: false,
        screenReader: false,
    });

    const toggle = (key: keyof typeof toggles) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
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
}

export default AccessibilitySettings;
