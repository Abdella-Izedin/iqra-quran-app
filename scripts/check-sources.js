const sources = [
  { name: 'Quran.com Madani', url: 'https://static.qurancdn.com/images/pages/madani/page001.png' },
  { name: 'Al-Quran Cloud', url: 'https://cdn.alquran.cloud/media/image/1' },
  { name: 'QuranEnc', url: 'https://quranenc.com/media/quran_pages/1.png' },
  { name: 'Quran Complex', url: 'https://www.qurancomplex.gov.sa/kfgqpc/Quran/quran_pages/page001.png' },
  { name: 'Madinah Mushaf', url: 'https://madinah.qurancomplex.gov.sa/img/quranpages/1.png' },
  { name: 'QuranFlash', url: 'https://www.quranflash.com/quranimage?mushafID=1&pageNo=1' },
  { name: 'MP3Quran', url: 'https://www.mp3quran.net/api/quran_pages_svg/001.svg' },
];

async function check() {
  for (const s of sources) {
    try {
      const r = await fetch(s.url, { method: 'HEAD' });
      console.log(`${s.name}: ${r.status} - ${r.headers.get('content-type')}`);
    } catch (e) {
      console.log(`${s.name}: ERROR - ${e.message}`);
    }
  }
}

check();
