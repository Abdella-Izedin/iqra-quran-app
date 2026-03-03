import Link from 'next/link';

interface FeatureCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  iconBgColor: string;
  iconColor?: string;
}

export default function FeatureCard({ 
  href, 
  icon, 
  title, 
  iconBgColor,
  iconColor = 'text-white'
}: FeatureCardProps) {
  return (
    <Link href={href} className="block group">
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-5 flex flex-col items-center gap-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-[var(--primary)] dark:hover:border-[var(--primary-light)]">
        <div 
          className="w-16 h-16 rounded-2xl bg-[var(--accent)] text-[var(--primary)] dark:bg-[var(--surface-2)] dark:text-[var(--primary-light)] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[var(--primary)] group-hover:text-white dark:group-hover:bg-[var(--primary-light)] dark:group-hover:text-[var(--background)]"
        >
          {icon}
        </div>
        <span className="text-sm font-semibold text-center text-[var(--foreground)] font-tajawal group-hover:text-[var(--primary)] dark:group-hover:text-[var(--primary-light)] transition-colors">{title}</span>
      </div>
    </Link>
  );
}
