import AthkarCategoryClient from './AthkarCategoryClient';

// Generate static params for all athkar categories
export function generateStaticParams() {
  return [
    { category: 'morning' },
    { category: 'evening' },
    { category: 'after-prayer' },
    { category: 'sleep' },
    { category: 'wake-up' },
    { category: 'entering-home' },
    { category: 'entering-mosque' },
    { category: 'food' },
    { category: 'travel' },
    { category: 'anxiety' },
    { category: 'quran-completion' },
    { category: 'misc' },
  ];
}

export default async function AthkarCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  return <AthkarCategoryClient categoryId={category} />;
}
