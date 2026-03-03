// البحث عن مصادر بديلة لصور صفحات المصحف

const sources = [
  // MP3Quran - يعمل
  { name: 'MP3Quran SVG', url: 'https://www.mp3quran.net/api/quran_pages_svg/001.svg' },
  
  // Quran.ksu.edu.sa - جامعة الملك سعود
  { name: 'KSU Ayat v1', url: 'https://quran.ksu.edu.sa/ayat/images/page001.jpg' },
  { name: 'KSU Ayat v2', url: 'https://quran.ksu.edu.sa/images/pages/page001.png' },
  { name: 'KSU v3', url: 'https://quran.ksu.edu.sa/pages/001.png' },
  
  // Shamela
  { name: 'Shamela', url: 'https://shamela.ws/quran/images/page001.png' },
  
  // Archive.org - مستودعات حقيقية
  { name: 'Archive v1', url: 'https://ia800500.us.archive.org/31/items/Quran_Madina_Mushaf/page001.jpg' },
  { name: 'Archive v2', url: 'https://ia600500.us.archive.org/31/items/madina-mushaf/001.png' },
  { name: 'Archive Hafs', url: 'https://ia903408.us.archive.org/BookReader/BookReaderImages.php?zip=/7/items/hafs-quran-images/hafs-quran-images_jp2.zip&file=hafs-quran-images_jp2/001.jp2' },
  
  // SurahQuran - الذي جربناه سابقاً
  { name: 'SurahQuran PNG', url: 'https://surahquran.com/quranpages/1.png' },
  
  // مواقع إسلامية أخرى
  { name: 'Altafsir v1', url: 'https://www.altafsir.com/Images/Qpages/page001.gif' },
  { name: 'Altafsir v2', url: 'https://altafsir.com/Quran/page/1.jpg' },
  { name: 'IslamHouse', url: 'https://d1.islamhouse.com/data/quran/images/page001.png' },
  { name: 'Quran Complex', url: 'https://qurancomplex.gov.sa/kfgqpc/hafs/pages/page001.png' },
  { name: 'Quran Complex v2', url: 'https://tanzil.info/res/quran/hafs/page001.png' },
];

async function checkSources() {
  console.log('Checking mushaf image sources...\n');
  
  const results = await Promise.all(
    sources.map(async (s) => {
      try {
        const response = await fetch(s.url, { 
          method: 'HEAD',
          redirect: 'follow',
          signal: AbortSignal.timeout(10000)
        });
        const contentType = response.headers.get('content-type') || '';
        const isImage = contentType.startsWith('image/');
        return {
          name: s.name,
          url: s.url,
          status: response.status,
          isImage,
          type: contentType.substring(0, 25)
        };
      } catch (error) {
        return {
          name: s.name,
          url: s.url,
          error: error.message || 'Failed'
        };
      }
    })
  );
  
  console.log('=== Working Sources (Images) ===');
  const working = results.filter(r => r.isImage);
  if (working.length === 0) {
    console.log('No working image sources found.\n');
  } else {
    working.forEach(r => {
      console.log(`✅ ${r.name}`);
      console.log(`   URL: ${r.url}`);
      console.log(`   Type: ${r.type}\n`);
    });
  }
  
  console.log('=== Non-Image Sources ===');
  const nonImage = results.filter(r => r.status && !r.isImage);
  nonImage.forEach(r => {
    console.log(`❌ ${r.name} - ${r.status} - ${r.type}`);
  });
  
  console.log('\n=== Failed Sources ===');
  const failed = results.filter(r => r.error);
  failed.forEach(r => {
    console.log(`⚠️ ${r.name} - ${r.error}`);
  });
}

checkSources();
