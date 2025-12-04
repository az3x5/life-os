import React from 'react';
import { Activity, Footprints, Moon, Weight, Droplets, Flame, Heart } from 'lucide-react';
import { HealthMetric } from '../../types';

interface HealthCardProps {
  metrics: HealthMetric[];
}

const HealthCard: React.FC<HealthCardProps> = ({ metrics }) => {
  const getIcon = (type: string) => {
    const typeLower = type?.toLowerCase() || '';
    switch (typeLower) {
      case 'steps': return Footprints;
      case 'sleep': return Moon;
      case 'weight': return Weight;
      case 'water': return Droplets;
      case 'calories': return Flame;
      case 'heart rate': return Heart;
      default: return Activity;
    }
  };

  const getColor = (type: string) => {
    const typeLower = type?.toLowerCase() || '';
    switch (typeLower) {
      case 'steps': return 'bg-orange-50 text-orange-600';
      case 'sleep': return 'bg-indigo-50 text-indigo-600';
      case 'weight': return 'bg-blue-50 text-blue-600';
      case 'water': return 'bg-cyan-50 text-cyan-600';
      case 'calories': return 'bg-red-50 text-red-600';
      case 'heart rate': return 'bg-pink-50 text-pink-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  // Filter out metrics with no value
  const displayMetrics = metrics.filter(m => m.value > 0).slice(0, 3);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
          <Activity size={18} />
        </div>
        <h3 className="font-semibold text-slate-900">Health</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {displayMetrics.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm py-4">
            No health data yet
          </div>
        ) : (
          displayMetrics.map((metric, idx) => {
            const metricType = (metric as any).type || metric.name || 'unknown';
            const Icon = getIcon(metricType);
            const colorClass = getColor(metricType);

            return (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${colorClass}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {metric.value} <span className="text-xs font-normal text-slate-500">{metric.unit}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize">{metricType}</div>
                  </div>
                </div>
                {/* Simple Trend Indicator */}
                <div className={`text-xs font-medium ${
                  metric.trend === 'up' ? 'text-emerald-500' :
                  metric.trend === 'down' ? 'text-rose-500' : 'text-slate-400'
                }`}>
                  {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '-'}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HealthCard;
