const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '..', 'public', 'images', 'mushaf');

async function convert() {
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.jpg')).sort();
  console.log('Total JPG files:', files.length);
  
  let totalOriginal = 0;
  let totalWebP = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const jpgPath = path.join(inputDir, file);
    const webpPath = path.join(inputDir, file.replace('.jpg', '.webp'));
    
    // Skip if already converted
    if (fs.existsSync(webpPath)) {
      const jpgSize = fs.statSync(jpgPath).size;
      const webpSize = fs.statSync(webpPath).size;
      totalOriginal += jpgSize;
      totalWebP += webpSize;
      continue;
    }

    try {
      const jpgSize = fs.statSync(jpgPath).size;
      totalOriginal += jpgSize;

      const info = await sharp(jpgPath).webp({ quality: 75 }).toFile(webpPath);
      totalWebP += info.size;

      if ((i + 1) % 100 === 0 || i === files.length - 1) {
        console.log(`Progress: ${i + 1}/${files.length}`);
      }
    } catch (err) {
      console.error('Error on', file, err.message);
    }
  }

  console.log('\nOriginal:', (totalOriginal / 1048576).toFixed(1), 'MB');
  console.log('WebP:', (totalWebP / 1048576).toFixed(1), 'MB');
  console.log('Saved:', ((totalOriginal - totalWebP) / 1048576).toFixed(1), 'MB');
}

convert().catch(console.error);
