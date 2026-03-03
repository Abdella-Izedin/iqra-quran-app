import type { Metadata, Viewport } from "next";
import "./globals.css";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { LocaleProvider } from '@/providers/LocaleProvider';
import { ThemeInitializer } from '@/providers/ThemeInitializer';
import { getLocale, getMessages } from 'next-intl/server';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "اقرأ - القرآن الكريم",
  description: "تطبيق إسلامي شامل يضم المصحف الشريف، الأذكار، الرقية الشرعية، المسبحة، واتجاه القبلة",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "اقرأ",
  },
  keywords: ["قرآن", "أذكار", "إسلام", "مصحف", "رقية", "مسبحة", "قبلة"],
  authors: [{ name: "اقرأ" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1b6b4d",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-96x96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeInitializer />
        <LocaleProvider initialLocale={locale} initialMessages={messages as Record<string, unknown>}>
          <LayoutWrapper>{children}</LayoutWrapper>
          <Toaster position="top-center" richColors closeButton />
        </LocaleProvider>
      </body>
    </html>
  );
}
