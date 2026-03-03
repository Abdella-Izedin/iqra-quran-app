// خدمة الأحاديث المحلية
import bukhariData from '@/data/hadith/bukhari.json';
import muslimData from '@/data/hadith/muslim.json';
import abudawudData from '@/data/hadith/abudawud.json';
import tirmidhiData from '@/data/hadith/tirmidhi.json';
import nasaiData from '@/data/hadith/nasai.json';
import ibnmajahData from '@/data/hadith/ibnmajah.json';
import malikData from '@/data/hadith/malik.json';
import nawawiRawData from '@/data/hadith/nawawi40.json';
import qudsiRawData from '@/data/hadith/qudsi.json';

export interface Hadith {
  number: number;
  arabic: string;
  chapter?: string | number;
}

export interface HadithBook {
  id: string;
  name: string;
  urduName: string;
  totalHadith: number;
  hadiths: Hadith[];
  lastUpdated: string;
}

// تحويل بيانات النووية والقدسية (arabicText -> arabic)
function convertSpecialHadithBook(rawData: { collection: string; name: string; urduName: string; totalHadith: number; hadiths: { number: number; arabicText: string; urduText?: string; theme?: string }[]; lastUpdated: string }): HadithBook {
  return {
    id: rawData.collection,
    name: rawData.name,
    urduName: rawData.urduName,
    totalHadith: rawData.totalHadith,
    hadiths: rawData.hadiths.map(h => ({
      number: h.number,
      arabic: h.arabicText,
      chapter: h.theme || undefined,
    })),
    lastUpdated: rawData.lastUpdated,
  };
}

// خريطة الكتب
const hadithBooks: { [key: string]: HadithBook } = {
  bukhari: bukhariData as HadithBook,
  muslim: muslimData as HadithBook,
  abudawud: abudawudData as HadithBook,
  tirmidhi: tirmidhiData as HadithBook,
  nasai: nasaiData as HadithBook,
  ibnmajah: ibnmajahData as HadithBook,
  malik: malikData as HadithBook,
  nawawi: convertSpecialHadithBook(nawawiRawData),
  qudsi: convertSpecialHadithBook(qudsiRawData),
};

/**
 * الحصول على قائمة كتب الأحاديث المتوفرة
 */
export function getAvailableBooks() {
  return Object.entries(hadithBooks).map(([id, book]) => ({
    id,
    name: book.name,
    urduName: book.urduName,
    totalHadith: book.totalHadith,
  }));
}

/**
 * الحصول على كتاب حديث كامل
 */
export function getBook(bookId: string): HadithBook | null {
  return hadithBooks[bookId] || null;
}

/**
 * الحصول على حديث معين برقمه
 */
export function getHadith(bookId: string, hadithNumber: number): Hadith | null {
  const book = hadithBooks[bookId];
  if (!book) return null;
  
  return book.hadiths.find(h => h.number === hadithNumber) || null;
}

/**
 * الحصول على أحاديث صفحة (للتصفح)
 */
export function getHadithPage(bookId: string, page: number, perPage: number = 20): Hadith[] {
  const book = hadithBooks[bookId];
  if (!book) return [];
  
  const start = (page - 1) * perPage;
  const end = start + perPage;
  
  return book.hadiths.slice(start, end);
}

/**
 * البحث في الأحاديث
 */
export function searchHadith(query: string, bookId?: string): { book: string; hadith: Hadith }[] {
  const results: { book: string; hadith: Hadith }[] = [];
  const normalizedQuery = query.trim();
  
  if (!normalizedQuery) return results;
  
  const booksToSearch = bookId ? { [bookId]: hadithBooks[bookId] } : hadithBooks;
  
  for (const [id, book] of Object.entries(booksToSearch)) {
    if (!book) continue;
    
    for (const hadith of book.hadiths) {
      if (hadith.arabic.includes(normalizedQuery)) {
        results.push({ book: id, hadith });
        if (results.length >= 50) return results; // حد أقصى
      }
    }
  }
  
  return results;
}

/**
 * الحصول على إحصائيات الأحاديث
 */
export function getHadithStats() {
  let totalHadith = 0;
  const books = [];
  
  for (const [id, book] of Object.entries(hadithBooks)) {
    totalHadith += book.totalHadith;
    books.push({
      id,
      name: book.name,
      count: book.totalHadith,
    });
  }
  
  return { totalHadith, books };
}

/**
 * الحصول على عدد الصفحات لكتاب
 */
export function getTotalPages(bookId: string, perPage: number = 20): number {
  const book = hadithBooks[bookId];
  if (!book) return 0;
  
  return Math.ceil(book.totalHadith / perPage);
}

export default {
  getAvailableBooks,
  getBook,
  getHadith,
  getHadithPage,
  searchHadith,
  getHadithStats,
  getTotalPages,
};
