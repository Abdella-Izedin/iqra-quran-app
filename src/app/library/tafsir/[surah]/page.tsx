import { Suspense } from 'react';
import TafsirSurahClient from './TafsirSurahClient';

// Generate static params for all 114 surahs
export function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({
    surah: String(i + 1),
  }));
}

function TafsirLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-[var(--muted)] mt-4 font-tajawal">جاري التحميل...</p>
      </div>
    </div>
  );
}

export default async function SurahTafsirPage({ params }: { params: Promise<{ surah: string }> }) {
  const { surah } = await params;
  return (
    <Suspense fallback={<TafsirLoading />}>
      <TafsirSurahClient surahNumber={surah} />
    </Suspense>
  );
}
