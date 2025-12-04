import React, { useState, useEffect, useCallback } from 'react';
import {
  Moon,
  MapPin,
  ChevronRight,
  BookOpen,
  Heart,
  Book,
  FileText,
  Search,
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
  Mic2,
  Globe,
  CloudSun,
  Shield,
  Coffee,
  Plane,
  Frown,
  Users,
  Loader2,
  RefreshCw
} from 'lucide-react';
import {
  MOCK_FIQH,
  MOCK_RECITERS
} from '../../constants';
import { format } from 'date-fns';
import { FiqhTopic } from '../../types';
import * as islamicService from '../../services/islamicService';
import * as prayerTimesData from '../../services/prayerTimesData';

type Tab = 'prayers' | 'quran' | 'dua' | 'hadith' | 'fiqh';

// Types for API data
interface QuranSurahInfo {
  chapter: number;
  name: string;
  englishname: string;
  arabicname: string;
  revelation: string;
  verses: number;
}

interface QuranVerseData {
  verse: number;
  text: string;
  translation?: string;
}

interface HadithBook {
  name: string;
  collection: {
    name: string;
    book: string;
    author: string;
    language: string;
    has_sections: boolean;
  }[];
}

const IslamicModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('prayers');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Loading and Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search States
  const [duaSearchQuery, setDuaSearchQuery] = useState('');
  const [quranSearchQuery, setQuranSearchQuery] = useState('');
  const [fiqhSearchQuery, setFiqhSearchQuery] = useState('');
  const [selectedFiqhTopic, setSelectedFiqhTopic] = useState<FiqhTopic | null>(null);

  // Quran State
  const [quranChapters, setQuranChapters] = useState<QuranSurahInfo[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<QuranSurahInfo | null>(null);
  const [surahVerses, setSurahVerses] = useState<QuranVerseData[]>([]);
  const [quranSettingsOpen, setQuranSettingsOpen] = useState(false);
  const [quranViewOptions, setQuranViewOptions] = useState({
    showTranslation: true,
    showTransliteration: false,
    showDhivehi: false,
    showTafsir: true,
    fontSize: 36,
    translationFontSize: 18,
    dhivehiFontSize: 18
  });
  const [selectedReciter, setSelectedReciter] = useState('mishary');
  const [activeTafsirVerse, setActiveTafsirVerse] = useState<QuranVerseData | null>(null);
  const [tafsirText, setTafsirText] = useState<string>('');
  const [tafsirLoading, setTafsirLoading] = useState(false);

  // Hadith State
  const [hadithBooks, setHadithBooks] = useState<Record<string, HadithBook>>({});
  const [selectedHadithBook, setSelectedHadithBook] = useState<string | null>(null);
  const [selectedHadithEdition, setSelectedHadithEdition] = useState<string | null>(null);
  const [hadithSections, setHadithSections] = useState<islamicService.HadithSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [hadiths, setHadiths] = useState<islamicService.Hadith[]>([]);

  // Dua State
  const [duas, setDuas] = useState<islamicService.Dua[]>([]);
  const [duaCategories, setDuaCategories] = useState<islamicService.DuaCategory[]>([]);

  // Audio State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Prayer Times State
  const [prayerTimes, setPrayerTimes] = useState<prayerTimesData.PrayerTime | null>(null);
  const [atolls, setAtolls] = useState<prayerTimesData.Atoll[]>([]);
  const [islands, setIslands] = useState<prayerTimesData.Island[]>([]);
  const [selectedAtoll, setSelectedAtoll] = useState<string>('S'); // Default to Addu

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load Quran chapters
      const chapters = await islamicService.getQuranChapters();
      setQuranChapters(chapters);

      // Load Hadith books
      const books = await islamicService.getHadithEditions();
      setHadithBooks(books);

      // Load Duas (local data)
      setDuas(islamicService.getAllDuas());
      setDuaCategories(islamicService.getDuaCategories());

      // Load prayer times and location data
      const atollsData = await prayerTimesData.getAllAtolls();
      setAtolls(atollsData);
      const islandsData = await prayerTimesData.getAllIslands();
      setIslands(islandsData);
      const todayPrayers = await prayerTimesData.getTodaysPrayerTimes(selectedAtoll);
      setPrayerTimes(todayPrayers);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  // Reload prayer times when atoll changes
  useEffect(() => {
    const loadPrayerTimes = async () => {
      const todayPrayers = await prayerTimesData.getTodaysPrayerTimes(selectedAtoll);
      setPrayerTimes(todayPrayers);
    };
    loadPrayerTimes();
  }, [selectedAtoll]);

  // Load surah verses when a surah is selected
  useEffect(() => {
    if (selectedSurah) {
      loadSurahVerses(selectedSurah.chapter);
    }
  }, [selectedSurah]);

  const loadSurahVerses = async (chapterNumber: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await islamicService.getQuranChapter(chapterNumber);
      setSurahVerses(data.verses);
    } catch (err) {
      setError('Failed to load verses. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load tafsir for a verse
  const loadTafsir = async (surahNumber: number, verseNumber: number) => {
    setTafsirLoading(true);
    try {
      const tafsir = await islamicService.getTafsirForAyah(surahNumber, verseNumber);
      setTafsirText(tafsir.text || 'Tafsir not available for this verse.');
    } catch (err) {
      setTafsirText('Failed to load tafsir. Please try again.');
    } finally {
      setTafsirLoading(false);
    }
  };

  // Load hadith sections when edition is selected
  useEffect(() => {
    if (selectedHadithEdition) {
      loadHadithSections(selectedHadithEdition);
    }
  }, [selectedHadithEdition]);

  const loadHadithSections = async (edition: string) => {
    setLoading(true);
    try {
      const sections = await islamicService.getHadithSections(edition);
      setHadithSections(sections);
    } catch (err) {
      console.error('Failed to load hadith sections:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load hadiths when section is selected
  useEffect(() => {
    if (selectedHadithEdition && selectedSection !== null) {
      loadHadiths(selectedHadithEdition, selectedSection);
    }
  }, [selectedHadithEdition, selectedSection]);

  const loadHadiths = async (edition: string, sectionNumber: number) => {
    setLoading(true);
    try {
      const hadithList = await islamicService.getHadithsBySection(edition, sectionNumber);
      setHadiths(hadithList);
    } catch (err) {
      console.error('Failed to load hadiths:', err);
    } finally {
      setLoading(false);
    }
  };

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

    // Build prayer times array from local data
    const prayerTimesList = prayerTimes ? [
      { name: 'Fajr', time: prayerTimes.fajr },
      { name: 'Sunrise', time: prayerTimes.sunrise },
      { name: 'Dhuhr', time: prayerTimes.duhr },
      { name: 'Asr', time: prayerTimes.asr },
      { name: 'Maghrib', time: prayerTimes.maghrib },
      { name: 'Isha', time: prayerTimes.isha },
    ] : [];

    // Find the next prayer
    const getNextPrayer = () => {
      if (!prayerTimes) return 'Fajr';
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      for (const prayer of prayerTimesList) {
        const [hours, mins] = prayer.time.split(':').map(Number);
        const prayerMinutes = hours * 60 + mins;
        if (prayerMinutes > currentTime) return prayer.name;
      }
      return 'Fajr'; // Next day
    };
    const nextPrayer = getNextPrayer();

    // Get selected atoll name
    const selectedAtollInfo = atolls.find(a => a.code_letter === selectedAtoll);
    const locationName = selectedAtollInfo?.name_abbr_en || selectedAtoll;

    // Helper to determine styling based on prayer type
    const getPrayerStyle = (name: string, isNext: boolean) => {
      if (name === 'Sunrise') {
         return 'bg-amber-100/10 border-amber-500/30 text-amber-200';
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
                       <select
                         value={selectedAtoll}
                         onChange={(e) => setSelectedAtoll(e.target.value)}
                         className="bg-transparent border-none text-xs font-semibold tracking-wide cursor-pointer focus:outline-none"
                       >
                         {atolls.map(atoll => (
                           <option key={atoll.code_letter} value={atoll.code_letter} className="text-slate-900">
                             {atoll.name_abbr_en} - {atoll.name_official_en}
                           </option>
                         ))}
                       </select>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight">{nextPrayer}</h2>
                    <p className="text-emerald-100 text-base md:text-xl font-medium">Next prayer</p>
                 </div>
                 <div className="text-right hidden sm:block">
                    <div className="text-2xl md:text-3xl font-bold">{format(new Date(), 'EEEE, MMM d')}</div>
                    <div className="text-emerald-200 text-lg font-medium mt-1 opacity-90">{hijriDate}</div>
                 </div>
              </div>

              {/* Prayer Times Grid */}
              <div className="relative z-10 grid grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mt-8">
                 {prayerTimesList.map((prayer) => {
                    const isNext = prayer.name === nextPrayer;
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
               <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                     <tr>
                        <th className="p-5 pl-8 sticky left-0 bg-slate-50 z-10 border-r border-slate-100">Date</th>
                        {prayerTimesList.map(p => (
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
                           {prayerTimesList.map(p => (
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
    const filteredSurahs = quranChapters.filter(s =>
      s.englishname.toLowerCase().includes(quranSearchQuery.toLowerCase()) ||
      s.name.includes(quranSearchQuery)
    );

    return (
      <div className="flex flex-col lg:flex-row h-full gap-6 animate-fade-in relative">
        {/* Surah List Sidebar */}
        <div className={`
          lg:w-80 flex-shrink-0 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm
          ${selectedSurah ? 'hidden lg:flex' : 'flex w-full'}
        `}>
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 mb-3 px-1">Surahs ({quranChapters.length})</h3>
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
            {quranChapters.length === 0 ? (
              <div className="p-8 text-center">
                <Loader2 className="animate-spin mx-auto text-emerald-600 mb-2" size={24} />
                <p className="text-slate-400 text-sm">Loading Surahs...</p>
              </div>
            ) : (
              filteredSurahs.map((surah) => (
                <button
                  key={surah.chapter}
                  onClick={() => setSelectedSurah(surah)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-all border-b border-slate-50 flex items-center justify-between group ${selectedSurah?.chapter === surah.chapter ? 'bg-emerald-50 border-emerald-100' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${selectedSurah?.chapter === surah.chapter ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm'}`}>
                      {surah.chapter}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm mb-0.5">{surah.englishname}</div>
                      <div className="text-xs text-slate-500 font-medium">{surah.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-amiri font-bold text-lg text-slate-800 leading-none mb-1">{surah.arabicname}</div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{surah.verses} Ayahs</div>
                  </div>
                </button>
              ))
            )}
            {filteredSurahs.length === 0 && quranChapters.length > 0 && (
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
                  <button onClick={() => { setSelectedSurah(null); setSurahVerses([]); }} className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                    <ArrowLeft size={24} />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl md:text-2xl font-bold text-slate-900">{selectedSurah.englishname}</h2>
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{selectedSurah.revelation}</span>
                    </div>
                    <p className="text-slate-500 text-xs font-medium mt-0.5">{selectedSurah.name} • {selectedSurah.verses} Verses</p>
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
                    {loading ? (
                       <div className="flex flex-col items-center justify-center py-20">
                          <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
                          <p className="text-slate-500">Loading verses...</p>
                       </div>
                    ) : error ? (
                       <div className="flex flex-col items-center justify-center py-20 text-center">
                          <p className="text-red-500 mb-4">{error}</p>
                          <button
                             onClick={() => loadSurahVerses(selectedSurah.chapter)}
                             className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                          >
                             <RefreshCw size={16} /> Retry
                          </button>
                       </div>
                    ) : surahVerses.length > 0 ? (
                       <>
                          {/* Bismillah header for all surahs except Surah 9 (At-Tawbah) */}
                          {selectedSurah.chapter !== 9 && (
                             <div className="text-center py-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                <p className="font-amiri text-3xl text-slate-800 leading-relaxed" dir="rtl">
                                   بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                                </p>
                                <p className="text-slate-500 text-sm mt-2">In the name of Allah, the Most Gracious, the Most Merciful</p>
                             </div>
                          )}
                          {surahVerses.map((verse) => (
                          <div key={verse.verse} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 relative group transition-all hover:shadow-md">

                             {/* Verse Header / Actions */}
                             <div className="flex items-start justify-between mb-8 pb-4 border-b border-slate-50">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold font-sans">
                                      {selectedSurah.chapter}:{verse.verse}
                                   </div>
                                   <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                         onClick={() => toggleAudio(`${selectedSurah.chapter}:${verse.verse}`)}
                                         className={`p-2 rounded-full transition-all ${playingAudioId === `${selectedSurah.chapter}:${verse.verse}` ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-slate-100 text-slate-400'}`}
                                         title="Play Audio"
                                      >
                                         {playingAudioId === `${selectedSurah.chapter}:${verse.verse}` ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
                                      </button>
                                      {quranViewOptions.showTafsir && (
                                        <button
                                           onClick={() => { setActiveTafsirVerse(verse); loadTafsir(selectedSurah.chapter, verse.verse); }}
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
                                   {verse.text}
                                </p>
                             </div>

                             {/* Translation */}
                             <div className="space-y-6">
                                {quranViewOptions.showTranslation && verse.translation && (
                                   <p
                                      className="text-slate-700 leading-relaxed font-light border-l-2 border-slate-100 pl-4"
                                      style={{ fontSize: `${quranViewOptions.translationFontSize}px` }}
                                   >
                                      {verse.translation}
                                   </p>
                                )}
                             </div>
                          </div>
                       ))}
                       </>
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
        {activeTafsirVerse && selectedSurah && (
           <div className="absolute inset-0 z-40 flex justify-end bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full lg:w-[500px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                 <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div>
                       <h3 className="text-lg font-bold text-slate-900">Tafsir</h3>
                       <p className="text-xs text-slate-500 font-medium">Surah {selectedSurah.chapter}, Verse {activeTafsirVerse.verse}</p>
                    </div>
                    <button onClick={() => { setActiveTafsirVerse(null); setTafsirText(''); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                       <X size={24} />
                    </button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
                       <p className="font-amiri text-2xl text-right leading-loose mb-4">{activeTafsirVerse.text}</p>
                       {activeTafsirVerse.translation && (
                          <p className="text-sm text-slate-600 italic">{activeTafsirVerse.translation}</p>
                       )}
                    </div>

                    <div className="prose prose-slate max-w-none">
                       <h4 className="font-bold text-slate-900">Exegesis</h4>
                       {tafsirLoading ? (
                          <div className="flex items-center gap-2 text-slate-500">
                             <Loader2 className="animate-spin" size={16} />
                             Loading tafsir...
                          </div>
                       ) : (
                          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                             {tafsirText}
                          </p>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>
    );
  };

  const renderHadithView = () => {
    const bookKeys = Object.keys(hadithBooks);

    // If no book selected, show book list
    if (!selectedHadithBook) {
      return (
        <div className="animate-fade-in space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Hadith Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookKeys.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
                <p className="text-slate-500">Loading Hadith collections...</p>
              </div>
            ) : (
              bookKeys.map(key => {
                const book = hadithBooks[key];
                // Find English edition for this book
                const englishEdition = book.collection.find(e => e.language === 'English');
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedHadithBook(key);
                      if (englishEdition) {
                        setSelectedHadithEdition(englishEdition.name);
                      }
                    }}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group text-left"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Book size={24} />
                      </div>
                      <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">{book.collection.length} Languages</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{book.name}</h3>
                    <p className="text-sm text-slate-500">{englishEdition?.author || 'Various Authors'}</p>
                  </button>
                );
              })
            )}
          </div>
        </div>
      );
    }

    // If book selected but no section, show sections
    if (selectedSection === null) {
      const bookName = hadithBooks[selectedHadithBook]?.name || selectedHadithBook;
      return (
        <div className="animate-fade-in space-y-6">
          <button
            onClick={() => { setSelectedHadithBook(null); setSelectedHadithEdition(null); setHadithSections([]); }}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <ArrowLeft size={18} /> Back to Collections
          </button>

          <h2 className="text-xl font-bold text-slate-900">{bookName}</h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
              <p className="text-slate-500">Loading sections...</p>
            </div>
          ) : hadithSections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Book size={48} className="text-slate-300 mb-4" />
              <p className="text-slate-500">No sections found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hadithSections.map((section) => (
                <button
                  key={section.hapilesection}
                  onClick={() => setSelectedSection(section.hapilesection)}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                      {section.hapilesection}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 text-sm">{section.name || `Section ${section.hapilesection}`}</h3>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Show hadiths in selected section
    const sectionName = hadithSections.find(s => s.hapilesection === selectedSection)?.name || `Section ${selectedSection}`;
    return (
      <div className="animate-fade-in space-y-6">
        <button
          onClick={() => { setSelectedSection(null); setHadiths([]); }}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
        >
          <ArrowLeft size={18} /> Back to Sections
        </button>

        <h2 className="text-xl font-bold text-slate-900">{sectionName}</h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
            <p className="text-slate-500">Loading hadiths...</p>
          </div>
        ) : hadiths.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Book size={48} className="text-slate-300 mb-4" />
            <p className="text-slate-500">No hadiths found in this section</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hadiths.slice(0, 20).map((hadith, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md">
                    Hadith #{hadith.hadithnumber}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{hadith.text}</p>
                {hadith.grades && hadith.grades.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-500">Grade: {hadith.grades[0]?.grade}</span>
                  </div>
                )}
              </div>
            ))}
            {hadiths.length > 20 && (
              <p className="text-center text-slate-500 text-sm py-4">
                Showing first 20 of {hadiths.length} hadiths
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderDuaView = () => {
    const filteredDuas = duaSearchQuery
      ? islamicService.searchDuas(duaSearchQuery)
      : duas;

    return (
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

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setDuaSearchQuery('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${!duaSearchQuery ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            All
          </button>
          {duaCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setDuaSearchQuery(cat.name)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${duaSearchQuery === cat.name ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredDuas.map(dua => {
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
                       <button className="text-slate-300 hover:text-amber-400">
                          <Heart size={18} />
                       </button>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-3">{dua.title}</h3>
                    <p className="font-amiri text-xl text-right text-slate-800 leading-loose mb-4" dir="rtl">{dua.arabic}</p>
                    {dua.transliteration && (
                      <p className="text-sm text-emerald-700 italic mb-3">{dua.transliteration}</p>
                    )}
                    <p className="text-sm text-slate-600 mb-3">"{dua.translation}"</p>
                    <div className="text-xs text-slate-400 font-medium">{dua.reference}</div>
                 </div>
              );
           })}
        </div>

        {filteredDuas.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Search size={48} className="mx-auto mb-4 opacity-50" />
            <p>No duas found matching "{duaSearchQuery}"</p>
          </div>
        )}
      </div>
    );
  };

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