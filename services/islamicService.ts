// services/islamicService.ts
// Comprehensive Islamic API Service with local caching

// API Base URLs
const QURAN_API_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1';
const HADITH_API_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';
const TAFSIR_API_BASE = 'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir';

// Local Storage Keys for caching
const CACHE_KEYS = {
  QURAN_CHAPTERS: 'islamic_quran_chapters',
  QURAN_EDITIONS: 'islamic_quran_editions',
  HADITH_EDITIONS: 'islamic_hadith_editions',
  TAFSIR_EDITIONS: 'islamic_tafsir_editions',
  DUAS: 'islamic_duas',
  CACHE_TIMESTAMP: 'islamic_cache_timestamp',
};

// Cache duration: 7 days
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

// Helper to check if cache is valid
const isCacheValid = (): boolean => {
  const timestamp = localStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP);
  if (!timestamp) return false;
  return Date.now() - parseInt(timestamp) < CACHE_DURATION;
};

// Helper to get cached data
const getCached = <T>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    if (data && isCacheValid()) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Cache read error:', e);
  }
  return null;
};

// Helper to set cached data
const setCache = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
  } catch (e) {
    console.error('Cache write error:', e);
  }
};

// ============================================
// QURAN API
// ============================================

export interface QuranChapter {
  chapter: number;
  name: string;
  englishname: string;
  arabicname: string;
  revelation: string;
  verses: number;
}

export interface QuranVerse {
  verse: number;
  text: string;
  translation?: string;
}

export interface QuranEdition {
  name: string;
  language: string;
  author?: string;
}

// Get all Quran chapters info
export const getQuranChapters = async (): Promise<QuranChapter[]> => {
  const cached = getCached<QuranChapter[]>(CACHE_KEYS.QURAN_CHAPTERS);
  if (cached) return cached;

  const response = await fetch(`${QURAN_API_BASE}/info.json`);
  if (!response.ok) throw new Error('Failed to fetch Quran chapters');

  const data = await response.json();
  // Transform the API data - verses is an array, we need the count
  const chapters = (data.chapters || []).map((ch: any) => ({
    chapter: ch.chapter,
    name: ch.name,
    englishname: ch.englishname,
    arabicname: ch.arabicname,
    revelation: ch.revelation,
    verses: Array.isArray(ch.verses) ? ch.verses.length : ch.verses,
  }));
  setCache(CACHE_KEYS.QURAN_CHAPTERS, chapters);
  return chapters;
};

// Get available Quran editions/translations
export const getQuranEditions = async (): Promise<Record<string, QuranEdition>> => {
  const cached = getCached<Record<string, QuranEdition>>(CACHE_KEYS.QURAN_EDITIONS);
  if (cached) return cached;

  const response = await fetch(`${QURAN_API_BASE}/editions.json`);
  if (!response.ok) throw new Error('Failed to fetch Quran editions');

  const data = await response.json();
  setCache(CACHE_KEYS.QURAN_EDITIONS, data);
  return data;
};

// Get a specific Quran chapter with Arabic and translation
export const getQuranChapter = async (
  chapterNumber: number,
  edition: string = 'eng-ummmuhammad'
): Promise<{ chapter: number; verses: QuranVerse[] }> => {
  const cacheKey = `quran_chapter_${chapterNumber}_${edition}`;
  const cached = getCached<{ chapter: number; verses: QuranVerse[] }>(cacheKey);
  if (cached) return cached;

  // Fetch translation
  const response = await fetch(`${QURAN_API_BASE}/editions/${edition}/${chapterNumber}.json`);
  if (!response.ok) throw new Error(`Failed to fetch Quran chapter ${chapterNumber}`);
  const editionData = await response.json();

  // Fetch Arabic text - using ara-quranacademy which has proper verse separation
  const arabicResponse = await fetch(`${QURAN_API_BASE}/editions/ara-quranacademy/${chapterNumber}.json`);
  if (!arabicResponse.ok) throw new Error(`Failed to fetch Arabic for chapter ${chapterNumber}`);
  const arabicData = await arabicResponse.json();

  // Bismillah handling:
  // - Surah 1 (Al-Fatiha): Bismillah IS verse 1, we skip it since we show it as header
  // - Surah 9 (At-Tawbah): No Bismillah at all
  // - Other surahs (2-8, 10-114): Bismillah is embedded in verse 1 text, we strip it
  const bismillahPattern = /^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*|^بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ\s*/;

  // Combine Arabic and translation
  let verses = (editionData.chapter || []).map((verse: any, index: number) => {
    let arabicText = arabicData.chapter?.[index]?.text || '';

    // Strip Bismillah from verse 1 for surahs 2-8 and 10-114
    if (chapterNumber !== 1 && chapterNumber !== 9 && verse.verse === 1) {
      arabicText = arabicText.replace(bismillahPattern, '').trim();
    }

    return {
      verse: verse.verse || index + 1,
      text: arabicText,
      translation: verse.text || '',
    };
  });

  // For Al-Fatiha, skip verse 1 (Bismillah) since we show it as a header
  // and renumber verses to start from 1
  if (chapterNumber === 1) {
    verses = verses.slice(1).map((v, idx) => ({
      ...v,
      verse: idx + 1
    }));
  }

  const result = { chapter: chapterNumber, verses };
  setCache(cacheKey, result);
  return result;
};

