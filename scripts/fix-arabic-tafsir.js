// سكربت لتنزيل التفاسير العربية الصحيحة
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data', 'tafsir');

// التفاسير العربية الصحيحة
const ARABIC_TAFSIRS = [
  { id: 16, name: 'muyassar', displayName: 'التفسير الميسر' },
  { id: 14, name: 'ibnkathir', displayName: 'تفسير ابن كثير' },
  // { id: 15, name: 'tabari', displayName: 'تفسير الطبري' },
  // { id: 90, name: 'qurtubi', displayName: 'تفسير القرطبي' },
  // { id: 91, name: 'saadi', displayName: 'تفسير السعدي' },
  // { id: 93, name: 'waseet', displayName: 'التفسير الوسيط' },
  // { id: 94, name: 'baghawi', displayName: 'تفسير البغوي' },
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadTafsir(tafsir) {
  console.log(`\n📖 تنزيل: ${tafsir.displayName} (ID: ${tafsir.id})`);
  
  const tafsirData = {
    id: tafsir.id,
    name: tafsir.name,
    displayName: tafsir.displayName,
    surahs: {},
    totalSurahs: 114,
    lastUpdated: new Date().toISOString()
  };
  
  let totalAyahs = 0;
  let successAyahs = 0;
  
  for (let surah = 1; surah <= 114; surah++) {
    try {
      const response = await fetch(
        `https://api.quran.com/api/v4/tafsirs/${tafsir.id}/by_chapter/${surah}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const verses = data.tafsirs || [];
        
        tafsirData.surahs[surah] = verses.map(v => {
          // إزالة HTML tags
          let text = (v.text || '').replace(/<[^>]*>/g, '').trim();
          return {
            ayah: parseInt(v.verse_key?.split(':')[1]) || v.verse_number || 0,
            text: text
          };
        });
        
        successAyahs += verses.filter(v => v.text && v.text.trim()).length;
        totalAyahs += verses.length;
      } else {
        console.log(`\n   ⚠️ فشل السورة ${surah}: ${response.status}`);
        tafsirData.surahs[surah] = [];
      }
    } catch (error) {
      console.log(`\n   ❌ خطأ في السورة ${surah}: ${error.message}`);
      tafsirData.surahs[surah] = [];
    }
    
    const progress = Math.round((surah / 114) * 100);
    process.stdout.write(`\r   السورة ${surah}/114 (${progress}%)`);
    
    await delay(250); // تأخير لتجنب حظر API
  }
  
  // حفظ الملف
  const filename = path.join(OUTPUT_DIR, `${tafsir.name}.json`);
  fs.writeFileSync(filename, JSON.stringify(tafsirData));
  
  const fileSizeMB = (fs.statSync(filename).size / (1024 * 1024)).toFixed(2);
  console.log(`\n   ✓ تم الحفظ: ${fileSizeMB} MB`);
  console.log(`   ✓ الآيات: ${successAyahs}/${totalAyahs}`);
  
  return parseFloat(fileSizeMB);
}

async function main() {
  console.log('🚀 تنزيل التفاسير العربية الصحيحة\n');
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  let totalSize = 0;
  
  for (const tafsir of ARABIC_TAFSIRS) {
    try {
      const size = await downloadTafsir(tafsir);
      totalSize += size;
    } catch (err) {
      console.error(`\n❌ فشل: ${err.message}`);
    }
    
    await delay(2000); // راحة بين التفاسير
  }
  
  console.log(`\n\n✅ اكتمل التنزيل!`);
  console.log(`📊 الحجم الإجمالي: ${totalSize.toFixed(2)} MB`);
}

main().catch(console.error);
