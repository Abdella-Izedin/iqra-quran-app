const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '..', 'public', 'images', 'mushaf');
const TOTAL_PAGES = 604;

async function convertToWebP() {
  let totalOriginal = 0;
  let totalWebP = 0;
  let converted = 0;
  let skipped = 0;

  console.log('Converting mushaf images to WebP...\n');

  for (let i = 1; i <= TOTAL_PAGES; i++) {
    const paddedNumber = String(i).padStart(3, '0');
    const jpgPath = path.join(inputDir, `${paddedNumber}.jpg`);
    const webpPath = path.join(inputDir, `${paddedNumber}.webp`);

    if (!fs.existsSync(jpgPath)) {
      console.log(`⚠ Skipping page ${i}: ${paddedNumber}.jpg not found`);
      skipped++;
      continue;
    }

    // Skip if WebP already exists and is newer
    if (fs.existsSync(webpPath)) {
      const jpgStat = fs.statSync(jpgPath);
      const webpStat = fs.statSync(webpPath);
      if (webpStat.mtimeMs > jpgStat.mtimeMs) {
        totalOriginal += jpgStat.size;
        totalWebP += webpStat.size;
        skipped++;
        continue;
      }
    }

    try {
      const jpgSize = fs.statSync(jpgPath).size;
      totalOriginal += jpgSize;

      await sharp(jpgPath)
        .webp({ quality: 75, effort: 6 })
        .toFile(webpPath);

      const webpSize = fs.statSync(webpPath).size;
      totalWebP += webpSize;
      converted++;

      if (i % 50 === 0 || i === TOTAL_PAGES) {
        const savings = ((1 - webpSize / jpgSize) * 100).toFixed(1);
        console.log(`✓ Page ${i}/${TOTAL_PAGES} - JPG: ${(jpgSize / 1024).toFixed(0)}KB → WebP: ${(webpSize / 1024).toFixed(0)}KB (${savings}% smaller)`);
      }
    } catch (err) {
      console.error(`✗ Error converting page ${i}:`, err.message);
    }
  }

  console.log(`\n========================================`);
  console.log(`Conversion complete!`);
  console.log(`Converted: ${converted} | Skipped: ${skipped}`);
  console.log(`Original total: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`WebP total: ${(totalWebP / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Savings: ${((totalOriginal - totalWebP) / 1024 / 1024).toFixed(2)} MB (${((1 - totalWebP / totalOriginal) * 100).toFixed(1)}%)`);
  console.log(`========================================\n`);

  // Ask about deleting original JPGs
  console.log('To delete original JPGs and save more space, run:');
  console.log('  node scripts/convert-mushaf-webp.js --delete-originals\n');

  if (process.argv.includes('--delete-originals')) {
    console.log('Deleting original JPG files...');
    let deleted = 0;
    for (let i = 1; i <= TOTAL_PAGES; i++) {
      const paddedNumber = String(i).padStart(3, '0');
      const jpgPath = path.join(inputDir, `${paddedNumber}.jpg`);
      const webpPath = path.join(inputDir, `${paddedNumber}.webp`);
      if (fs.existsSync(jpgPath) && fs.existsSync(webpPath)) {
        fs.unlinkSync(jpgPath);
        deleted++;
      }
    }
    console.log(`Deleted ${deleted} JPG files.`);
  }
}

convertToWebP().catch(console.error);
