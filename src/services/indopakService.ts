// خدمة القرآن بخط IndoPak (للغة الأردية)
import indopakData from '@/data/quran/quran-indopak.json';

interface IndoPakVerse {
  surah: number;
  ayah: number;
  text: string;
}

interface IndoPakData {
  pages: { [key: string]: IndoPakVerse[] };
  surahs: { 
    [key: string]: { 
      verse_number: number; 
      verse_key: string; 
      text_indopak: string; 
      page: number;
    }[] 
  };
  totalPages: number;
  totalSurahs: number;
  lastUpdated: string;
}

const quranIndoPak = indopakData as IndoPakData;

/**
 * الحصول على آيات صفحة معينة بخط IndoPak
 */
export function getPageIndoPakAyahs(pageNumber: number): IndoPakVerse[] {
  return quranIndoPak.pages[pageNumber.toString()] || [];
}

/**
 * الحصول على نص آية معينة بخط IndoPak
 */
export function getVerseIndoPak(surahNumber: number, ayahNumber: number): string | null {
  const surah = quranIndoPak.surahs[surahNumber.toString()];
  if (!surah) return null;
  
  const verse = surah.find(v => v.verse_number === ayahNumber);
  return verse ? verse.text_indopak : null;
}

/**
 * الحصول على سورة كاملة بخط IndoPak
 */
export function getSurahIndoPak(surahNumber: number): { verse_number: number; text_indopak: string }[] {
  const surah = quranIndoPak.surahs[surahNumber.toString()];
  if (!surah) return [];
  
  return surah.map(v => ({
    verse_number: v.verse_number,
    text_indopak: v.text_indopak
  }));
}

/**
 * الحصول على نص IndoPak لعدة آيات (للصفحات)
 */
export function getPageIndoPakTexts(
  verses: { surah: number; ayah: number }[]
): Map<string, string> {
  const result = new Map<string, string>();
  
  for (const verse of verses) {
    const verseKey = `${verse.surah}:${verse.ayah}`;
    const text = getVerseIndoPak(verse.surah, verse.ayah);
    if (text) {
      result.set(verseKey, text);
    }
  }
  
  return result;
}

export default {
  getPageIndoPakAyahs,
  getVerseIndoPak,
  getSurahIndoPak,
  getPageIndoPakTexts,
};
