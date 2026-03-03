// سكربت لتنزيل الأحاديث من مصادر متعددة
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data', 'hadith');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// تنزيل من sunnah.com API (غير رسمي)
async function fetchFromSunnah(collection, limit = 500) {
  try {
    const response = await fetch(
      `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${collection}.json`
    );
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.log(`   ⚠️ فشل من jsdelivr، جاري تجربة مصدر آخر...`);
    return null;
  }
}

// تنزيل من GitHub مباشرة
async function fetchFromGitHub(collection) {
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/ara-${collection}.json`
    );
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    return await response.json();
  } catch (err) {
    return null;
  }
}

const hadithCollections = [
  { id: 'bukhari', name: 'صحيح البخاري', urduName: 'صحیح بخاری' },
  { id: 'muslim', name: 'صحيح مسلم', urduName: 'صحیح مسلم' },
  { id: 'abudawud', name: 'سنن أبي داود', urduName: 'سنن ابو داؤد' },
  { id: 'tirmidhi', name: 'جامع الترمذي', urduName: 'جامع ترمذی' },
  { id: 'nasai', name: 'سنن النسائي', urduName: 'سنن نسائی' },
  { id: 'ibnmajah', name: 'سنن ابن ماجه', urduName: 'سنن ابن ماجہ' },
  { id: 'malik', name: 'موطأ مالك', urduName: 'موطا مالک' },
  { id: 'riyadussalihin', name: 'رياض الصالحين', urduName: 'ریاض الصالحین' },
];

async function downloadCollection(collection) {
  console.log(`\n📖 تنزيل: ${collection.name}`);
  
  let data = await fetchFromSunnah(collection.id);
  if (!data) {
    data = await fetchFromGitHub(collection.id);
  }
  
  if (!data) {
    console.log(`   ❌ فشل التنزيل`);
    return 0;
  }
  
  const hadiths = data.hadiths || [];
  
  const bookData = {
    id: collection.id,
    name: collection.name,
    urduName: collection.urduName,
    totalHadith: hadiths.length,
    hadiths: hadiths.map((h, i) => ({
      number: h.hadithnumber || i + 1,
      arabic: h.text || h.arabic || '',
      chapter: h.reference?.book || '',
    })),
    lastUpdated: new Date().toISOString()
  };
  
  // حفظ الملف
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const filename = path.join(OUTPUT_DIR, `${collection.id}.json`);
  fs.writeFileSync(filename, JSON.stringify(bookData, null, 0));
  
  const fileSizeMB = (fs.statSync(filename).size / (1024 * 1024)).toFixed(2);
  console.log(`   ✓ ${hadiths.length} حديث - ${fileSizeMB} MB`);
  
  return parseFloat(fileSizeMB);
}

async function main() {
  console.log('🚀 تنزيل جميع كتب الأحاديث...\n');
  
  let totalSize = 0;
  let totalHadith = 0;
  
  for (const collection of hadithCollections) {
    const size = await downloadCollection(collection);
    totalSize += size;
    await delay(2000);
  }
  
  // قراءة إجمالي الأحاديث
  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, file)));
      totalHadith += data.totalHadith || 0;
    } catch (e) {}
  }
  
  console.log(`\n\n✅ اكتمل التنزيل!`);
  console.log(`📚 إجمالي الأحاديث: ${totalHadith}`);
  console.log(`📊 الحجم الإجمالي: ${totalSize.toFixed(2)} MB`);
}

main().catch(console.error);
