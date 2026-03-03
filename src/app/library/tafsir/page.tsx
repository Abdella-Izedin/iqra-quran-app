'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getAllSurahs } from '@/services/quranService';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface TafsirOption {
  id: string;
  apiId: number;
}

const tafsirOptions: TafsirOption[] = [
  { id: 'muyassar', apiId: 16 },
  { id: 'ibn-kathir', apiId: 14 },  // ID العربي الصحيح
  { id: 'tabari', apiId: 15 },
  { id: 'qurtubi', apiId: 90 },
  { id: 'saadi', apiId: 91 },
  { id: 'baghawi', apiId: 94 },
  { id: 'wasit', apiId: 93 },
];

export default function TafsirPage() {
  const t = useTranslations('tafsir');
  const tQuran = useTranslations('quran');
  const tCommon = useTranslations('common');
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTafsir, setSelectedTafsir] = useState(tafsirOptions[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // تحميل التفسير المختار من localStorage
  useEffect(() => {
    const savedTafsirId = localStorage.getItem('selectedTafsirId');
    if (savedTafsirId) {
      const found = tafsirOptions.find(t => t.id === savedTafsirId);
      if (found) {
        setSelectedTafsir(found);
      }
    }
  }, []);

  useEffect(() => {
    loadSurahs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.tafsir-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const loadSurahs = () => {
    try {
      // استخدام البيانات المحلية بدلاً من API
      const localSurahs = getAllSurahs();
      setSurahs(localSurahs.map(s => ({
        number: s.number,
        name: s.name,
        englishName: s.englishName,
        englishNameTranslation: s.englishName,
        numberOfAyahs: s.ayahCount,
        revelationType: s.revelationType,
      })));
    } catch (error) {
      console.error('Error loading surahs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSurahs = surahs.filter(
    (surah) =>
      surah.name.includes(searchQuery) ||
      surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.number.toString().includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header */}
      <div className="bg-[var(--card-bg)] sticky top-0 z-10 border-b border-[var(--primary)]/10 shadow-sm dark:bg-[var(--surface-1)]">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] opacity-5"></div>
          <div className="py-5 px-4 relative">
            {/* Back Button */}
            <Link href="/library" className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-tajawal text-sm">{t('backToLibrary')}</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] flex items-center justify-center shadow-lg border border-[var(--primary)]/20">
                <svg className="w-7 h-7 text-[var(--primary-light)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-tajawal text-[var(--foreground)]">{t('title')}</h1>
                <p className="text-[var(--muted)] text-sm font-tajawal">{t('selectSurah')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tafsir Selection */}
        <div className="px-4 pb-3 pt-4">
          <div className="relative tafsir-dropdown">
            {/* Selected Tafsir Button */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-3.5 pl-12 rounded-xl border border-[var(--primary)]/30 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary-light)]/5 text-right font-tajawal font-semibold text-base text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              {t(`tafsirBooks.${selectedTafsir.id}`)} - {t(`tafsirAuthors.${selectedTafsir.id}`)}
            </button>

            {/* Dropdown Icon */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] rounded-full p-1 border border-[var(--primary)]/20">
              <svg
                className={`w-4 h-4 text-[var(--primary-light)] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--card-bg)] border border-[var(--primary)]/30 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto dark:bg-[#111827] dark:border-[var(--primary)]/20">
                {tafsirOptions.map((tafsir) => (
                  <button
                    key={tafsir.id}
                    onClick={() => {
                      setSelectedTafsir(tafsir);
                      localStorage.setItem('selectedTafsirId', tafsir.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-5 py-4 text-right font-tajawal text-base transition-all border-b border-[var(--card-border)] last:border-b-0 ${selectedTafsir.id === tafsir.id
                        ? 'bg-[var(--primary)]/10 text-[var(--primary-dark)] dark:bg-[var(--primary)]/20 dark:text-[var(--primary-light)] font-bold'
                        : 'hover:bg-[var(--primary)]/5 text-[var(--foreground)]'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--muted)]">{t(`tafsirAuthors.${tafsir.id}`)}</span>
                      <span className="font-semibold">{t(`tafsirBooks.${tafsir.id}`)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-4 pt-3">
          <div className="relative">
            <input
              type="text"
              placeholder={t('searchSurah')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-[var(--card-border)] bg-[var(--accent)] text-right font-tajawal focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 dark:bg-white/5 dark:border-white/10 dark:focus:border-[var(--primary)] dark:focus:shadow-[0_0_15px_var(--shadow-color)]"
            />
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[var(--muted)] mt-4 font-tajawal">{t('loadingSurahs')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {filteredSurahs.map((surah) => (
              <Link
                key={surah.number}
                href={`/library/tafsir/${surah.number}?tafsir=${selectedTafsir.apiId}`}
              >
                <div className="group p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--primary)]/30 transition-all duration-300 dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-[var(--primary)]/30 dark:hover:shadow-[0_8px_30px_var(--shadow-color)]">
                  <div className="flex items-center gap-4">
                    {/* Surah Number */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary-light)] font-bold shadow">
                      {surah.number}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold font-amiri text-lg text-[var(--foreground)] group-hover:text-[var(--primary-dark)] dark:group-hover:text-[var(--primary-light)] transition-colors">
                          {surah.name}
                        </h3>
                        <span className="text-sm text-[var(--muted)] font-tajawal">
                          {surah.numberOfAyahs} {t('ayah')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-[var(--accent)] text-[var(--muted)] px-2 py-0.5 rounded-md font-tajawal">
                          {surah.revelationType === 'Meccan' ? tQuran('makki') : tQuran('madani')}
                        </span>
                        <span className="text-xs text-[var(--muted)] font-tajawal">
                          {surah.englishName}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <svg className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
