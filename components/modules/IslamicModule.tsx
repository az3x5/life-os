import React, { useState, useMemo } from 'react';
import { 
  Moon, 
  MapPin, 
  ChevronRight,
  BookOpen,
  Heart,
  Book,
  FileText,
  Search,
  Volume2,
  PlayCircle,
  PauseCircle,
  Bookmark,
  Share2,
  PanelLeft,
  MoreVertical,
  Compass,
  ArrowLeft,
  Settings,
  Eye,
  EyeOff,
  Type,
  X,
  Info,
  Mic2,
  Globe,
  Home,
  Library,
  Layers,
  File,
  Sun,
  CloudSun,
  Shield,
  Coffee,
  Plane,
  Frown,
  Users
} from 'lucide-react';
import { 
  MOCK_PRAYER_TIMES, 
  MOCK_DUAS, 
  MOCK_HADITH_COLLECTIONS,
  MOCK_FIQH, 
  MOCK_QURAN_SURAHS,
  MOCK_QURAN_VERSES,
  MOCK_RECITERS
} from '../../constants';
import { format } from 'date-fns';
import { QuranSurah, QuranVerse, FiqhTopic, HadithCollection, HadithVolume, HadithBook, HadithChapter } from '../../types';

type Tab = 'prayers' | 'quran' | 'dua' | 'hadith' | 'fiqh';

const IslamicModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('prayers');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Search States
  const [duaSearchQuery, setDuaSearchQuery] = useState('');
  const [selectedDuaCategory, setSelectedDuaCategory] = useState<string | null>(null);
  
  const [quranSearchQuery, setQuranSearchQuery] = useState('');
  
  // Hadith Navigation State
  const [selectedCollection, setSelectedCollection] = useState<HadithCollection | null>(null);
  const [selectedVolume, setSelectedVolume] = useState<HadithVolume | null>(null);
  const [selectedBook, setSelectedBook] = useState<HadithBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<HadithChapter | null>(null);

  const [fiqhSearchQuery, setFiqhSearchQuery] = useState('');
  const [selectedFiqhTopic, setSelectedFiqhTopic] = useState<FiqhTopic | null>(null);

  // Quran State
  const [selectedSurah, setSelectedSurah] = useState<QuranSurah | null>(null);
  const [quranSettingsOpen, setQuranSettingsOpen] = useState(false);
  const [quranViewOptions, setQuranViewOptions] = useState({
    showTranslation: true,
    showTransliteration: true,
    showDhivehi: false,
    showTafsir: true,
    fontSize: 36, // Arabic font size
    translationFontSize: 18, // English font size
    dhivehiFontSize: 18 // Dhivehi font size
  });
  const [selectedReciter, setSelectedReciter] = useState('mishary');
  const [activeTafsirVerse, setActiveTafsirVerse] = useState<QuranVerse | null>(null);
  
  // Audio State (Mock)
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const toggleAudio = (id: string) => {
    if (playingAudioId === id) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
    }
  };

  const navItems = [
    { id: 'prayers', label: 'Prayer Times', icon: Compass },
    { id: 'quran', label: 'Quran', icon: BookOpen },
    { id: 'hadith', label: 'Hadith', icon: Book },
    { id: 'dua', label: 'Dua & Azkar', icon: Heart },
    { id: 'fiqh', label: 'Fiqh & Books', icon: FileText },
  ];

  const getDuaCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'morning & evening': return CloudSun;
      case 'prayer': return Compass;
      case 'protection': return Shield;
      case 'food & drink': return Coffee;
      case 'travel': return Plane;
      case 'emotion': return Frown;
      case 'home & family': return Users;
      case 'sleep': return Moon;
      case 'quranic': return BookOpen;
      default: return Heart;
    }
  };

  // --- Views ---

  const renderPrayersView = () => {
    const hijriDate = "14 Ramadan 1445"; 

    // Helper to determine styling based on prayer type
    const getPrayerStyle = (name: string, isNext: boolean) => {
      if (name === 'Sunrise') {
         return 'bg-amber-100/10 border-amber-500/30 text-amber-200';
      }
      if (name === 'Tahajjud' || name === 'Duha') {
         return 'bg-emerald-900/30 border-emerald-500/30 text-emerald-200 border-dashed';
      }
      if (isNext) {
         return 'bg-white text-emerald-900 border-white shadow-lg';
      }
      return 'bg-black/10 border-white/5 text-emerald-50';
    };

    return (
      <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-8">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
           {/* Main Prayer Card */}
           <div className="lg:col-span-2 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[auto] md:min-h-[280px]">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <div className="relative z-10 flex justify-between items-start">
                 <div>
                    <div className="flex items-center gap-2 mb-3 text-emerald-100 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                       <MapPin size={14} />
                       <span className="text-xs font-semibold tracking-wide">New York, USA</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight">Dhuhr</h2>
                    <p className="text-emerald-100 text-base md:text-xl font-medium">Next prayer in 2h 14m</p>
                 </div>
                 <div className="text-right hidden sm:block">
                    <div className="text-2xl md:text-3xl font-bold">{format(new Date(), 'EEEE, MMM d')}</div>
                    <div className="text-emerald-200 text-lg font-medium mt-1 opacity-90">{hijriDate}</div>
                 </div>
              </div>

              {/* Prayer Times Grid - Optimized for Mobile (4 columns on mobile = 2 rows) */}
              <div className="relative z-10 grid grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 mt-8">
                 {MOCK_PRAYER_TIMES.map((prayer) => {
                    const isNext = prayer.name === 'Dhuhr'; // Static for mock
                    return (
                       <div key={prayer.name} className={`p-2 sm:p-3 rounded-xl border transition-all flex flex-col items-center justify-center text-center ${getPrayerStyle(prayer.name, isNext)}`}>
                          <div className={`text-[9px] sm:text-[10px] uppercase tracking-wider mb-1 font-bold truncate w-full ${isNext ? 'text-emerald-600' : 'text-emerald-200/70'}`}>
                             {prayer.name}
                          </div>
                          <div className="text-base sm:text-lg font-bold">{prayer.time}</div>
                       </div>
                    );
                 })}
              </div>
           </div>

           {/* Qibla Compass Card */}
           <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden min-h-[250px]">
               <div className="absolute inset-0 bg-slate-50/50" />
               <div className="relative z-10 flex flex-col items-center">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white flex items-center justify-center relative mb-6 bg-slate-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                     <div className="absolute w-1.5 h-12 md:h-16 bg-rose-500 rounded-full top-3 origin-bottom rotate-45 transition-transform duration-700 shadow-sm" />
                     <div className="w-3 h-3 md:w-4 md:h-4 bg-slate-800 rounded-full z-10 border-2 border-white" />
                     <div className="absolute text-xs font-bold text-slate-400 top-2">N</div>
                     <div className="absolute text-xs font-bold text-emerald-600 bottom-2">Kaaba</div>
                     <div className="absolute inset-2 border-2 border-dashed border-slate-300 rounded-full opacity-50"></div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Qibla Direction</h3>
                  <p className="text-slate-500 font-medium">58° North East</p>
               </div>
           </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
               <h3 className="text-xl font-bold text-slate-900">Monthly Schedule</h3>
               <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
                  View Full Calendar <ChevronRight size={16} />
               </button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                     <tr>
                        <th className="p-5 pl-8 sticky left-0 bg-slate-50 z-10 border-r border-slate-100">Date</th>
                        {MOCK_PRAYER_TIMES.map(p => (
                           <th key={p.name} className={`p-5 ${p.name === 'Isha' ? 'pr-8' : ''} ${p.name === 'Sunrise' ? 'text-amber-500' : ''}`}>
                              {p.name}
                           </th>
                        ))}
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {[0,1,2,3,4,5].map((day) => (
                        <tr key={day} className="hover:bg-slate-50/50 transition-colors">
                           <td className="p-5 pl-8 text-sm font-semibold text-slate-900 sticky left-0 bg-white group-hover:bg-slate-50 border-r border-slate-50">
                              {format(new Date(new Date().setDate(new Date().getDate() + day)), 'dd MMM')}
                           </td>
                           {MOCK_PRAYER_TIMES.map(p => (
                              <td key={p.name} className={`p-5 text-sm font-medium ${p.name === 'Sunrise' ? 'text-amber-600/70' : 'text-slate-600'}`}>
                                 {p.time}
                              </td>
                           ))}
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    );
  };

  const renderQuranView = () => {
    const filteredSurahs = MOCK_QURAN_SURAHS.filter(s => 
      s.englishName.toLowerCase().includes(quranSearchQuery.toLowerCase()) || 
      s.name.includes(quranSearchQuery)
    );

    const filteredVerses = selectedSurah 
      ? MOCK_QURAN_VERSES.filter(v => v.surahNumber === selectedSurah.number)
      : [];

    return (
      <div className="flex flex-col lg:flex-row h-full gap-6 animate-fade-in relative">
        {/* Surah List Sidebar */}
        <div className={`
          lg:w-80 flex-shrink-0 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm
          ${selectedSurah ? 'hidden lg:flex' : 'flex w-full'}
        `}>
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 mb-3 px-1">Surahs</h3>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name..." 
                value={quranSearchQuery}
                onChange={(e) => setQuranSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-base md:text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white placeholder-slate-400"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredSurahs.map((surah) => (
              <button
                key={surah.number}
                onClick={() => setSelectedSurah(surah)}
                className={`w-full text-left p-4 hover:bg-slate-50 transition-all border-b border-slate-50 flex items-center justify-between group ${selectedSurah?.number === surah.number ? 'bg-emerald-50 border-emerald-100' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${selectedSurah?.number === surah.number ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm'}`}>
                    {surah.number}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm mb-0.5">{surah.englishName}</div>
                    <div className="text-xs text-slate-500 font-medium">{surah.englishNameTranslation}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-amiri font-bold text-lg text-slate-800 leading-none mb-1">{surah.name}</div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{surah.numberOfAyahs} Ayahs</div>
                </div>
              </button>
            ))}
            {filteredSurahs.length === 0 && (
               <div className="p-8 text-center text-slate-400 text-sm">
                  No Surahs found.
               </div>
            )}
          </div>
        </div>

        {/* Reader View */}
        <div className={`
          flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm relative
          ${selectedSurah ? 'flex' : 'hidden lg:flex'}
        `}>
          {selectedSurah ? (
            <>
              {/* Reader Header */}
              <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white/95 sticky top-0 z-20 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedSurah(null)} className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                    <ArrowLeft size={24} />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl md:text-2xl font-bold text-slate-900">{selectedSurah.englishName}</h2>
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{selectedSurah.revelationType}</span>
                    </div>
                    <p className="text-slate-500 text-xs font-medium mt-0.5">{selectedSurah.englishNameTranslation} • {selectedSurah.numberOfAyahs} Verses</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                   {/* Settings Toggle */}
                   <div className="relative">
                      <button 
                         onClick={() => setQuranSettingsOpen(!quranSettingsOpen)}
                         className={`p-2.5 rounded-xl border transition-all ${quranSettingsOpen ? 'bg-slate-100 text-slate-900 border-slate-300' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                      >
                         <Settings size={20} />
                      </button>
                      
                      {/* Settings Dropdown */}
                      {quranSettingsOpen && (
                         <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-5 z-30 animate-in fade-in zoom-in-95 duration-200">
                            <h4 className="text-sm font-bold text-slate-900 mb-4">View Settings</h4>
                            
                            <div className="space-y-5">
                               {/* Audio Settings */}
                               <div className="space-y-3 pb-4 border-b border-slate-100">
                                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Mic2 size={12} /> Reciter</label>
                                  <select 
                                    value={selectedReciter}
                                    onChange={(e) => setSelectedReciter(e.target.value)}
                                    className="w-full text-base md:text-sm border-slate-200 rounded-lg p-2 focus:ring-emerald-500 focus:border-emerald-500"
                                  >
                                    {MOCK_RECITERS.map(reciter => (
                                      <option key={reciter.id} value={reciter.id}>{reciter.name}</option>
                                    ))}
                                  </select>
                               </div>

                               {/* Toggles */}
                               <div className="space-y-3 pb-4 border-b border-slate-100">
                                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Display</label>
                                  
                                  <div className="flex items-center justify-between">
                                     <span className="text-sm text-slate-700">English Translation</span>
                                     <button onClick={() => setQuranViewOptions(p => ({...p, showTranslation: !p.showTranslation}))} className={`${quranViewOptions.showTranslation ? 'text-emerald-600' : 'text-slate-300'}`}>
                                        {quranViewOptions.showTranslation ? <Eye size={18} /> : <EyeOff size={18} />}
                                     </button>
                                  </div>
                                  <div className="flex items-center justify-between">
                                     <span className="text-sm text-slate-700">Dhivehi Translation</span>
                                     <button onClick={() => setQuranViewOptions(p => ({...p, showDhivehi: !p.showDhivehi}))} className={`${quranViewOptions.showDhivehi ? 'text-emerald-600' : 'text-slate-300'}`}>
                                        {quranViewOptions.showDhivehi ? <Eye size={18} /> : <EyeOff size={18} />}
                                     </button>
                                  </div>
                                  <div className="flex items-center justify-between">
                                     <span className="text-sm text-slate-700">Transliteration</span>
                                     <button onClick={() => setQuranViewOptions(p => ({...p, showTransliteration: !p.showTransliteration}))} className={`${quranViewOptions.showTransliteration ? 'text-emerald-600' : 'text-slate-300'}`}>
                                        {quranViewOptions.showTransliteration ? <Eye size={18} /> : <EyeOff size={18} />}
                                     </button>
                                  </div>
                                  <div className="flex items-center justify-between">
                                     <span className="text-sm text-slate-700">Show Tafsir Button</span>
                                     <button onClick={() => setQuranViewOptions(p => ({...p, showTafsir: !p.showTafsir}))} className={`${quranViewOptions.showTafsir ? 'text-emerald-600' : 'text-slate-300'}`}>
                                        {quranViewOptions.showTafsir ? <Eye size={18} /> : <EyeOff size={18} />}
                                     </button>
                                  </div>
                               </div>

                               {/* Font Sizes */}
                               <div className="space-y-4">
                                  <div>
                                     <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-700 flex items-center gap-2"><Type size={14} /> Arabic Size</span>
                                        <span className="text-xs font-bold text-slate-400">{quranViewOptions.fontSize}px</span>
                                     </div>
                                     <input 
                                        type="range" 
                                        min="24" 
                                        max="60" 
                                        value={quranViewOptions.fontSize}
                                        onChange={(e) => setQuranViewOptions(p => ({...p, fontSize: parseInt(e.target.value)}))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                     />
                                  </div>
                                  
                                  {quranViewOptions.showTranslation && (
                                     <div>
                                        <div className="flex items-center justify-between mb-2">
                                           <span className="text-sm text-slate-700 flex items-center gap-2"><Type size={14} /> English Size</span>
                                           <span className="text-xs font-bold text-slate-400">{quranViewOptions.translationFontSize}px</span>
                                        </div>
                                        <input 
                                           type="range" 
                                           min="12" 
                                           max="24" 
                                           value={quranViewOptions.translationFontSize}
                                           onChange={(e) => setQuranViewOptions(p => ({...p, translationFontSize: parseInt(e.target.value)}))}
                                           className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                        />
                                     </div>
                                  )}

                                  {quranViewOptions.showDhivehi && (
                                     <div>
                                        <div className="flex items-center justify-between mb-2">
                                           <span className="text-sm text-slate-700 flex items-center gap-2"><Globe size={14} /> Dhivehi Size</span>
                                           <span className="text-xs font-bold text-slate-400">{quranViewOptions.dhivehiFontSize}px</span>
                                        </div>
                                        <input 
                                           type="range" 
                                           min="12" 
                                           max="24" 
                                           value={quranViewOptions.dhivehiFontSize}
                                           onChange={(e) => setQuranViewOptions(p => ({...p, dhivehiFontSize: parseInt(e.target.value)}))}
                                           className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                        />
                                     </div>
                                  )}
                               </div>
                            </div>
                         </div>
                      )}
                   </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-slate-50/30">
                 <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-10">
                    {/* Bismillah */}
                    {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                       <div className="text-center py-8">
                          <p className="font-amiri text-3xl text-slate-800 leading-relaxed">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
                       </div>
                    )}
                    
                    {filteredVerses.length > 0 ? (
                       filteredVerses.map((verse) => (
                          <div key={verse.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 relative group transition-all hover:shadow-md">
                             
                             {/* Verse Header / Actions */}
                             <div className="flex items-start justify-between mb-8 pb-4 border-b border-slate-50">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold font-sans">
                                      {selectedSurah.number}:{verse.verseNumber}
                                   </div>
                                   <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                         onClick={() => toggleAudio(verse.id)}
                                         className={`p-2 rounded-full transition-all ${playingAudioId === verse.id ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-slate-100 text-slate-400'}`}
                                         title="Play Audio"
                                      >
                                         {playingAudioId === verse.id ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
                                      </button>
                                      {quranViewOptions.showTafsir && (
                                        <button 
                                           onClick={() => setActiveTafsirVerse(verse)}
                                           className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-emerald-600 transition-colors"
                                           title="View Tafsir"
                                        >
                                           <BookOpen size={18} />
                                        </button>
                                      )}
                                   </div>
                                </div>
                                <div className="flex gap-2">
                                   <button className="text-slate-300 hover:text-emerald-600 transition-colors"><Bookmark size={20} /></button>
                                   <button className="text-slate-300 hover:text-slate-600 transition-colors"><Share2 size={20} /></button>
                                </div>
                             </div>

                             {/* Arabic Text */}
                             <div className="text-right mb-8">
                                <p 
                                   className="font-amiri text-slate-900 leading-[2.5] tracking-wide"
                                   style={{ fontSize: `${quranViewOptions.fontSize}px` }}
                                   dir="rtl"
                                >
                                   {verse.arabic}
                                </p>
                             </div>

                             {/* Translations */}
                             <div className="space-y-6">
                                {quranViewOptions.showTransliteration && (
                                   <p className="text-base text-emerald-700 font-medium italic leading-relaxed">
                                      {verse.transliteration}
                                   </p>
                                )}
                                
                                {quranViewOptions.showTranslation && (
                                   <p 
                                      className="text-slate-700 leading-relaxed font-light border-l-2 border-slate-100 pl-4"
                                      style={{ fontSize: `${quranViewOptions.translationFontSize}px` }}
                                   >
                                      {verse.translation}
                                   </p>
                                )}

                                {quranViewOptions.showDhivehi && verse.dhivehi && (
                                   <p 
                                      className="text-slate-800 leading-relaxed font-normal text-right font-amiri border-r-2 border-emerald-100 pr-4"
                                      style={{ fontSize: `${quranViewOptions.dhivehiFontSize}px` }}
                                      dir="rtl"
                                   >
                                      {verse.dhivehi}
                                   </p>
                                )}
                             </div>
                          </div>
                       ))
                    ) : (
                       <div className="flex flex-col items-center justify-center py-20 text-center">
                          <BookOpen size={48} className="text-slate-200 mb-4" />
                          <h3 className="text-lg font-bold text-slate-400">Verses not loaded</h3>
                          <p className="text-slate-400 max-w-sm mt-2">Mock data for this Surah is not available. Please try Surah Al-Fatiha.</p>
                       </div>
                    )}
                 </div>
              </div>
            </>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 bg-slate-50/30">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                   <BookOpen size={48} className="text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Read the Quran</h3>
                <p className="text-slate-500 max-w-md">Select a Surah from the sidebar to begin reading. Use the settings to adjust text size and translations.</p>
             </div>
          )}
        </div>

        {/* Tafsir Slide-Over */}
        {activeTafsirVerse && (
           <div className="absolute inset-0 z-40 flex justify-end bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full lg:w-[500px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                 <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div>
                       <h3 className="text-lg font-bold text-slate-900">Tafsir Ibn Kathir</h3>
                       <p className="text-xs text-slate-500 font-medium">Surah {activeTafsirVerse.surahNumber}, Verse {activeTafsirVerse.verseNumber}</p>
                    </div>
                    <button onClick={() => setActiveTafsirVerse(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                       <X size={24} />
                    </button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
                       <p className="font-amiri text-2xl text-right leading-loose mb-4">{activeTafsirVerse.arabic}</p>
                       <p className="text-sm text-slate-600 italic">{activeTafsirVerse.translation}</p>
                    </div>
                    
                    <div className="prose prose-slate max-w-none">
                       <h4 className="font-bold text-slate-900">Exegesis</h4>
                       <p className="text-slate-600 leading-relaxed">
                          This is a mock Tafsir entry for the selected verse. In a real application, this would fetch detailed scholarly commentary from sources like Ibn Kathir, Jalalayn, or Ma'arif ul Quran.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>
    );
  };

  const renderHadithView = () => (
    <div className="animate-fade-in space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_HADITH_COLLECTIONS.map(collection => (
             <div key={collection.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Book size={24} />
                   </div>
                   <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">{collection.totalHadith.toLocaleString()} Hadiths</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{collection.name}</h3>
                <p className="font-amiri text-lg text-slate-500 mb-2">{collection.arabicName}</p>
                <div className="text-sm text-slate-500">{collection.volumes.length} Volumes</div>
             </div>
          ))}
       </div>
    </div>
  );

  const renderDuaView = () => (
     <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-4 mb-6">
           <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                 type="text" 
                 placeholder="Search for a Dua..." 
                 value={duaSearchQuery}
                 onChange={(e) => setDuaSearchQuery(e.target.value)}
                 className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white shadow-sm"
              />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {MOCK_DUAS.filter(d => d.title.toLowerCase().includes(duaSearchQuery.toLowerCase()) || d.translation.toLowerCase().includes(duaSearchQuery.toLowerCase())).map(dua => {
              const Icon = getDuaCategoryIcon(dua.category);
              return (
                 <div key={dua.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                             <Icon size={16} />
                          </div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{dua.category}</span>
                       </div>
                       <button className={`text-slate-300 hover:text-amber-400 ${dua.isFavorite ? 'text-amber-400' : ''}`}>
                          <Heart size={18} fill={dua.isFavorite ? "currentColor" : "none"} />
                       </button>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-3">{dua.title}</h3>
                    <p className="font-amiri text-xl text-right text-slate-800 leading-loose mb-4">{dua.arabic}</p>
                    <p className="text-sm text-slate-600 italic mb-3">"{dua.translation}"</p>
                    <div className="text-xs text-slate-400 font-medium">{dua.reference}</div>
                 </div>
              );
           })}
        </div>
     </div>
  );

  const renderFiqhView = () => (
     <div className="animate-fade-in space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {MOCK_FIQH.map(topic => (
              <div key={topic.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                 <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase">{topic.category}</span>
                    <FileText size={20} className="text-slate-300" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-900 mb-2">{topic.title}</h3>
                 <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">{topic.content}</p>
                 <button className="mt-4 text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                    Read More <ChevronRight size={14} />
                 </button>
              </div>
           ))}
        </div>
     </div>
  );

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
      {/* Sidebar */}
       <div className={`
        bg-slate-50 border-r border-slate-200 flex-col flex-shrink-0 transition-all duration-300
        fixed inset-y-0 left-0 z-20 h-full overflow-hidden
        ${mobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shadow-none
        ${isSidebarVisible ? 'md:w-64' : 'md:w-0 md:border-r-0'}
      `}>
         <div className="w-64 h-full flex flex-col">
            <div className="p-6 border-b border-slate-200">
               <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Moon className="text-emerald-600" size={24} />
                  Islamic
               </h2>
               <p className="text-xs text-slate-500 mt-1">Spirituality & Knowledge</p>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
               {navItems.map(item => (
                  <button
                     key={item.id}
                     onClick={() => { setActiveTab(item.id as Tab); setMobileMenuOpen(false); }}
                     className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? 'bg-white shadow-sm text-emerald-700 ring-1 ring-slate-100' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                  >
                     <item.icon size={18} className={activeTab === item.id ? 'text-emerald-600' : 'text-slate-400'} />
                     {item.label}
                  </button>
               ))}
            </nav>
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
          <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white z-20">
             <div className="flex items-center gap-3">
               <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"><MoreVertical size={20} /></button>
               <button onClick={() => setIsSidebarVisible(!isSidebarVisible)} className="hidden md:flex p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"><PanelLeft size={20} /></button>
               <h2 className="text-xl font-bold text-slate-900 capitalize">{navItems.find(n => n.id === activeTab)?.label}</h2>
             </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-slate-50/30 p-4 md:p-8">
             {activeTab === 'prayers' && renderPrayersView()}
             {activeTab === 'quran' && renderQuranView()}
             {activeTab === 'hadith' && renderHadithView()}
             {activeTab === 'dua' && renderDuaView()}
             {activeTab === 'fiqh' && renderFiqhView()}
          </div>
      </div>
    </div>
  );
};

export default IslamicModule;