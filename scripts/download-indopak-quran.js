// سكربت لتنزيل نص القرآن بخط IndoPak (للغة الأردية)
const fs = require('fs');
const path = require('path');

const TOTAL_SURAHS = 114;
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data', 'quran');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'quran-indopak.json');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// جلب آيات سورة بخط IndoPak من API
async function fetchSurahIndoPak(surahNumber) {
  const url = `https://api.qurancdn.com/api/qdc/verses/by_chapter/${surahNumber}?words=true&word_fields=text_indopak&per_page=300`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch surah ${surahNumber}: ${response.status}`);
  }
  
  const data = await response.json();
  return data.verses;
}

async function downloadAllSurahs() {
  console.log('بدء تنزيل القرآن الكريم بخط IndoPak...\n');
  
  const indopakData = {
    surahs: {},
    totalSurahs: TOTAL_SURAHS,
    lastUpdated: new Date().toISOString()
  };
  
  for (let surah = 1; surah <= TOTAL_SURAHS; surah++) {
    try {
      const verses = await fetchSurahIndoPak(surah);
      
      // استخراج نص IndoPak من الكلمات
      indopakData.surahs[surah] = verses.map(verse => {
        // تجميع كلمات الآية
        const indopakText = verse.words
          .filter(w => w.char_type_name === 'word')
          .map(w => w.text_indopak)
          .join(' ');
        
        return {
          verse_number: verse.verse_number,
          verse_key: verse.verse_key,
          text_indopak: indopakText,
          page: verse.page_number || 0
        };
      });
      
      const progress = Math.round((surah / TOTAL_SURAHS) * 100);
      process.stdout.write(`\rتم تنزيل سورة ${surah}/${TOTAL_SURAHS} (${progress}%)`);
      
      // انتظار لتجنب حظر API
      await delay(200);
      
    } catch (error) {
      console.error(`\nخطأ في تنزيل سورة ${surah}:`, error.message);
      // إعادة المحاولة
      await delay(2000);
      surah--; // إعادة المحاولة
    }
  }
  
  console.log('\n\nجاري تنظيم البيانات حسب الصفحات...');
  
  // إعادة ترتيب البيانات حسب الصفحات
  const pageData = {};
  
  for (let surahNum = 1; surahNum <= TOTAL_SURAHS; surahNum++) {
    const surahVerses = indopakData.surahs[surahNum];
    if (!surahVerses) continue;
    
    for (const verse of surahVerses) {
      const page = verse.page;
      if (!pageData[page]) {
        pageData[page] = [];
      }
      pageData[page].push({
        surah: surahNum,
        ayah: verse.verse_number,
        text: verse.text_indopak
      });
    }
  }
  
  // الملف النهائي
  const finalData = {
    pages: pageData,
    surahs: indopakData.surahs,
    totalPages: Object.keys(pageData).length,
    totalSurahs: TOTAL_SURAHS,
    lastUpdated: new Date().toISOString()
  };
  
  console.log('جاري حفظ البيانات...');
  
  // حفظ الملف
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalData, null, 0));
  
  const fileSizeMB = (fs.statSync(OUTPUT_FILE).size / (1024 * 1024)).toFixed(2);
  console.log(`\n✓ تم حفظ البيانات في: ${OUTPUT_FILE}`);
  console.log(`✓ حجم الملف: ${fileSizeMB} MB`);
  console.log(`✓ عدد الصفحات: ${Object.keys(pageData).length}`);
}

downloadAllSurahs().catch(console.error);
