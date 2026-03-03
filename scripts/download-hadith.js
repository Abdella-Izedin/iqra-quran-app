// سكربت لتنزيل الأحاديث النبوية
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data', 'hadith');

// كتب الأحاديث المتوفرة في API
const hadithBooks = [
  { slug: 'bukhari', name: 'صحيح البخاري', urduName: 'صحیح بخاری', chapters: 97 },
  { slug: 'muslim', name: 'صحيح مسلم', urduName: 'صحیح مسلم', chapters: 56 },
  { slug: 'abudawud', name: 'سنن أبي داود', urduName: 'سنن ابو داؤد', chapters: 43 },
  { slug: 'tirmidhi', name: 'جامع الترمذي', urduName: 'جامع ترمذی', chapters: 50 },
  { slug: 'nasai', name: 'سنن النسائي', urduName: 'سنن نسائی', chapters: 51 },
  { slug: 'ibnmajah', name: 'سنن ابن ماجه', urduName: 'سنن ابن ماجہ', chapters: 37 },
  { slug: 'malik', name: 'موطأ مالك', urduName: 'موطا مالک', chapters: 61 },
  { slug: 'riyadussalihin', name: 'رياض الصالحين', urduName: 'ریاض الصالحین', chapters: 19 },
  { slug: 'adab', name: 'الأدب المفرد', urduName: 'الادب المفرد', chapters: 55 },
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchBookData(bookSlug) {
  const response = await fetch(`https://hadeethenc.com/api/v1/hadeeths/list/?language=ar&book=${bookSlug}&per_page=1000&page=1`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${bookSlug}`);
  }
  return await response.json();
}

async function downloadHadithBook(book) {
  console.log(`\n📖 بدء تنزيل: ${book.name}\n`);
  
  try {
    const data = await fetchBookData(book.slug);
    
    const bookData = {
      slug: book.slug,
      name: book.name,
      urduName: book.urduName,
      totalHadith: data.meta?.total || 0,
      chapters: book.chapters,
      hadiths: data.data || [],
      lastUpdated: new Date().toISOString()
    };
    
    // حفظ الملف
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    const filename = path.join(OUTPUT_DIR, `${book.slug}.json`);
    fs.writeFileSync(filename, JSON.stringify(bookData, null, 0));
    
    const fileSizeMB = (fs.statSync(filename).size / (1024 * 1024)).toFixed(2);
    console.log(`   ✓ تم تنزيل ${bookData.totalHadith} حديث`);
    console.log(`   ✓ حجم الملف: ${fileSizeMB} MB`);
    
    return { size: parseFloat(fileSizeMB), count: bookData.totalHadith };
    
  } catch (error) {
    console.error(`   ❌ خطأ:`, error.message);
    return { size: 0, count: 0 };
  }
}

async function downloadAllHadith() {
  console.log('🚀 بدء تنزيل الأحاديث النبوية...\n');
  
  let totalSize = 0;
  let totalHadith = 0;
  
  for (const book of hadithBooks) {
    const result = await downloadHadithBook(book);
    totalSize += result.size;
    totalHadith += result.count;
    await delay(2000); // راحة بين الكتب
  }
  
  console.log(`\n\n✅ اكتمل تنزيل ${hadithBooks.length} كتاب`);
  console.log(`📚 إجمالي الأحاديث: ${totalHadith} حديث`);
  console.log(`📊 الحجم الإجمالي: ${totalSize.toFixed(2)} MB`);
}

downloadAllHadith().catch(console.error);