// Get a specific verse
export const getQuranVerse = async (
  chapterNumber: number,
  verseNumber: number,
  edition: string = 'eng-ummmuhammad'
): Promise<QuranVerse> => {
  const response = await fetch(`${QURAN_API_BASE}/editions/${edition}/${chapterNumber}/${verseNumber}.json`);
  if (!response.ok) throw new Error(`Failed to fetch verse ${chapterNumber}:${verseNumber}`);
  return await response.json();
};

// ============================================
// TAFSIR API
// ============================================

export interface TafsirEdition {
  id: number;
  name: string;
  author_name: string;
  slug: string;
  language_name: string;
}

export interface TafsirAyah {
  ayah: number;
  text: string;
}

// Get all Tafsir editions
export const getTafsirEditions = async (): Promise<TafsirEdition[]> => {
  const cached = getCached<TafsirEdition[]>(CACHE_KEYS.TAFSIR_EDITIONS);
  if (cached) return cached;

  const response = await fetch(`${TAFSIR_API_BASE}/editions.json`);
  if (!response.ok) throw new Error('Failed to fetch Tafsir editions');

  const data = await response.json();
  setCache(CACHE_KEYS.TAFSIR_EDITIONS, data);
  return data;
};

// Get Tafsir for a specific surah
export const getTafsirForSurah = async (
  surahNumber: number,
  edition: string = 'en-tafisr-ibn-kathir'
): Promise<{ surah: number; ayahs: TafsirAyah[] }> => {
  const cacheKey = `tafsir_${edition}_${surahNumber}`;
  const cached = getCached<{ surah: number; ayahs: TafsirAyah[] }>(cacheKey);
  if (cached) return cached;

  const response = await fetch(`${TAFSIR_API_BASE}/${edition}/${surahNumber}.json`);
  if (!response.ok) throw new Error(`Failed to fetch Tafsir for surah ${surahNumber}`);

  const data = await response.json();
  const result = { surah: surahNumber, ayahs: data.ayahs || data };
  setCache(cacheKey, result);
  return result;
};

// Get Tafsir for a specific ayah
export const getTafsirForAyah = async (
  surahNumber: number,
  ayahNumber: number,
  edition: string = 'en-tafisr-ibn-kathir'
): Promise<TafsirAyah> => {
  const response = await fetch(`${TAFSIR_API_BASE}/${edition}/${surahNumber}/${ayahNumber}.json`);
  if (!response.ok) throw new Error(`Failed to fetch Tafsir for ${surahNumber}:${ayahNumber}`);
  return await response.json();
};

// ============================================
// HADITH API
// ============================================

export interface HadithBook {
  name: string;
  collection: HadithEditionDetail[];
}

export interface HadithEditionDetail {
  name: string;
  book: string;
  author: string;
  language: string;
  has_sections: boolean;
  direction: string;
  link: string;
}

export interface HadithSection {
  hapilesection: number;
  name: string;
}

export interface Hadith {
  hadithnumber: number;
  arabicnumber?: number;
  text: string;
  grades?: { name: string; grade: string }[];
  reference?: { book: number; hadith: number };
}

export interface HadithFullEdition {
  metadata: {
    name: string;
    sections: Record<string, string>;
    section_details: Record<string, { hadithnumber_first: number; hadithnumber_last: number }>;
  };
  hadiths: Hadith[];
}

// Get all Hadith editions (book -> language -> edition mapping)
export const getHadithEditions = async (): Promise<Record<string, HadithBook>> => {
  const cached = getCached<Record<string, HadithBook>>(CACHE_KEYS.HADITH_EDITIONS);
  if (cached) return cached;

  const response = await fetch(`${HADITH_API_BASE}/editions.json`);
  if (!response.ok) throw new Error('Failed to fetch Hadith editions');

  const data = await response.json();
  setCache(CACHE_KEYS.HADITH_EDITIONS, data);
  return data;
};

