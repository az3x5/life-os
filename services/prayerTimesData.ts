// Prayer times data for Maldives islands
// Data structure for prayer times by island region

export interface PrayerTime {
  day: string;
  month: string;
  island_reg: string;
  fajr: string;
  sunrise: string;
  duhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface Island {
  island_id: string;
  reg_no: string;
  name_dv: string;
  name_en: string;
  island_type: string;
  lng: string;
  lat: string;
  prayer_table_id: string;
  atoll_code: string;
}

export interface Atoll {
  atoll_id: string;
  code_letter: string;
  name_abbr_dv: string;
  name_abbr_en: string;
  name_official_dv: string;
  name_official_en: string;
  atoll_type: string;
}

// Load prayer times from JSON files
let prayerTimesData: PrayerTime[] | null = null;
let islandsData: Island[] | null = null;
let atollsData: Atoll[] | null = null;

export const loadPrayerTimesData = async (): Promise<PrayerTime[]> => {
  if (prayerTimesData) return prayerTimesData;

  try {
    const response = await fetch('/prayer_times.json');
    const data = await response.json();
    prayerTimesData = data.map((item: any) => ({
      day: item.day,
      month: item.month,
      island_reg: item.island_reg,
      fajr: item.fajr,
      sunrise: item.sunrise,
      duhr: item.duhr,
      asr: item.asr,
      maghrib: item.maghrib,
      isha: item.isha,
    }));
    return prayerTimesData!;
  } catch (error) {
    console.error('Failed to load prayer times data:', error);
    return [];
  }
};

export const loadIslandsData = async (): Promise<Island[]> => {
  if (islandsData) return islandsData;

  try {
    const response = await fetch('/islands.json');
    const data = await response.json();
    islandsData = data.map((item: any) => ({
      island_id: item.island_id,
      reg_no: item.reg_no,
      name_dv: item.name_dv,
      name_en: item.name_en,
      island_type: item.island_type,
      lng: item.lng,
      lat: item.lat,
      prayer_table_id: item.prayer_table_id,
      atoll_code: item.atoll_code,
    }));
    return islandsData!;
  } catch (error) {
    console.error('Failed to load islands data:', error);
    return [];
  }
};

export const loadAtollsData = async (): Promise<Atoll[]> => {
  if (atollsData) return atollsData;

  try {
    const response = await fetch('/atolls.json');
    const data = await response.json();
    atollsData = data.map((item: any) => ({
      atoll_id: item.atoll_id,
      code_letter: item.code_letter,
      name_abbr_dv: item.name_abbr_dv,
      name_abbr_en: item.name_abbr_en,
      name_official_dv: item.name_official_dv,
      name_official_en: item.name_official_en,
      atoll_type: item.atoll_type,
    }));
    return atollsData!;
  } catch (error) {
    console.error('Failed to load atolls data:', error);
    return [];
  }
};

// Get prayer times for a specific date and island region
export const getPrayerTimesForDate = async (
  day: number,
  month: number,
  islandReg: string = 'S'
): Promise<PrayerTime | null> => {
  const data = await loadPrayerTimesData();
  return data.find(
    pt => pt.day === day.toString() && 
          pt.month === month.toString() && 
          pt.island_reg === islandReg
  ) || null;
};

// Get today's prayer times for an island region
export const getTodaysPrayerTimes = async (
  islandReg: string = 'S'
): Promise<PrayerTime | null> => {
  const now = new Date();
  return getPrayerTimesForDate(now.getDate(), now.getMonth() + 1, islandReg);
};

// Get all islands
export const getAllIslands = async (): Promise<Island[]> => {
  return loadIslandsData();
};

// Get all atolls
export const getAllAtolls = async (): Promise<Atoll[]> => {
  return loadAtollsData();
};

// Get islands by atoll
export const getIslandsByAtoll = async (atollCode: string): Promise<Island[]> => {
  const islands = await loadIslandsData();
  return islands.filter(i => i.atoll_code === atollCode);
};

