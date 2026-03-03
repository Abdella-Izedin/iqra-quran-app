// سكريبت تحميل صور المصحف من GitHub وحفظها محلياً
// المصدر: akram-seid/quran-hd-images - مصحف المدينة 15 سطر
// الدقة: 1260x2038 pixels
// الاستخدام: node scripts/download-mushaf-images.js

const fs = require('fs');
const path = require('path');
const https = require('https');

const TOTAL_PAGES = 604;
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'mushaf');
const BASE_URL = 'https://raw.githubusercontent.com/akram-seid/quran-hd-images/main/images';

// إنشاء المجلد إذا لم يكن موجوداً
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`📁 تم إنشاء المجلد: ${OUTPUT_DIR}`);
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    
    https.get(url, (response) => {
      // التعامل مع إعادة التوجيه
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(destPath);
        downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

async function downloadAllPages() {
  console.log('🕌 بدء تحميل صور المصحف الشريف...');
  console.log(`📖 عدد الصفحات: ${TOTAL_PAGES}`);
  console.log(`📂 مجلد الحفظ: ${OUTPUT_DIR}\n`);
  
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  const failedPages = [];
  
  // تحميل بمجموعات (10 في نفس الوقت)
  const BATCH_SIZE = 10;
  
  for (let i = 1; i <= TOTAL_PAGES; i += BATCH_SIZE) {
    const batch = [];
    
    for (let j = i; j < Math.min(i + BATCH_SIZE, TOTAL_PAGES + 1); j++) {
      const paddedNumber = String(j).padStart(3, '0');
      const fileName = `${paddedNumber}.jpg`;
      const filePath = path.join(OUTPUT_DIR, fileName);
      const url = `${BASE_URL}/${fileName}`;
      
      // تخطي الصفحات الموجودة مسبقاً
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size > 10000) { // تحقق أن الملف ليس فارغاً (أكبر من 10KB)
          skipped++;
          continue;
        }
      }
      
      batch.push(
        downloadFile(url, filePath)
          .then(() => {
            downloaded++;
            const total = downloaded + skipped;
            const percent = Math.round((total / TOTAL_PAGES) * 100);
            process.stdout.write(`\r✅ تم تحميل ${downloaded} صفحة | ⏭️ تخطي ${skipped} | ❌ فشل ${failed} | [${percent}%]`);
          })
          .catch((err) => {
            failed++;
            failedPages.push(j);
            process.stdout.write(`\r✅ تم تحميل ${downloaded} صفحة | ⏭️ تخطي ${skipped} | ❌ فشل ${failed} | خطأ: صفحة ${j}`);
          })
      );
    }
    
    if (batch.length > 0) {
      await Promise.all(batch);
    }
  }
  
  console.log('\n\n📊 النتائج:');
  console.log(`   ✅ تم تحميل: ${downloaded} صفحة`);
  console.log(`   ⏭️ موجودة مسبقاً: ${skipped} صفحة`);
  console.log(`   ❌ فشل: ${failed} صفحة`);
  
  if (failedPages.length > 0) {
    console.log(`\n⚠️ الصفحات الفاشلة: ${failedPages.join(', ')}`);
    console.log('💡 أعد تشغيل السكريبت لمحاولة تحميلها مرة أخرى');
  } else {
    console.log('\n🎉 تم تحميل جميع صفحات المصحف بنجاح!');
  }
  
  // حساب الحجم الكلي
  let totalSize = 0;
  for (let i = 1; i <= TOTAL_PAGES; i++) {
    const filePath = path.join(OUTPUT_DIR, `${String(i).padStart(3, '0')}.jpg`);
    if (fs.existsSync(filePath)) {
      totalSize += fs.statSync(filePath).size;
    }
  }
  console.log(`\n💾 الحجم الكلي: ${(totalSize / (1024 * 1024)).toFixed(1)} MB`);
}

downloadAllPages().catch(console.error);