// Get full Hadith edition with all data
export const getHadithEditionFull = async (editionName: string): Promise<HadithFullEdition> => {
  const cacheKey = `hadith_full_${editionName}`;
  const cached = getCached<HadithFullEdition>(cacheKey);
  if (cached) return cached;

  const response = await fetch(`${HADITH_API_BASE}/editions/${editionName}.json`);
  if (!response.ok) throw new Error(`Failed to fetch edition ${editionName}`);

  const data = await response.json();
  setCache(cacheKey, data);
  return data;
};

// Get sections of a Hadith collection from the full edition
export const getHadithSections = async (editionName: string): Promise<HadithSection[]> => {
  const cacheKey = `hadith_sections_${editionName}`;
  const cached = getCached<HadithSection[]>(cacheKey);
  if (cached) return cached;

  const fullEdition = await getHadithEditionFull(editionName);
  const sections = Object.entries(fullEdition.metadata.sections)
    .filter(([key]) => key !== '0') // Skip empty section 0
    .map(([key, name]) => ({
      hapilesection: parseInt(key),
      name: name as string
    }));

  setCache(cacheKey, sections);
  return sections;
};

// Get hadiths from a specific section
export const getHadithsBySection = async (
  editionName: string,
  sectionNumber: number
): Promise<Hadith[]> => {
  const cacheKey = `hadith_${editionName}_section_${sectionNumber}`;
  const cached = getCached<Hadith[]>(cacheKey);
  if (cached) return cached;

  const fullEdition = await getHadithEditionFull(editionName);
  const sectionDetails = fullEdition.metadata.section_details[sectionNumber.toString()];

  if (!sectionDetails) {
    return [];
  }

  const hadiths = fullEdition.hadiths.filter(
    h => h.hadithnumber >= sectionDetails.hadithnumber_first &&
         h.hadithnumber <= sectionDetails.hadithnumber_last
  );

  setCache(cacheKey, hadiths);
  return hadiths;
};

// Get a specific hadith by number
export const getHadithByNumber = async (
  edition: string,
  hadithNumber: number
): Promise<Hadith> => {
  const response = await fetch(`${HADITH_API_BASE}/editions/${edition}/${hadithNumber}.json`);
  if (!response.ok) throw new Error(`Failed to fetch hadith ${hadithNumber}`);
  return await response.json();
};

// ============================================
// DUA API - Using local data + external API
// ============================================

export interface Dua {
  id: string;
  title: string;
  arabic: string;
  transliteration?: string;
  translation: string;
  reference?: string;
  category: string;
  audio_url?: string;
}

export interface DuaCategory {
  id: string;
  name: string;
  count: number;
}

