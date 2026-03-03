// سكربت لتنزيل التفاسير العربية من quran.com API v4
// تفسير الميسر و تفسير ابن كثير العربي
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data', 'tafsir');

// تفاسير عربية من API
// الميسر العربي = 16
// ابن كثير العربي = يحتاج التحقق
const ARABIC_TAFSIRS = [
  { id: 16, name: 'muyassar', displayName: 'التفسير الميسر', language: 'ar' },
  // سنستخدم مصدر بديل لابن كثير
];

// عدد الآيات لكل سورة
const SURAH_AYAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53,
  89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12,
  12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26,
  30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// جلب تفسير آية واحدة
async function fetchAyahTafsir(tafsirId, surah, ayah) {
  const verseKey = `${surah}:${ayah}`;
  try {
    const response = await fetch(
      `https://api.quran.com/api/v4/quran/tafsirs/${tafsirId}?verse_key=${verseKey}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (data.tafsirs && data.tafsirs.length > 0) {
      // إزالة HTML tags من النص
      let text = data.tafsirs[0].text || '';
      text = text.replace(/<[^>]*>/g, '').trim();
      return text;
    }
  } catch (err) {
    console.error(`Error fetching ${verseKey}:`, err.message);
  }
  return null;
}

// جلب تفسير سورة كاملة (طريقة بديلة)
async function fetchSurahTafsirBulk(tafsirId, surahNumber) {
  try {
    const response = await fetch(
      `https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_chapter/${surahNumber}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.tafsirs || null;
  } catch (err) {
    return null;
  }
}

async function downloadMuyassar() {
  console.log('\n📖 تنزيل التفسير الميسر العربي...');
  
  const tafsirData = {
    id: 16,
    name: 'muyassar',
    displayName: 'التفسير الميسر',
    surahs: {},
    totalSurahs: 114,
    lastUpdated: new Date().toISOString()
  };
  
  let totalAyahs = 0;
  let downloadedAyahs = 0;
  
  for (let surah = 1; surah <= 114; surah++) {
    const ayahCount = SURAH_AYAH_COUNTS[surah - 1];
    tafsirData.surahs[surah] = [];
    
    // محاولة جلب السورة كاملة أولاً
    const bulkData = await fetchSurahTafsirBulk(16, surah);
    
    if (bulkData && bulkData.length > 0) {
      // البيانات الكاملة متوفرة
      tafsirData.surahs[surah] = bulkData.map(t => ({
        ayah: t.verse_number || parseInt(t.verse_key?.split(':')[1]) || 0,
        text: (t.text || '').replace(/<[^>]*>/g, '').trim()
      }));
      downloadedAyahs += bulkData.filter(t => t.text && t.text.trim()).length;
    } else {
      // جلب آية آية
      for (let ayah = 1; ayah <= ayahCount; ayah++) {
        const text = await fetchAyahTafsir(16, surah, ayah);
        tafsirData.surahs[surah].push({
          ayah,
          text: text || ''
        });
        if (text) downloadedAyahs++;
        await delay(100);
      }
    }
    
    totalAyahs += ayahCount;
    const progress = Math.round((surah / 114) * 100);
    process.stdout.write(`\r   السورة ${surah}/114 (${progress}%) - ${downloadedAyahs} آية`);
    
    await delay(300);
  }
  
  // حفظ الملف
  const filename = path.join(OUTPUT_DIR, 'muyassar.json');
  fs.writeFileSync(filename, JSON.stringify(tafsirData));
  
  const fileSizeMB = (fs.statSync(filename).size / (1024 * 1024)).toFixed(2);
  console.log(`\n   ✓ حفظ ${filename}`);
  console.log(`   ✓ الحجم: ${fileSizeMB} MB`);
  console.log(`   ✓ الآيات المنزلة: ${downloadedAyahs}/${totalAyahs}`);
}

// تنزيل من مصادر بديلة (Tanzil.net أو IslamWare)
async function downloadFromAlternativeSource() {
  console.log('\n📖 محاولة تنزيل التفسير الميسر من مصدر بديل...');
  
  // Tanzil.net Tafsir API
  const sources = [
    'https://cdn.jsdelivr.net/gh/AyahTech/quran-data@main/tafsir/ar.muyassar.json',
    'https://raw.githubusercontent.com/AyahTech/quran-data/main/tafsir/ar.muyassar.json',
  ];
  
  for (const url of sources) {
    try {
      console.log(`   محاولة: ${url}`);
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('   ✓ تم جلب البيانات!');
        return data;
      }
    } catch (err) {
      console.log(`   ✗ فشل: ${err.message}`);
    }
  }
  return null;
}

// تنزيل من quranenc.com API
async function downloadFromQuranEnc(tafsirCode, tafsirName, displayName) {
  console.log(`\n📖 تنزيل ${displayName} من QuranEnc...`);
  
  const tafsirData = {
    id: tafsirCode === 'muyassar' ? 16 : 169,
    name: tafsirCode,
    displayName: displayName,
    surahs: {},
    totalSurahs: 114,
    lastUpdated: new Date().toISOString()
  };
  
  // quranenc.com API لا يتطلب API key للتفاسير العربية
  const baseUrl = 'https://quranenc.com/api/v1/translation/sura';
  
  let totalSuccess = 0;
  
  for (let surah = 1; surah <= 114; surah++) {
    try {
      const response = await fetch(`${baseUrl}/${tafsirCode}/${surah}`);
      if (response.ok) {
        const data = await response.json();
        if (data.result && data.result.length > 0) {
          tafsirData.surahs[surah] = data.result.map(v => ({
            ayah: v.aya,
            text: (v.translation || '').trim()
          }));
          totalSuccess += data.result.length;
        } else {
          tafsirData.surahs[surah] = [];
        }
      } else {
        tafsirData.surahs[surah] = [];
      }
    } catch (err) {
      tafsirData.surahs[surah] = [];
    }
    
    const progress = Math.round((surah / 114) * 100);
    process.stdout.write(`\r   السورة ${surah}/114 (${progress}%)`);
    await delay(200);
  }
  
  if (totalSuccess > 0) {
    const filename = path.join(OUTPUT_DIR, `${tafsirCode}.json`);
    fs.writeFileSync(filename, JSON.stringify(tafsirData));
    const fileSizeMB = (fs.statSync(filename).size / (1024 * 1024)).toFixed(2);
    console.log(`\n   ✓ حفظ: ${fileSizeMB} MB - ${totalSuccess} آية`);
    return true;
  }
  
  return false;
}

// الدالة الرئيسية
async function main() {
  console.log('🚀 تنزيل التفاسير العربية\n');
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // محاولة 1: quranenc.com
  const success1 = await downloadFromQuranEnc('arabic_muyassar', 'muyassar', 'التفسير الميسر');
  
  if (!success1) {
    // محاولة 2: Quran.com API مباشرة
    await downloadMuyassar();
  }
  
  console.log('\n\n✅ انتهى!');
}

main().catch(console.error);
