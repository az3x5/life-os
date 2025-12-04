import React, { useState, useMemo, useEffect } from 'react';
import {
  Activity,
  Footprints,
  Moon,
  Weight,
  Droplets,
  Plus,
  TrendingUp,
  Clock,
  Heart,
  Dumbbell,
  PanelLeft,
  MoreVertical,
  Calendar,
  X,
  ChevronRight,
  Loader2,
  Edit2,
  Trash2
} from 'lucide-react';
import { HealthLog } from '../../types';
import { format, addDays } from 'date-fns';
import { useHealth } from '../../hooks/useData';

type MetricType = 'weight' | 'steps' | 'sleep' | 'water' | 'bp' | 'exercise'; // 'bp' used for Heart Rate in mock
type TimeRange = 'daily' | 'weekly' | 'monthly';

const HealthModule: React.FC = () => {
  // API Hook
  const { logs: apiLogs, loading, logEntry, updateLog, deleteLog } = useHealth();

  const [activeMetric, setActiveMetric] = useState<MetricType>('weight');
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');
  const [history, setHistory] = useState<HealthLog[]>([]);
  const [editingLog, setEditingLog] = useState<HealthLog | null>(null);

  // Sync API logs to local state
  useEffect(() => {
    if (apiLogs.length > 0 || !loading) {
      setHistory(apiLogs);
    }
  }, [apiLogs, loading]);
  
  // Layout State
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Add Entry Form State
  const [newValue, setNewValue] = useState('');
  const [newDate, setNewDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [newNote, setNewNote] = useState('');

  // Config for each metric
  const metricConfig: Record<string, { id: number, label: string, unit: string, icon: any, color: string, colorBg: string, colorText: string }> = {
    weight: { id: 1, label: 'Weight', unit: 'kg', icon: Weight, color: 'blue', colorBg: 'bg-blue-50', colorText: 'text-blue-600' },
    steps: { id: 2, label: 'Steps', unit: 'steps', icon: Footprints, color: 'orange', colorBg: 'bg-orange-50', colorText: 'text-orange-600' },
    sleep: { id: 3, label: 'Sleep', unit: 'hrs', icon: Moon, color: 'indigo', colorBg: 'bg-indigo-50', colorText: 'text-indigo-600' },
    water: { id: 4, label: 'Water', unit: 'ml', icon: Droplets, color: 'cyan', colorBg: 'bg-cyan-50', colorText: 'text-cyan-600' },
    bp: { id: 5, label: 'Heart Rate', unit: 'bpm', icon: Heart, color: 'rose', colorBg: 'bg-rose-50', colorText: 'text-rose-600' },
    exercise: { id: 6, label: 'Exercise', unit: 'mins', icon: Dumbbell, color: 'emerald', colorBg: 'bg-emerald-50', colorText: 'text-emerald-600' },
  };

  // Filter Data for Chart
  const chartData = useMemo(() => {
    const data = history.filter(h => h.type === activeMetric);
    // Sort by date ascending
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [history, activeMetric]);

  // Filter Data for List (Recent first)
  const recentLogs = useMemo(() => {
    return [...chartData].reverse();
  }, [chartData]);

  // Open Modal
  const openModal = (log: HealthLog | null = null) => {
    setEditingLog(log);
    if (log) {
      setNewValue(log.value.toString());
      setNewDate(format(new Date(log.date), "yyyy-MM-dd'T'HH:mm"));
      setNewNote(log.note || '');
    } else {
      setNewValue('');
      setNewDate(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
      setNewNote('');
    }
    setIsModalOpen(true);
  }

  // Handle Save (Create/Update)
  const handleSaveEntry = async () => {
    if (!newValue) return;
    
    const metricId = metricConfig[activeMetric].id;
    const entryData = {
      metric_id: metricId,
      value: Number(newValue),
      date: new Date(newDate).toISOString(),
      notes: newNote
    };

    try {
      if (editingLog) {
        await updateLog(editingLog.id, entryData);
      } else {
        await logEntry(entryData);
      }
    } catch (error) {
      console.error('Failed to save health entry:', error);
    }

    setIsModalOpen(false);
    setEditingLog(null);
  };
  
  // Handle Delete
  const handleDeleteLog = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      await deleteLog(id);
    }
  }

  // Get Current/Latest Value
  const getLatestValue = (type: string) => {
    const latest = history.find(h => h.type === type);
    return latest ? latest.value : '-';
  };

  // SVG Chart Component
  const TrendChart = ({ data, range }: { data: HealthLog[], range: TimeRange }) => {
    if (data.length < 2) return <div className="h-64 flex items-center justify-center text-slate-400">Not enough data to display chart</div>;

    // Determine data window based on range
    let displayData = [...data];
    const today = new Date();
    if (range === 'daily') displayData = displayData.slice(-7); // Last 7 entries
    if (range === 'weekly') displayData = displayData.filter(d => new Date(d.date) >= addDays(today, -30)); // Last 30 days
    // Monthly shows all

    if (displayData.length < 2) return <div className="h-64 flex items-center justify-center text-slate-400">No data for this period</div>;

    const values = displayData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1 || 1; // Add padding to Y axis
    
    const width = 800;
    const height = 300;
    
    // Calculate points
    const points = displayData.map((d, i) => {
      const x = (i / (displayData.length - 1)) * width;
      const y = height - ((d.value - (min - padding)) / ((max + padding) - (min - padding))) * height;
      return `${x},${y}`;
    }).join(' ');

    const config = metricConfig[activeMetric];

    return (
      <div className="w-full h-64 sm:h-80 relative">
         <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            {/* Grid Lines */}
            <line x1="0" y1="0" x2={width} y2="0" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
            <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
            <line x1="0" y1={height} x2={width} y2={height} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />

            {/* Gradient Fill */}
            <defs>
               <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
               </linearGradient>
            </defs>
            <path 
               d={`M0,${height} ${points.split(' ').map((p, i) => `L${p}`).join(' ')} L${width},${height} Z`} 
               fill="url(#gradient)" 
               className={config.colorText}
            />

            {/* Line */}
            <polyline 
               points={points} 
               fill="none" 
               stroke="currentColor" 
               strokeWidth="3" 
               strokeLinecap="round" 
               strokeLinejoin="round"
               className={config.colorText}
            />

            {/* Data Points */}
            {displayData.map((d, i) => {
               const x = (i / (displayData.length - 1)) * width;
               const y = height - ((d.value - (min - padding)) / ((max + padding) - (min - padding))) * height;
               return (
                  <g key={i} className="group">
                    <circle 
                       cx={x} 
                       cy={y} 
                       r="4" 
                       className="fill-white stroke-current stroke-2"
                       style={{ color: 'inherit' }}
                    />
                     <foreignObject x={x - 50} y={y - 50} width="100" height="40" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                       <div className="bg-slate-800 text-white text-xs rounded-md shadow-lg p-2 text-center">
                         <div>{`${d.value} ${config.unit}`}</div>
                         <div className="text-slate-300">{format(new Date(d.date), 'MMM d')}</div>
                       </div>
                     </foreignObject>
                  </g>
               );
            })}
         </svg>
         
         {/* X-Axis Labels */}
         <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
            <span>{format(new Date(displayData[0].date), 'MMM d')}</span>
            <span>{format(new Date(displayData[displayData.length - 1].date), 'MMM d')}</span>
         </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-slate-200 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          <p className="text-slate-500">Loading health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">

      {/* Sidebar */}
      <div className={`
        bg-slate-50 border-r border-slate-200 flex-col flex-shrink-0 transition-all duration-300
        fixed inset-y-0 left-0 z-20 h-full overflow-hidden
        ${mobileMenuOpen ? 'translate-x-0 w-80 shadow-2xl' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shadow-none
        ${isSidebarVisible ? 'md:w-72 lg:w-80' : 'md:w-0 md:border-r-0'}
      `}>
        {/* Inner wrapper */}
        <div className="w-72 lg:w-80 h-full flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="text-blue-600" />
              Health Metrics
            </h2>
            <p className="text-sm text-slate-500 mt-1">Track your vitals & progress</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {Object.entries(metricConfig).map(([key, config]) => {
              const isActive = activeMetric === key;
              const Icon = config.icon;
              const latest = getLatestValue(key);
              
              return (
                <button
                  key={key}
                  onClick={() => { setActiveMetric(key as MetricType); setMobileMenuOpen(false); }}
                  className={`
                    w-full text-left p-4 rounded-xl border transition-all duration-200 group
                    ${isActive 
                      ? 'bg-white border-slate-200 shadow-md ring-1 ring-slate-100' 
                      : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-100/50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${isActive ? config.colorBg + ' ' + config.colorText : 'bg-slate-100 text-slate-400 group-hover:bg-white'}`}>
                           <Icon size={18} />
                        </div>
                        <span className={`font-semibold ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>{config.label}</span>
                     </div>
                  </div>
                  <div className="flex items-end justify-between">
                     <div>
                        <span className="text-2xl font-bold text-slate-900">{latest}</span>
                        <span className="text-xs text-slate-500 font-medium ml-1">{config.unit}</span>
                     </div>
                     <ChevronRight size={16} className={`text-slate-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             {/* Mobile Toggle */}
             <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <MoreVertical size={20} />
            </button>

            {/* Desktop Toggle */}
            <button 
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="hidden md:flex p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
            >
              <PanelLeft size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-slate-900">{metricConfig[activeMetric].label}</h2>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden sm:flex bg-slate-100 p-1 rounded-lg">
                {['daily', 'weekly', 'monthly'].map((r) => (
                   <button 
                     key={r}
                     onClick={() => setTimeRange(r as TimeRange)}
                     className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-all ${timeRange === r ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                      {r}
                   </button>
                ))}
             </div>
             <button 
               onClick={() => openModal()}
               className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-slate-200"
            >
               <Plus size={18} />
               <span className="hidden sm:inline">Add Entry</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
           <div className="p-6 max-w-5xl mx-auto space-y-8">
              
              {/* Chart Section */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Trends</h3>
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-600`}>
                       <TrendingUp size={14} />
                       <span>On Track</span>
                    </div>
                 </div>
                 <div className={metricConfig[activeMetric].colorText}>
                    <TrendChart data={chartData} range={timeRange} />
                 </div>
              </div>

              {/* History List */}
              <div>
                 <h3 className="text-lg font-bold text-slate-900 mb-4">History</h3>
                 <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    {recentLogs.length > 0 ? (
                       <div className="divide-y divide-slate-50">
                          {recentLogs.map((log) => (
                             <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-4">
                                   <div className={`p-2 rounded-lg ${metricConfig[activeMetric].colorBg} ${metricConfig[activeMetric].colorText}`}>
                                      {React.createElement(metricConfig[activeMetric].icon, { size: 20 })}
                                   </div>
                                   <div>
                                      <div className="font-bold text-slate-900 text-lg">
                                         {log.value} <span className="text-sm text-slate-500 font-medium">{metricConfig[activeMetric].unit}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                         <Calendar size={12} />
                                         {format(new Date(log.date), 'MMM d, yyyy')}
                                         <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                         <Clock size={12} />
                                         {format(new Date(log.date), 'h:mm a')}
                                      </div>
                                   </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {log.note && (
                                     <div className="hidden sm:block text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 max-w-xs truncate">
                                        {log.note}
                                     </div>
                                  )}
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    <button onClick={() => openModal(log)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg"><Edit2 size={16}/></button>
                                    <button onClick={() => handleDeleteLog(log.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={16}/></button>
                                  </div>
                                </div>
                             </div>
                          ))}
                       </div>
                    ) : (
                       <div className="p-12 text-center text-slate-400">
                          No history found. Add your first entry!
                       </div>
                    )}
                 </div>
              </div>

           </div>
        </div>

      </div>

      {/* Add/Edit Entry Modal */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
               <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                  <X size={24} />
               </button>
               
               <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-xl ${metricConfig[activeMetric].colorBg} ${metricConfig[activeMetric].colorText}`}>
                     {React.createElement(metricConfig[activeMetric].icon, { size: 24 })}
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-slate-900">{editingLog ? 'Edit' : 'Log'} {metricConfig[activeMetric].label}</h3>
                     <p className="text-sm text-slate-500">{editingLog ? 'Update the data point' : 'Add a new data point'}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Value ({metricConfig[activeMetric].unit})
                     </label>
                     <input 
                        type="number" 
                        autoFocus
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        className="w-full text-3xl font-bold border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none placeholder-slate-400 text-slate-900" 
                        placeholder="0" 
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date & Time</label>
                     <input 
                        type="datetime-local" 
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none bg-slate-50 text-slate-900" 
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Note (Optional)</label>
                     <textarea 
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none resize-none placeholder-slate-400 text-slate-900"
                        rows={3}
                        placeholder="How are you feeling?"
                     />
                  </div>

                  <button 
                     onClick={handleSaveEntry}
                     disabled={!newValue}
                     className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-slate-200 mt-2"
                  >
                     {editingLog ? 'Save Changes' : 'Save Entry'}
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default HealthModule;