// Comprehensive Dua collection (embedded for offline use)
const DUAS_DATA: Dua[] = [
  // Morning & Evening Adhkar
  {
    id: 'morning-1',
    title: 'Morning Remembrance',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: "Asbahna wa asbahal mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul mulku wa lahul hamdu wa huwa 'ala kulli shay'in qadeer",
    translation: 'We have reached the morning and at this very time all sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without partner. To Him belongs all sovereignty and praise and He is over all things omnipotent.',
    reference: 'Muslim 4/2088',
    category: 'Morning & Evening'
  },
  {
    id: 'evening-1',
    title: 'Evening Remembrance',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: "Amsayna wa amsal mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul mulku wa lahul hamdu wa huwa 'ala kulli shay'in qadeer",
    translation: 'We have reached the evening and at this very time all sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without partner. To Him belongs all sovereignty and praise and He is over all things omnipotent.',
    reference: 'Muslim 4/2088',
    category: 'Morning & Evening'
  },
  {
    id: 'morning-2',
    title: 'Sayyid al-Istighfar (Morning)',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliteration: "Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bini'matika 'alayya, wa abu'u bidhanbi faghfir li fa innahu la yaghfirudh-dhunuba illa anta",
    translation: 'O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me and I acknowledge my sin, so forgive me, for verily none can forgive sins except You.',
    reference: 'Bukhari 7/150',
    category: 'Morning & Evening'
  },
  // Prayer Duas
  {
    id: 'prayer-1',
    title: 'Opening Dua (Istiftah)',
    arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ',
    transliteration: "Subhanaka Allahumma wa bihamdika, wa tabarakasmuka, wa ta'ala jadduka, wa la ilaha ghayruka",
    translation: 'Glory be to You, O Allah, and praise. Blessed is Your Name and exalted is Your Majesty. There is no god but You.',
    reference: 'Abu Dawud, Tirmidhi',
    category: 'Prayer'
  },
  {
    id: 'prayer-2',
    title: 'Dua between Sajdah',
    arabic: 'رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي',
    transliteration: 'Rabbighfir li, Rabbighfir li',
    translation: 'My Lord, forgive me. My Lord, forgive me.',
    reference: 'Abu Dawud, Ibn Majah',
    category: 'Prayer'
  },
  {
    id: 'prayer-3',
    title: 'Tashahhud',
    arabic: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    transliteration: "At-tahiyyatu lillahi was-salawatu wat-tayyibat, as-salamu 'alayka ayyuhan-nabiyyu wa rahmatullahi wa barakatuh, as-salamu 'alayna wa 'ala 'ibadillahis-salihin, ash-hadu an la ilaha illallah wa ash-hadu anna Muhammadan 'abduhu wa rasuluh",
    translation: 'All greetings, prayers and good things are for Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah and I bear witness that Muhammad is His servant and messenger.',
    reference: 'Bukhari, Muslim',
    category: 'Prayer'
  },
  // Protection Duas
  {
    id: 'protection-1',
    title: 'Ayatul Kursi',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration: "Allahu la ilaha illa huwal hayyul qayyum. La ta'khudhuhu sinatun wa la nawm. Lahu ma fis-samawati wa ma fil-ard. Man dhal-ladhi yashfa'u 'indahu illa bi-idhnih. Ya'lamu ma bayna aydihim wa ma khalfahum. Wa la yuhituna bi shay'im min 'ilmihi illa bima sha'. Wasi'a kursiyyuhus-samawati wal-ard. Wa la ya'uduhu hifdhuhuma. Wa huwal 'aliyyul 'adhim",
    translation: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.',
    reference: 'Quran 2:255',
    category: 'Protection'
  },
  {
    id: 'protection-2',
    title: 'Seeking Refuge',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transliteration: "A'udhu bikalimatillahit-tammati min sharri ma khalaq",
    translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
    reference: 'Muslim 4/2081',
    category: 'Protection'
  },
  // Sleep Duas
  {
    id: 'sleep-1',
    title: 'Before Sleeping',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: 'Bismika Allahumma amutu wa ahya',
    translation: 'In Your name, O Allah, I die and I live.',
    reference: 'Bukhari 11/113',
    category: 'Sleep'
  },
  {
    id: 'sleep-2',
    title: 'Upon Waking Up',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration: 'Alhamdu lillahil-ladhi ahyana ba\'da ma amatana wa ilayhin-nushur',
    translation: 'All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.',
    reference: 'Bukhari 11/113',
    category: 'Sleep'
  },
  // Food & Drink
  {
    id: 'food-1',
    title: 'Before Eating',
    arabic: 'بِسْمِ اللَّهِ',
    transliteration: 'Bismillah',
    translation: 'In the name of Allah.',
    reference: 'Abu Dawud, Tirmidhi',
    category: 'Food & Drink'
  },
  {
    id: 'food-2',
    title: 'After Eating',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    transliteration: "Alhamdu lillahil-ladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah",
    translation: 'All praise is for Allah who fed me this and provided it for me without any might or power from myself.',
    reference: 'Abu Dawud, Tirmidhi',
    category: 'Food & Drink'
  },
  // Travel
  {
    id: 'travel-1',
    title: 'When Starting a Journey',
    arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
    transliteration: "Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila rabbina lamunqalibun",
    translation: 'Glory to Him who has subjected this to us, and we could never have it by our efforts. And unto our Lord we shall return.',
    reference: 'Quran 43:13-14',
    category: 'Travel'
  },
  // Distress & Anxiety
  {
    id: 'distress-1',
    title: 'Dua for Anxiety',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ',
    transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan, wa a'udhu bika minal-'ajzi wal-kasal, wa a'udhu bika minal-jubni wal-bukhl, wa a'udhu bika min ghalabatid-dayni wa qahrir-rijal",
    translation: 'O Allah, I seek refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and from being overpowered by men.',
    reference: 'Bukhari 7/158',
    category: 'Distress'
  },
  // Forgiveness
  {
    id: 'forgiveness-1',
    title: 'Seeking Forgiveness',
    arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
    transliteration: "Astaghfirullaha al-'adhim alladhi la ilaha illa huwal-hayyul-qayyum wa atubu ilayh",
    translation: 'I seek the forgiveness of Allah the Mighty, whom there is no god but He, the Living, the Sustainer, and I repent to Him.',
    reference: 'Abu Dawud, Tirmidhi',
    category: 'Forgiveness'
  },
  // Quranic Duas
  {
    id: 'quran-1',
    title: 'Dua of Prophet Ibrahim',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar",
    translation: 'Our Lord, give us in this world that which is good and in the Hereafter that which is good and protect us from the punishment of the Fire.',
    reference: 'Quran 2:201',
    category: 'Quranic'
  },
  {
    id: 'quran-2',
    title: 'Dua for Knowledge',
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    transliteration: 'Rabbi zidni ilma',
    translation: 'My Lord, increase me in knowledge.',
    reference: 'Quran 20:114',
    category: 'Quranic'
  },
  {
    id: 'quran-3',
    title: 'Dua of Prophet Yunus',
    arabic: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    transliteration: 'La ilaha illa anta subhanaka inni kuntu minaz-zalimin',
    translation: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.',
    reference: 'Quran 21:87',
    category: 'Quranic'
  }
];

