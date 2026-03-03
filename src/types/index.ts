// أنواع البيانات للأذكار
export interface Thikr {
  id: number;
  text: string;
  count: number;
  reference: string;
}

export interface AthkarCategory {
  title: string;
  description: string;
  items: Thikr[];
}

// أنواع البيانات للرقية
export interface RuqyahItem {
  id: number;
  text: string;
  reference: string;
  count: number;
}

export interface RuqyahSection {
  id: string;
  title: string;
  type: 'quran' | 'sunnah';
  items: RuqyahItem[];
}

export interface RuqyahData {
  title: string;
  description: string;
  sections: RuqyahSection[];
}

// أنواع البيانات للقرآن
export interface Surah {
  number: number;
  name: string;
  urduName: string;
  englishName: string;
  ayahCount: number;
  revelationType: 'Meccan' | 'Medinan';
  startPage?: number;
  endPage?: number;
  juz?: number;
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  audio?: string;
  sajda?: boolean;
}

export interface SurahDetail extends Surah {
  ayahs: Ayah[];
}

// أنواع البيانات للقراء
export interface Reciter {
  id: number;
  name: string;
  englishName: string;
  style: string;
  identifier: string;
  audioUrl: string;
}

// أنواع البيانات للمسبحة
export interface TasbeehCounter {
  total: number;
  current: number;
  target: number;
  lastReset: string;
}

// أنواع البيانات للقبلة
export interface QiblaDirection {
  latitude: number;
  longitude: number;
  direction: number;
}

// أنواع البيانات للصلاة
export interface PrayerTime {
  name: string;
  arabicName: string;
  time: string;
}

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
}

// أنواع البيانات للختمة
export interface KhatmahProgress {
  currentSurah: number;
  currentAyah: number;
  currentPage: number;
  lastReadDate: string;
  completedKhatmahs: number;
}

// أنواع البيانات للتاريخ الهجري
export interface HijriDate {
  day: number;
  month: number;
  monthName: string;
  year: number;
  formatted: string;
}

// أنواع الإعدادات
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  selectedReciter: number;
  notificationsEnabled: boolean;
  vibrationEnabled: boolean;
}
