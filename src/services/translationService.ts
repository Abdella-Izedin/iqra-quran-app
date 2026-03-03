// خدمة الترجمات المحلية
import maududiData from '@/data/translations/urdu-maududi.json';
import jalandhryData from '@/data/translations/urdu-jalandhry.json';
import jalandhriData from '@/data/translations/urdu-jalandhri.json';
import wahiduddinData from '@/data/translations/urdu-wahiduddin.json';

export interface TranslationVerse {
  ayah: number;
  text: string;
}

export interface TranslationData {
  id: number;
  name: string;
  displayName: string;
  surahs: { [key: string]: TranslationVerse[] };
  totalSurahs: number;
  lastUpdated: string;
}

// قائمة الترجمات المتوفرة
const translations: { [key: number]: TranslationData } = {
  97: maududiData as TranslationData,
  54: jalandhryData as TranslationData,
  234: jalandhriData as TranslationData,
  819: wahiduddinData as TranslationData,
};

/**
 * الحصول على قائمة الترجمات المتوفرة
 */
export function getAvailableTranslations() {
  return [
    { id: 97, name: 'تفہیم القرآن - مولانا مودودی' },
    { id: 54, name: 'مولانا جونا گڑھی' },
    { id: 234, name: 'فتح محمد جالندھری' },
    { id: 819, name: 'مولانا وحید الدین خان' },
  ];
}

/**
 * الحصول على ترجمة آية معينة
 */
export function getVerseTranslation(translationId: number, surahNumber: number, ayahNumber: number): string | null {
  const translation = translations[translationId];
  if (!translation) return null;
  
  const surahTranslations = translation.surahs[surahNumber.toString()];
  if (!surahTranslations) return null;
  
  const verse = surahTranslations.find(v => v.ayah === ayahNumber);
  return verse ? verse.text : null;
}

/**
 * الحصول على ترجمة سورة كاملة
 */
export function getSurahTranslation(translationId: number, surahNumber: number): TranslationVerse[] {
  const translation = translations[translationId];
  if (!translation) return [];
  
  return translation.surahs[surahNumber.toString()] || [];
}

/**
 * الحصول على ترجمات لعدة آيات (للصفحات)
 */
export function getPageTranslations(
  translationId: number,
  verses: { surah: number; ayah: number }[]
): Map<string, string> {
  const result = new Map<string, string>();
  const translation = translations[translationId];
  
  if (!translation) return result;
  
  for (const verse of verses) {
    const verseKey = `${verse.surah}:${verse.ayah}`;
    const text = getVerseTranslation(translationId, verse.surah, verse.ayah);
    if (text) {
      result.set(verseKey, text);
    }
  }
  
  return result;
}

/**
 * التحقق من توفر ترجمة معينة
 */
export function isTranslationAvailable(translationId: number): boolean {
  return translations[translationId] !== undefined;
}

export default {
  getAvailableTranslations,
  getVerseTranslation,
  getSurahTranslation,
  getPageTranslations,
  isTranslationAvailable,
};
