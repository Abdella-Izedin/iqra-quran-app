// خدمة القرآن المحلية - تعمل بدون إنترنت
import quranTextData from '@/data/quran/quran-text.json';
import surahsData from '@/data/quran/surahs.json';
import pagesData from '@/data/quran/pages.json';
import recitersData from '@/data/quran/reciters.json';

// أنواع البيانات
export interface Ayah {
  number: number;
  text: string;
  surah: number;
  surahName: string;
  juz: number;
  hizb: number;
  page: number;
}

export interface Surah {
  number: number;
  name: string;
  urduName: string;
  englishName: string;
  ayahCount: number;
  revelationType: string;
  startPage: number;
  endPage: number;
  juz: number;
}

export interface Reciter {
  id: number;
  name: string;
  urduName: string;
  englishName: string;
  style: string;
  urduStyle: string;
  audioUrl: string;
  sampleSurah: number;
}

export interface JuzInfo {
  juz: number;
  name: string;
  startPage: number;
  startSurah: number;
  startAyah: number;
}

export interface HizbInfo {
  hizb: number;
  startPage: number;
}

// بيانات القرآن
const quranData = quranTextData as {
  pages: { [key: string]: Ayah[] };
  totalPages: number;
  lastUpdated: string;
};

// =============== وظائف المصحف ===============

/**
 * الحصول على آيات صفحة معينة
 */
export function getPageAyahs(pageNumber: number): Ayah[] {
  const page = quranData.pages[pageNumber.toString()];
  return page || [];
}

/**
 * الحصول على عدد الصفحات الإجمالي
 */
export function getTotalPages(): number {
  return quranData.totalPages;
}

/**
 * الحصول على معلومات السورة من رقم الصفحة
 */
export function getSurahInfoFromPage(pageNumber: number): Surah | null {
  const ayahs = getPageAyahs(pageNumber);
  if (ayahs.length === 0) return null;
  
  const surahNumber = ayahs[0].surah;
  return getSurahByNumber(surahNumber);
}

/**
 * الحصول على اسم السورة من رقم الصفحة
 */
export function getSurahNameByPage(pageNumber: number): string {
  const surah = getSurahInfoFromPage(pageNumber);
  return surah?.name || '';
}

// =============== وظائف السور ===============

/**
 * الحصول على جميع السور
 */
export function getAllSurahs(): Surah[] {
  return (surahsData as { surahs: Surah[] }).surahs;
}

/**
 * الحصول على سورة برقمها
 */
export function getSurahByNumber(number: number): Surah | null {
  const surahs = getAllSurahs();
  return surahs.find(s => s.number === number) || null;
}

/**
 * الحصول على آيات سورة كاملة
 */
export function getSurahAyahs(surahNumber: number): Ayah[] {
  const surah = getSurahByNumber(surahNumber);
  if (!surah) return [];
  
  const ayahs: Ayah[] = [];
  for (let page = surah.startPage; page <= surah.endPage; page++) {
    const pageAyahs = getPageAyahs(page);
    ayahs.push(...pageAyahs.filter(a => a.surah === surahNumber));
  }
  
  return ayahs;
}

/**
 * البحث في السور
 */
export function searchSurahs(query: string): Surah[] {
  const surahs = getAllSurahs();
  const lowerQuery = query.toLowerCase().trim();
  
  return surahs.filter(surah => 
    surah.name.includes(query) ||
    surah.urduName.includes(query) ||
    surah.englishName.toLowerCase().includes(lowerQuery) ||
    surah.number.toString() === query
  );
}

// =============== وظائف الأجزاء والأحزاب ===============

/**
 * الحصول على بيانات الأجزاء
 */
export function getAllJuz(): JuzInfo[] {
  return (pagesData as { juzData: JuzInfo[] }).juzData;
}

/**
 * الحصول على بيانات الأحزاب
 */
export function getAllHizb(): HizbInfo[] {
  return (pagesData as { hizbData: HizbInfo[] }).hizbData;
}

/**
 * الحصول على رقم الجزء من الصفحة
 */
export function getJuzFromPage(pageNumber: number): number {
  const juzData = getAllJuz();
  for (let i = juzData.length - 1; i >= 0; i--) {
    if (pageNumber >= juzData[i].startPage) {
      return juzData[i].juz;
    }
  }
  return 1;
}

/**
 * الحصول على رقم الحزب من الصفحة
 */
export function getHizbFromPage(pageNumber: number): number {
  const hizbData = getAllHizb();
  for (let i = hizbData.length - 1; i >= 0; i--) {
    if (pageNumber >= hizbData[i].startPage) {
      return hizbData[i].hizb;
    }
  }
  return 1;
}

// =============== وظائف القراء ===============

/**
 * الحصول على جميع القراء
 */
export function getAllReciters(): Reciter[] {
  return (recitersData as { reciters: Reciter[] }).reciters;
}

/**
 * الحصول على قارئ برقمه
 */
export function getReciterById(id: number): Reciter | null {
  const reciters = getAllReciters();
  return reciters.find(r => r.id === id) || null;
}

/**
 * الحصول على رابط تلاوة سورة لقارئ معين
 */
export function getRecitationUrl(reciterId: number, surahNumber: number): string {
  const reciter = getReciterById(reciterId);
  if (!reciter) return '';
  
  // تنسيق رقم السورة ليكون 3 أرقام (001, 002, ... 114)
  const paddedNumber = surahNumber.toString().padStart(3, '0');
  return `${reciter.audioUrl}/${paddedNumber}.mp3`;
}

// =============== وظائف مساعدة ===============

/**
 * الحصول على السور في جزء معين
 */
export function getSurahsInJuz(juzNumber: number): Surah[] {
  const juzData = getAllJuz();
  const currentJuz = juzData.find(j => j.juz === juzNumber);
  const nextJuz = juzData.find(j => j.juz === juzNumber + 1);
  
  if (!currentJuz) return [];
  
  const startPage = currentJuz.startPage;
  const endPage = nextJuz ? nextJuz.startPage - 1 : 604;
  
  const surahs = getAllSurahs();
  return surahs.filter(surah => 
    (surah.startPage >= startPage && surah.startPage <= endPage) ||
    (surah.endPage >= startPage && surah.endPage <= endPage) ||
    (surah.startPage <= startPage && surah.endPage >= endPage)
  );
}

/**
 * البحث في آيات القرآن
 */
export function searchQuran(query: string): Ayah[] {
  const results: Ayah[] = [];
  const normalizedQuery = query.trim();
  
  if (!normalizedQuery) return results;
  
  for (let page = 1; page <= quranData.totalPages; page++) {
    const ayahs = getPageAyahs(page);
    for (const ayah of ayahs) {
      if (ayah.text.includes(normalizedQuery)) {
        results.push(ayah);
        if (results.length >= 50) return results; // حد أقصى 50 نتيجة
      }
    }
  }
  
  return results;
}

/**
 * التحقق من توفر البيانات
 */
export function isDataAvailable(): boolean {
  return quranData.totalPages === 604 && Object.keys(quranData.pages).length === 604;
}

export default {
  // المصحف
  getPageAyahs,
  getTotalPages,
  getSurahInfoFromPage,
  
  // السور
  getAllSurahs,
  getSurahByNumber,
  getSurahAyahs,
  searchSurahs,
  
  // الأجزاء والأحزاب
  getAllJuz,
  getAllHizb,
  getJuzFromPage,
  getHizbFromPage,
  
  // القراء
  getAllReciters,
  getReciterById,
  getRecitationUrl,
  
  // مساعدة
  getSurahsInJuz,
  searchQuran,
  isDataAvailable
};
