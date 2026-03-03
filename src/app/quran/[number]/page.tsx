import SurahClient from './SurahClient';

// Generate static params for all 114 surahs
export function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({
    number: String(i + 1),
  }));
}

export default async function SurahPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  return <SurahClient surahNumber={number} />;
}
