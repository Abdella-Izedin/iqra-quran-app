// البحث عن مصحف أردي مصور
const sources = [
  // Quran.com API للصفحات مع ترجمة
  { name: 'QuranCDN Urdu', url: 'https://static.qurancdn.com/images/w/urdu/1_1.png' },
  
  // مستودعات GitHub معروفة
  { name: 'GitHub 16Lines', url: 'https://raw.githubusercontent.com/nicta120/quran-16line/main/pages/001.png' },
  { name: 'GitHub Kanzul', url: 'https://raw.githubusercontent.com/nicta120/kanzul-iman/main/pages/001.jpg' },
  { name: 'Zuper4 Qiraats', url: 'https://raw.githubusercontent.com/Zuper4/mushaf-qiraats/main/images/hafs_16_line/001.png' },
  
  // Archive.org
  { name: 'Archive 16Line', url: 'https://ia800500.us.archive.org/31/items/quran-16-line-urdu/001.jpg' },
  { name: 'Archive Pak', url: 'https://archive.org/download/quran-pak-urdu/001.jpg' },
  
  // MP3Quran variants
  { name: 'MP3Quran 16', url: 'https://www.mp3quran.net/api/quran_pages_16/001.svg' },
  { name: 'MP3Quran Urdu', url: 'https://www.mp3quran.net/api/quran_urdu/001.svg' },
  
  // مواقع مشهورة للقرآن الأردي
  { name: 'Dawateislami', url: 'https://www.dawateislami.net/onlinequran/images/001.jpg' },
  { name: 'QuranExplorer Urdu', url: 'https://quranexplorer.com/urdu/images/001.jpg' },
];

async function check() {
  console.log('Searching for Urdu Quran mushaf images...\n');
  
  for (const s of sources) {
    try {
      const r = await fetch(s.url, { signal: AbortSignal.timeout(8000) });
      const type = r.headers.get('content-type') || '';
      const isImage = type.startsWith('image/');
      if (isImage) {
        console.log(`✅ FOUND: ${s.name}`);
        console.log(`   URL: ${s.url}`);
        console.log(`   Type: ${type}\n`);
      } else {
        console.log(`❌ ${s.name}: ${r.status} - ${type.substring(0,20)}`);
      }
    } catch (e) {
      console.log(`⚠️ ${s.name}: Failed`);
    }
  }
}

check();
