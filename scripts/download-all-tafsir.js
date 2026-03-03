// سكربت لتنزيل جميع التفاسير المتوفرة
const fs = require('fs');
const path = require('path');

const TOTAL_SURAHS = 114;
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data', 'tafsir');

// جميع التفاسير المتوفرة في Quran.com API
const tafsirs = [
  { id: 16, name: 'muyassar', displayName: 'التفسير الميسر' },
  { id: 169, name: 'ibnkathir', displayName: 'تفسير ابن كثير' },
  { id: 91, name: 'saadi', displayName: 'تفسير السعدي' },
  { id: 93, name: 'waseet', displayName: 'التفسير الوسيط' },
  { id: 90, name: 'qurtubi', displayName: 'تفسير القرطبي' },
  { id: 94, name: 'baghawi', displayName: 'تفسير البغوي' },
  { id: 15, name: 'tabari', displayName: 'تفسير الطبري' },
];

// عدد الآيات في كل سورة
const surahAyahCounts = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53,
  89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12,
  12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26,
  30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
];

const totalAyahsInQuran = surahAyahCounts.reduce((a, b) => a + b, 0);

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchTafsirForSurah(tafsirId, surahNumber) {
  // جلب التفسير لسورة كاملة دفعة واحدة
  const response = await fetch(
    `https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_chapter/${surahNumber}`
  );
  if (!response.ok) {
    throw new Error(`Failed: ${response.status}`);
  }
  const data = await response.json();
  return data.tafsirs || [];
}

async function downloadTafsir(tafsir) {
  console.log(`\n📖 تنزيل: ${tafsir.displayName}`);
  
  const tafsirData = {
    id: tafsir.id,
    name: tafsir.name,
    displayName: tafsir.displayName,
    surahs: {},
    lastUpdated: new Date().toISOString()
  };
  
  for (let surah = 1; surah <= TOTAL_SURAHS; surah++) {
    try {
      const verses = await fetchTafsirForSurah(tafsir.id, surah);
      
      tafsirData.surahs[surah] = verses.map(v => ({
        ayah: v.verse_number || parseInt(v.verse_key?.split(':')[1]) || 0,
        text: (v.text || '').replace(/<[^>]*>/g, '')
      }));
      
      const progress = Math.round((surah / TOTAL_SURAHS) * 100);
      process.stdout.write(`\r   السورة ${surah}/${TOTAL_SURAHS} (${progress}%)`);
      
      await delay(200);
      
    } catch (error) {
      console.error(`\n   ❌ خطأ في السورة ${surah}:`, error.message);
      // تخطي هذه السورة والمتابعة
      tafsirData.surahs[surah] = [];
    }
  }
  
  // حفظ الملف
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const filename = path.join(OUTPUT_DIR, `${tafsir.name}.json`);
  fs.writeFileSync(filename, JSON.stringify(tafsirData, null, 0));
  
  const fileSizeMB = (fs.statSync(filename).size / (1024 * 1024)).toFixed(2);
  console.log(`\n   ✓ حجم الملف: ${fileSizeMB} MB`);
  
  return parseFloat(fileSizeMB);
}

async function main() {
  console.log('🚀 تنزيل جميع التفاسير المتوفرة...\n');
  console.log(`📚 عدد التفاسير: ${tafsirs.length}`);
  console.log(`📖 إجمالي الآيات: ${totalAyahsInQuran}\n`);
  
  let totalSize = 0;
  
  for (const tafsir of tafsirs) {
    // تخطي التفسير الميسر لأنه موجود
    if (tafsir.name === 'muyassar') {
      console.log(`\n⏭️  تخطي: ${tafsir.displayName} (موجود بالفعل)`);
      continue;
    }
    
    try {
      const size = await downloadTafsir(tafsir);
      totalSize += size;
    } catch (err) {
      console.error(`\n❌ فشل تنزيل ${tafsir.displayName}:`, err.message);
    }
    
    await delay(3000); // راحة بين التفاسير
  }
  
  console.log(`\n\n✅ اكتمل تنزيل التفاسير!`);
  console.log(`📊 الحجم الإجمالي: ${totalSize.toFixed(2)} MB`);
}

main().catch(console.error);
