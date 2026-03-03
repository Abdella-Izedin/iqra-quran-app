import RuqyahSectionClient from './RuqyahSectionClient';
import ruqyahData from '@/data/ruqyah.json';
import type { RuqyahData } from '@/types';

const data = ruqyahData as RuqyahData;

// Generate static params for all ruqyah sections
export function generateStaticParams() {
  return data.sections.map((section) => ({
    section: section.id,
  }));
}

export default async function RuqyahSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  return <RuqyahSectionClient sectionId={section} />;
}
