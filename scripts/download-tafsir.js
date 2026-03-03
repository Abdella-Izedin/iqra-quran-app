// سكربت لتنزيل التفاسير
const fs = require('fs');
const path = require('path');

const TOTAL_SURAHS = 114;
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data', 'tafsir');

// التفاسير المتوفرة - نبدأ بالتفسير الميسر فقط
const tafsirs = [
  { id: 16, name: 'muyassar', displayName: 'التفسير الميسر' },
  // { id: 169, name: 'ibnkathir', displayName: 'تفسير ابن كثير' }, // ضخم جداً - مؤجل
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchTafsirForAyah(tafsirId, surahNumber, ayahNumber) {
  const response = await fetch(
    `https://api.quran.com/api/v4/quran/tafsirs/${tafsirId}?chapter_number=${surahNumber}&verse_number=${ayahNumber}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch tafsir for ${surahNumber}:${ayahNumber}`);
  }
  const data = await response.json();
  return data.tafsirs && data.tafsirs[0] ? data.tafsirs[0].text : '';
}

// الحصول على عدد آيات كل سورة
const surahAyahCounts = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53,
  89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12,
  12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26,
  30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
];

async function downloadTafsir(tafsir) {
  console.log(`\n📖 بدء تنزيل: ${tafsir.displayName}\n`);
  
  const tafsirData = {
    id: tafsir.id,
    name: tafsir.name,
    displayName: tafsir.displayName,
    surahs: {},
    totalSurahs: TOTAL_SURAHS,
    lastUpdated: new Date().toISOString()
  };
  
  let totalAyahs = 0;
  let processedAyahs = 0;
  const totalAyahsInQuran = surahAyahCounts.reduce((a, b) => a + b, 0);
  
  for (let surah = 1; surah <= TOTAL_SURAHS; surah++) {
    const ayahCount = surahAyahCounts[surah - 1];
    tafsirData.surahs[surah] = [];
    
    for (let ayah = 1; ayah <= ayahCount; ayah++) {
      try {
        const text = await fetchTafsirForAyah(tafsir.id, surah, ayah);
        tafsirData.surahs[surah].push({
          ayah: ayah,
          text: text.replace(/<[^>]*>/g, '') // تنظيف HTML
        });
        
        processedAyahs++;
        const progress = Math.round((processedAyahs / totalAyahsInQuran) * 100);
        process.stdout.write(`\r   السورة ${surah}/${TOTAL_SURAHS} - الآية ${ayah}/${ayahCount} (${progress}%)`);
        
        await delay(50); // تسريع - تقليل التأخير
        
      } catch (error) {
        console.error(`\n   ❌ خطأ في ${surah}:${ayah}:`, error.message);
        await delay(500);
        ayah--; // إعادة المحاولة
      }
    }
  }
  
  console.log('\n   ✓ اكتمل التنزيل');
  
  // حفظ الملف
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const filename = path.join(OUTPUT_DIR, `${tafsir.name}.json`);
  fs.writeFileSync(filename, JSON.stringify(tafsirData, null, 0));
  
  const fileSizeMB = (fs.statSync(filename).size / (1024 * 1024)).toFixed(2);
  console.log(`   ✓ حجم الملف: ${fileSizeMB} MB`);
  
  return fileSizeMB;
}

async function downloadAllTafsirs() {
  console.log('🚀 بدء تنزيل التفاسير...\n');
  console.log('⚠️  هذه العملية قد تستغرق 30-60 دقيقة بسبب كثرة الآيات (6236 آية)\n');
  
  let totalSize = 0;
  
  for (const tafsir of tafsirs) {
    const size = await downloadTafsir(tafsir);
    totalSize += parseFloat(size);
    await delay(3000); // راحة بين التفاسير
  }
  
  console.log(`\n\n✅ اكتمل تنزيل ${tafsirs.length} تفسير`);
  console.log(`📊 الحجم الإجمالي: ${totalSize.toFixed(2)} MB`);
}

downloadAllTafsirs().catch(console.error);
