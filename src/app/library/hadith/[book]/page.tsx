import HadithBookClient from './HadithBookClient';

// Generate static params for all hadith books
export function generateStaticParams() {
  return [
    { book: 'bukhari' },
    { book: 'muslim' },
    { book: 'abudawud' },
    { book: 'tirmidhi' },
    { book: 'nasai' },
    { book: 'ibnmajah' },
    { book: 'malik' },
    { book: 'nawawi' },
    { book: 'qudsi' },
  ];
}

export default async function HadithBookPage({ params }: { params: Promise<{ book: string }> }) {
  const { book } = await params;
  return <HadithBookClient book={book} />;
}