// Get all dua categories
export const getDuaCategories = (): DuaCategory[] => {
  const categories = new Map<string, number>();
  DUAS_DATA.forEach(dua => {
    categories.set(dua.category, (categories.get(dua.category) || 0) + 1);
  });

  return Array.from(categories.entries()).map(([name, count]) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    count
  }));
};

// Get all duas
export const getAllDuas = (): Dua[] => DUAS_DATA;

// Get duas by category
export const getDuasByCategory = (category: string): Dua[] => {
  return DUAS_DATA.filter(dua =>
    dua.category.toLowerCase() === category.toLowerCase() ||
    dua.category.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase()
  );
};

// Search duas
export const searchDuas = (query: string): Dua[] => {
  const lowerQuery = query.toLowerCase();
  return DUAS_DATA.filter(dua =>
    dua.title.toLowerCase().includes(lowerQuery) ||
    dua.translation.toLowerCase().includes(lowerQuery) ||
    dua.category.toLowerCase().includes(lowerQuery)
  );
};

// ============================================
// PRAYER TIMES API
// ============================================

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
}

// Get prayer times using Aladhan API
export const getPrayerTimes = async (
  latitude: number,
  longitude: number,
  method: number = 2 // ISNA
): Promise<PrayerTimes> => {
  const today = new Date();
  const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

  const response = await fetch(
    `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${method}`
  );

  if (!response.ok) throw new Error('Failed to fetch prayer times');

  const data = await response.json();
  const timings = data.data.timings;

  return {
    fajr: timings.Fajr,
    sunrise: timings.Sunrise,
    dhuhr: timings.Dhuhr,
    asr: timings.Asr,
    maghrib: timings.Maghrib,
    isha: timings.Isha,
    date: data.data.date.readable
  };
};

// Get monthly prayer times
export const getMonthlyPrayerTimes = async (
  latitude: number,
  longitude: number,
  month: number,
  year: number,
  method: number = 2
): Promise<PrayerTimes[]> => {
  const response = await fetch(
    `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=${method}`
  );

  if (!response.ok) throw new Error('Failed to fetch monthly prayer times');

  const data = await response.json();
  return data.data.map((day: any) => ({
    fajr: day.timings.Fajr.split(' ')[0],
    sunrise: day.timings.Sunrise.split(' ')[0],
    dhuhr: day.timings.Dhuhr.split(' ')[0],
    asr: day.timings.Asr.split(' ')[0],
    maghrib: day.timings.Maghrib.split(' ')[0],
    isha: day.timings.Isha.split(' ')[0],
    date: day.date.readable
  }));
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Clear all cached data
export const clearIslamicCache = (): void => {
  Object.values(CACHE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  // Also clear chapter-specific caches
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('quran_chapter_') || key.startsWith('tafsir_') || key.startsWith('hadith_'))) {
      localStorage.removeItem(key);
    }
  }
};

// Preload essential data
export const preloadIslamicData = async (): Promise<void> => {
  try {
    await Promise.all([
      getQuranChapters(),
      getQuranEditions(),
      getHadithEditions(),
      getTafsirEditions()
    ]);
    console.log('Islamic data preloaded successfully');
  } catch (error) {
    console.error('Failed to preload Islamic data:', error);
  }
};
