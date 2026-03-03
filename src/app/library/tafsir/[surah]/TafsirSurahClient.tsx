'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getSurahAyahs, getSurahByNumber } from '@/services/quranService';
import { getSurahTafsir } from '@/services/tafsirService';

interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
}

interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface TafsirData {
  text: string;
}

const tafsirNames: Record<number, string> = {
  16: 'التفسير الميسر',
  14: 'تفسير ابن كثير',  // ID العربي الصحيح
  15: 'تفسير الطبري',
  90: 'تفسير القرطبي',
  91: 'تفسير السعدي',
  94: 'تفسير البغوي',
  93: 'التفسير الوسيط',
};

interface TafsirSurahClientProps {
  surahNumber: string;
}

export default function TafsirSurahClient({ surahNumber }: TafsirSurahClientProps) {
  const t = useTranslations('tafsir');
  const tQuran = useTranslations('quran');
  const tCommon = useTranslations('common');
  const searchParams = useSearchParams();
  const tafsirId = searchParams.get('tafsir') || '16';

  const [surah, setSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [tafsirs, setTafsirs] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadingTafsir, setLoadingTafsir] = useState<number | null>(null);
  const [expandedAyah, setExpandedAyah] = useState<number | null>(null);

  useEffect(() => {
    loadSurahData();
  }, [surahNumber]);

  const loadSurahData = () => {
    try {
      setLoading(true);
      const surahNum = parseInt(surahNumber);
      const surahInfo = getSurahByNumber(surahNum);
      const surahAyahs = getSurahAyahs(surahNum);
      
      if (surahInfo && surahAyahs.length > 0) {
        setSurah({
          number: surahInfo.number,
          name: surahInfo.name,
          englishName: surahInfo.englishName,
          numberOfAyahs: surahInfo.ayahCount,
          revelationType: surahInfo.revelationType,
        });
        setAyahs(surahAyahs.map(ayah => ({
          number: ayah.number,
          numberInSurah: ayah.number,
          text: ayah.text
        })));
      }
    } catch (error) {
      console.error('Error loading surah:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTafsir = (ayahNumber: number) => {
    // إذا كان التفسير محملاً، نغلق/نفتح العرض فقط
    if (tafsirs[ayahNumber]) {
      setExpandedAyah(expandedAyah === ayahNumber ? null : ayahNumber);
      return;
    }

    try {
      setLoadingTafsir(ayahNumber);
      // الحصول على التفسير من البيانات المحلية
      const tafsirText = getSurahTafsir(parseInt(tafsirId), parseInt(surahNumber));
      const verseTafsir = tafsirText.find(t => t.ayah === ayahNumber);
      
      if (verseTafsir) {
        setTafsirs(prev => ({
          ...prev,
          [ayahNumber]: verseTafsir.text
        }));
        setExpandedAyah(ayahNumber);
      }
    } catch (error) {
      console.error('Error loading tafsir:', error);
    } finally {
      setLoadingTafsir(null);
    }
  };

  // Helper function to remove HTML tags
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[var(--muted)] mt-4 font-tajawal">{t('loadingSurah')}</p>
        </div>
      </div>
    );
  }

  if (!surah) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--muted)] font-tajawal">{t('surahNotFound')}</p>
          <Link href="/library/tafsir" className="text-emerald-500 font-tajawal mt-2 inline-block">
            {t('backToSurahList')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header */}
      <div className="bg-[var(--card-bg)] sticky top-0 z-10 border-b border-[var(--card-border)] dark:bg-gradient-to-b dark:from-[#111827] dark:to-[#0d1320] dark:border-white/5">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-10"></div>
          <div className="py-5 px-4 relative">
            {/* Back Button */}
            <Link href="/library/tafsir" className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-tajawal text-sm">{t('backToSurahList')}</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {surah.number}
              </div>
              <div>
                <h1 className="text-2xl font-bold font-amiri text-[var(--foreground)]">{surah.name}</h1>
                <p className="text-[var(--muted)] text-sm font-tajawal">
                  {surah.numberOfAyahs} {t('ayah')} • {surah.revelationType === 'Meccan' ? tQuran('makki') : tQuran('madani')} • {tafsirNames[parseInt(tafsirId)] || t('title')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ayahs */}
      <div className="px-4 pt-4">
        <div className="space-y-3">
          {ayahs.map((ayah) => (
            <div key={ayah.number} className="rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] overflow-hidden dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5">
              {/* Ayah */}
              <div 
                className="p-4 cursor-pointer hover:bg-[var(--accent)] transition-colors"
                onClick={() => loadTafsir(ayah.numberInSurah)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {ayah.numberInSurah}
                  </div>
                  <p className="font-amiri text-xl leading-loose text-[var(--foreground)] flex-1 text-right">
                    {ayah.text}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <button className="text-emerald-500 text-sm font-tajawal flex items-center gap-1">
                    {loadingTafsir === ayah.numberInSurah ? (
                      <>
                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>{tCommon('loading')}</span>
                      </>
                    ) : expandedAyah === ayah.numberInSurah ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        <span>{t('hideTafsir')}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span>{t('showTafsir')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Tafsir */}
              {expandedAyah === ayah.numberInSurah && tafsirs[ayah.numberInSurah] && (
                <div className="p-4 bg-emerald-500/5 border-t border-[var(--card-border)]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className="font-tajawal font-bold text-emerald-600 text-sm">{tafsirNames[parseInt(tafsirId)] || 'التفسير'}</span>
                  </div>
                  <p className="font-tajawal text-[var(--foreground)] leading-relaxed text-right">
                    {stripHtml(tafsirs[ayah.numberInSurah])}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-bold font-tajawal text-sm mb-1 text-emerald-700 dark:text-emerald-400">{t('tafsirOfSurah')} {surah.name.replace('سورة ', '')}</p>
              <p className="text-[var(--muted)] text-xs font-tajawal leading-relaxed">
                {t('tapAyahToShowTafsir')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
