import ReciterClient from './ReciterClient';
import recitersData from '@/data/quran/reciters.json';

// Generate static params for all reciters
export function generateStaticParams() {
  return recitersData.reciters.map((reciter) => ({
    id: String(reciter.id),
  }));
}

export default async function ReciterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReciterClient reciterId={id} />;
}
