// خدمة التفسير المحلية - جميع التفاسير
import muyassarData from '@/data/tafsir/muyassar.json';
import ibnkathirData from '@/data/tafsir/ibnkathir.json';
import saadiData from '@/data/tafsir/saadi.json';
import waseetData from '@/data/tafsir/waseet.json';
import qurtubiData from '@/data/tafsir/qurtubi.json';
import baghawiData from '@/data/tafsir/baghawi.json';
import tabariData from '@/data/tafsir/tabari.json';

export interface TafsirVerse {
  ayah: number;
  text: string;
}

export interface TafsirData {
  id: number;
  name: string;
  displayName: string;
  surahs: { [key: string]: TafsirVerse[] };
  lastUpdated: string;
}

// قائمة التفاسير المتوفرة - IDs العربية الصحيحة
const tafsirs: { [key: number]: TafsirData } = {
  16: muyassarData as TafsirData,
  14: ibnkathirData as TafsirData,  // ID العربي الصحيح
  91: saadiData as TafsirData,
  93: waseetData as TafsirData,
  90: qurtubiData as TafsirData,
  94: baghawiData as TafsirData,
  15: tabariData as TafsirData,
};

/**
 * الحصول على قائمة التفاسير المتوفرة
 */
export function getAvailableTafsirs() {
  return [
    { id: 16, name: 'التفسير الميسر', size: '0.38 MB' },
    { id: 14, name: 'تفسير ابن كثير', size: '2.81 MB' },  // ID العربي الصحيح
    { id: 91, name: 'تفسير السعدي', size: '0.87 MB' },
    { id: 93, name: 'التفسير الوسيط', size: '2.84 MB' },
    { id: 90, name: 'تفسير القرطبي', size: '3.58 MB' },
    { id: 94, name: 'تفسير البغوي', size: '1.35 MB' },
    { id: 15, name: 'تفسير الطبري', size: '4.95 MB' },
  ];
}

/**
 * الحصول على تفسير آية معينة
 */
export function getVerseTafsir(tafsirId: number, surahNumber: number, ayahNumber: number): string | null {
  const tafsir = tafsirs[tafsirId];
  if (!tafsir) return null;
  
  const surahTafsirs = tafsir.surahs[surahNumber.toString()];
  if (!surahTafsirs) return null;
  
  const verse = surahTafsirs.find(v => v.ayah === ayahNumber);
  return verse ? verse.text : null;
}

/**
 * الحصول على تفسير سورة كاملة
 */
export function getSurahTafsir(tafsirId: number, surahNumber: number): TafsirVerse[] {
  const tafsir = tafsirs[tafsirId];
  if (!tafsir) return [];
  
  return tafsir.surahs[surahNumber.toString()] || [];
}

/**
 * التحقق من توفر تفسير معين
 */
export function isTafsirAvailable(tafsirId: number): boolean {
  return tafsirs[tafsirId] !== undefined;
}

/**
 * الحصول على اسم التفسير
 */
export function getTafsirName(tafsirId: number): string {
  const available = getAvailableTafsirs();
  const tafsir = available.find(t => t.id === tafsirId);
  return tafsir ? tafsir.name : 'غير معروف';
}

export default {
  getAvailableTafsirs,
  getVerseTafsir,
  getSurahTafsir,
  isTafsirAvailable,
  getTafsirName,
};
