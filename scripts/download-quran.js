// سكربت لتنزيل بيانات القرآن الكامل
const fs = require('fs');
const path = require('path');

const TOTAL_PAGES = 604;
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data', 'quran');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'quran-text.json');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPage(pageNumber) {
  const response = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/quran-uthmani`);
  if (!response.ok) {
    throw new Error(`Failed to fetch page ${pageNumber}`);
  }
  const data = await response.json();
  return data.data.ayahs;
}

async function downloadAllPages() {
  console.log('بدء تنزيل بيانات القرآن الكريم...\n');
  
  const quranData = {
    pages: {},
    totalPages: TOTAL_PAGES,
    lastUpdated: new Date().toISOString()
  };
  
  for (let page = 1; page <= TOTAL_PAGES; page++) {
    try {
      const ayahs = await fetchPage(page);
      
      // تحويل البيانات لتكون أخف
      quranData.pages[page] = ayahs.map(ayah => ({
        number: ayah.numberInSurah,
        text: ayah.text,
        surah: ayah.surah.number,
        surahName: ayah.surah.name,
        juz: ayah.juz,
        hizb: ayah.hizbQuarter,
        page: ayah.page
      }));
      
      const progress = Math.round((page / TOTAL_PAGES) * 100);
      process.stdout.write(`\rتم تنزيل صفحة ${page}/${TOTAL_PAGES} (${progress}%)`);
      
      // انتظار قليل لتجنب حظر API
      await delay(100);
      
    } catch (error) {
      console.error(`\nخطأ في تنزيل صفحة ${page}:`, error.message);
      // إعادة المحاولة
      await delay(1000);
      page--; // إعادة المحاولة لنفس الصفحة
    }
  }
  
  console.log('\n\nجاري حفظ البيانات...');
  
  // حفظ الملف
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(quranData, null, 0));
  
  const fileSizeMB = (fs.statSync(OUTPUT_FILE).size / (1024 * 1024)).toFixed(2);
  console.log(`\n✓ تم حفظ البيانات في: ${OUTPUT_FILE}`);
  console.log(`✓ حجم الملف: ${fileSizeMB} MB`);
}

downloadAllPages().catch(console.error);
