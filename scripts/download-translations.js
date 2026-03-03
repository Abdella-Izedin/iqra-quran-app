// سكربت لتنزيل الترجمات الأردية الكاملة
const fs = require('fs');
const path = require('path');

const TOTAL_SURAHS = 114;
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data', 'translations');

// الترجمات الأردية المتوفرة
const urduTranslations = [
  { id: 97, name: 'maududi', displayName: 'تفہیم القرآن - مولانا مودودی' },
  { id: 54, name: 'jalandhry', displayName: 'مولانا جونا گڑھی' },
  { id: 234, name: 'jalandhri', displayName: 'فتح محمد جالندھری' },
  { id: 819, name: 'wahiduddin', displayName: 'مولانا وحید الدین خان' },
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchTranslation(translationId, surahNumber) {
  const response = await fetch(
    `https://api.quran.com/api/v4/quran/translations/${translationId}?chapter_number=${surahNumber}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch surah ${surahNumber} for translation ${translationId}`);
  }
  const data = await response.json();
  return data.translations;
}

async function downloadTranslation(translation) {
  console.log(`\n📖 بدء تنزيل: ${translation.displayName}\n`);
  
  const translationData = {
    id: translation.id,
    name: translation.name,
    displayName: translation.displayName,
    surahs: {},
    totalSurahs: TOTAL_SURAHS,
    lastUpdated: new Date().toISOString()
  };
  
  for (let surah = 1; surah <= TOTAL_SURAHS; surah++) {
    try {
      const verses = await fetchTranslation(translation.id, surah);
      
      // تنظيف HTML tags من الترجمة
      translationData.surahs[surah] = verses.map((verse, index) => ({
        ayah: index + 1,
        text: verse.text.replace(/<[^>]*>/g, '')
      }));
      
      const progress = Math.round((surah / TOTAL_SURAHS) * 100);
      process.stdout.write(`\r   السورة ${surah}/${TOTAL_SURAHS} (${progress}%)`);
      
      await delay(150); // تجنب حظر API
      
    } catch (error) {
      console.error(`\n   ❌ خطأ في السورة ${surah}:`, error.message);
      await delay(1000);
      surah--; // إعادة المحاولة
    }
  }
  
  console.log('\n   ✓ اكتمل التنزيل');
  
  // حفظ الملف
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const filename = path.join(OUTPUT_DIR, `urdu-${translation.name}.json`);
  fs.writeFileSync(filename, JSON.stringify(translationData, null, 0));
  
  const fileSizeMB = (fs.statSync(filename).size / (1024 * 1024)).toFixed(2);
  console.log(`   ✓ حجم الملف: ${fileSizeMB} MB`);
  
  return fileSizeMB;
}

async function downloadAllTranslations() {
  console.log('🚀 بدء تنزيل الترجمات الأردية...\n');
  
  let totalSize = 0;
  
  for (const translation of urduTranslations) {
    const size = await downloadTranslation(translation);
    totalSize += parseFloat(size);
    await delay(2000); // راحة بين الترجمات
  }
  
  console.log(`\n\n✅ اكتمل تنزيل ${urduTranslations.length} ترجمة`);
  console.log(`📊 الحجم الإجمالي: ${totalSize.toFixed(2)} MB`);
}

downloadAllTranslations().catch(console.error);
