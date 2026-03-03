import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async () => {
  // For static export, use default locale 'ar'
  // Client-side language switching is handled via localStorage
  const locale = 'ar';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: 'Asia/Riyadh'
  };
});
