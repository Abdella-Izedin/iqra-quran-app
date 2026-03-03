// سكربت لتنزيل الأحاديث من sunnah.com API
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data', 'hadith');

// كتب الأحاديث المتوفرة
const hadithBooks = [
  { collection: 'bukhari', name: 'صحيح البخاري', urduName: 'صحیح بخاری' },
  { collection: 'muslim', name: 'صحيح مسلم', urduName: 'صحیح مسلم' },
  { collection: 'abudawud', name: 'سنن أبي داود', urduName: 'سنن ابو داؤد' },
  { collection: 'tirmidhi', name: 'جامع الترمذي', urduName: 'جامع ترمذی' },
  { collection: 'nasai', name: 'سنن النسائي', urduName: 'سنن نسائی' },
  { collection: 'ibnmajah', name: 'سنن ابن ماجه', urduName: 'سنن ابن ماجہ' },
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchBookInfo(collection) {
  const response = await fetch(`https://api.sunnah.com/v1/collections/${collection}/books`, {
    headers: {
      'X-API-Key': '$2y$10$lDW2ecpTCXXqXCCdCqKs9AftNmRBdBLTZvtF5VpXNRtCWqHGAZVb'
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${collection}`);
  }
  return await response.json();
}

async function fetchBookHadith(collection, bookNumber) {
  const response = await fetch(`https://api.sunnah.com/v1/collections/${collection}/books/${bookNumber}/hadiths`, {
    headers: {
      'X-API-Key': '$2y$10$lDW2ecpTCXXqXCCdCqKs9e.AftNmRBdBLTZvtF5VpXNRtCWqHGAZVb'
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch book ${bookNumber}`);
  }
  return await response.json();
}

async function downloadHadithBook(book) {
  console.log(`\n📖 بدء تنزيل: ${book.name}\n`);
  
  try {
    // الحصول على قائمة الكتب
    const booksInfo = await fetchBookInfo(book.collection);
    
    const bookData = {
      collection: book.collection,
      name: book.name,
      urduName: book.urduName,
      books: [],
      totalHadith: 0,
      lastUpdated: new Date().toISOString()
    };
    
    let processedHadith = 0;
    
    for (const bookInfo of booksInfo.data) {
      try {
        const hadithData = await fetchBookHadith(book.collection, bookInfo.bookNumber);
        
        const bookHadiths = {
          bookNumber: bookInfo.bookNumber,
          bookName: bookInfo.book_name || bookInfo.arab_name,
          hadiths: hadithData.data.map(h => ({
            hadithNumber: h.hadithNumber,
            arabicText: h.hadith_arabic,
            urduText: h.hadith_urdu || '',
            englishText: h.hadith_english || '',
            chapter: h.chapter_name || ''
          }))
        };
        
        bookData.books.push(bookHadiths);
        processedHadith += bookHadiths.hadiths.length;
        
        console.log(`   ✓ كتاب ${bookInfo.bookNumber} - ${bookHadiths.hadiths.length} حديث`);
        
        await delay(200);
        
      } catch (error) {
        console.error(`   ❌ خطأ في كتاب ${bookInfo.bookNumber}:`, error.message);
      }
    }
    
    bookData.totalHadith = processedHadith;
    
    // حفظ الملف
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    const filename = path.join(OUTPUT_DIR, `${book.collection}.json`);
    fs.writeFileSync(filename, JSON.stringify(bookData, null, 0));
    
    const fileSizeMB = (fs.statSync(filename).size / (1024 * 1024)).toFixed(2);
    console.log(`   ✓ إجمالي: ${processedHadith} حديث`);
    console.log(`   ✓ حجم الملف: ${fileSizeMB} MB\n`);
    
    return { size: parseFloat(fileSizeMB), count: processedHadith };
    
  } catch (error) {
    console.error(`   ❌ خطأ:`, error.message);
    return { size: 0, count: 0 };
  }
}

async function downloadAllHadith() {
  console.log('🚀 بدء تنزيل الأحاديث النبوية من sunnah.com...\n');
  
  let totalSize = 0;
  let totalHadith = 0;
  
  // نبدأ فقط بالبخاري ومسلم (الأهم)
  const priorityBooks = hadithBooks.slice(0, 2);
  
  for (const book of priorityBooks) {
    const result = await downloadHadithBook(book);
    totalSize += result.size;
    totalHadith += result.count;
    await delay(3000);
  }
  
  console.log(`\n\n✅ اكتمل تنزيل ${priorityBooks.length} كتاب`);
  console.log(`📚 إجمالي الأحاديث: ${totalHadith} حديث`);
  console.log(`📊 الحجم الإجمالي: ${totalSize.toFixed(2)} MB`);
}

downloadAllHadith().catch(console.error);
