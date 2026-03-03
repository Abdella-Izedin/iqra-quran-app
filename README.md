# تطبيق اقرأ - القرآن الكريم

تطبيق إسلامي شامل مبني باستخدام Next.js 16 مع دعم كامل للغة العربية والأردية (RTL).

## 🌟 الميزات

### 📖 وحدة المصحف الشريف
- عرض السور والآيات بالرسم العثماني
- قراءة صفحات المصحف كاملة
- ترجمات متعددة (أردو، إنجليزي، وغيرها)
- علامات الحفظ وآخر موقع قراءة

### 🎧 وحدة القراء
- مشغل صوتي مدمج
- قراء متعددون (الحصري، السديس، المنشاوي، وغيرهم)
- تشغيل متواصل للسور

### 📿 الورد اليومي (الختمة)
- إنشاء ختمة مخصصة
- متابعة التقدم اليومي
- اختيار مدة الختمة (7-365 يوم)

### 🤲 وحدة الأذكار
- أذكار الصباح والمساء
- أذكار بعد الصلاة
- أذكار النوم والاستيقاظ
- أذكار السفر والطعام

### 🛡️ الرقية الشرعية
- آيات الرقية من القرآن
- أذكار الحماية والشفاء
- عداد التكرار

### 📿 المسبحة الإلكترونية
- عداد رقمي مع اهتزاز
- تسبيحات متعددة
- حفظ العدد الإجمالي

### 🕌 مواقيت الصلاة
- تحديد الموقع التلقائي
- أوقات الصلاة الدقيقة
- الصلاة القادمة

### 🧭 اتجاه القبلة
- بوصلة تفاعلية
- تحديد الاتجاه بدقة

### 📚 المكتبة الإسلامية
- **التفسير**: تفاسير متعددة للقرآن الكريم
- **الحديث**: كتب الحديث (البخاري، مسلم، أبو داود، الترمذي، وغيرها)
- **أسماء الله الحسنى**: الأسماء الـ99 مع الشرح

### 🌐 دعم اللغات
- العربية
- الأردية

### 🌙 الوضع الداكن
- دعم كامل للوضع الداكن
- حفظ التفضيلات

---

## 🔗 APIs المستخدمة

### 1. AlQuran Cloud API
**الموقع**: [https://alquran.cloud/api](https://alquran.cloud/api)

**الاستخدامات**:
```
# الحصول على صفحة من المصحف بالرسم العثماني
GET https://api.alquran.cloud/v1/page/{pageNumber}/quran-uthmani

# الحصول على قائمة السور
GET https://api.alquran.cloud/v1/surah

# الحصول على سورة كاملة
GET https://api.alquran.cloud/v1/surah/{surahNumber}

# الحصول على آية مع التفسير الميسر
GET https://api.alquran.cloud/v1/ayah/{surahNumber}:{ayahNumber}/ar.muyassar
```

---

### 2. Quran.com API
**الموقع**: [https://api.quran.com](https://quran.api-docs.io/)

**الاستخدامات**:
```
# الحصول على آيات السورة بالرسم العثماني
GET https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number={surahNumber}

# الحصول على ترجمة سورة
GET https://api.quran.com/api/v4/quran/translations/{translationId}?chapter_number={surahNumber}

# الحصول على ملفات صوت القراء
GET https://api.quran.com/api/v4/recitations/{recitationId}/by_chapter/{surahNumber}

# الحصول على تفسير آية
GET https://api.quran.com/api/v4/tafsirs/{tafsirId}/by_ayah/{surahNumber}:{ayahNumber}
```

**معرفات الترجمات (Translation IDs)**:
| المعرف | الترجمة |
|--------|---------|
| 97 | الأردية (احمد رضا خان) |
| 234 | الأردية (محمد جونجاري) |
| 54 | الأردية (ابو الاعلى المودودي) |
| 20 | الإنجليزية (Sahih International) |
| 131 | الإنجليزية (Dr. Mustafa Khattab) |

**معرفات التفاسير (Tafsir IDs)**:
| المعرف | التفسير |
|--------|---------|
| 164 | التفسير الميسر (عربي) |
| 165 | تفسير المختصر (عربي) |
| 157 | تفسير الجلالين (عربي) |

---

### 3. Aladhan API (مواقيت الصلاة)
**الموقع**: [https://aladhan.com/prayer-times-api](https://aladhan.com/prayer-times-api)

**الاستخدامات**:
```
# الحصول على مواقيت الصلاة
GET https://api.aladhan.com/v1/timings/{date}?latitude={lat}&longitude={lng}&method=4

# date: التاريخ بصيغة DD-MM-YYYY
# method=4: أم القرى (السعودية)
```

**طرق الحساب (Methods)**:
| الرقم | الطريقة |
|-------|---------|
| 1 | الجامعة الإسلامية بكراتشي |
| 2 | الجمعية الإسلامية لأمريكا الشمالية (ISNA) |
| 3 | رابطة العالم الإسلامي |
| 4 | أم القرى، مكة المكرمة |
| 5 | الهيئة المصرية العامة للمساحة |

---

### 4. BigDataCloud API (تحديد الموقع)
**الموقع**: [https://www.bigdatacloud.com/](https://www.bigdatacloud.com/)

**الاستخدامات**:
```
# تحويل الإحداثيات إلى اسم المدينة
GET https://api.bigdatacloud.net/data/reverse-geocode-client?latitude={lat}&longitude={lng}&localityLanguage=ar
```

---

### 5. Hadith API (كتب الحديث)
**الموقع**: [https://github.com/fawazahmed0/hadith-api](https://github.com/fawazahmed0/hadith-api)

**الاستخدامات**:
```
# الحصول على كتاب حديث كامل
GET https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/{lang}-{book}.json

# أمثلة:
# البخاري بالعربية
GET https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-bukhari.json

# مسلم بالأردية
GET https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/urd-muslim.json
```

**الكتب المتاحة**:
| الكتاب | المعرف |
|--------|--------|
| صحيح البخاري | bukhari |
| صحيح مسلم | muslim |
| سنن أبي داود | abudawud |
| جامع الترمذي | tirmidhi |
| سنن النسائي | nasai |
| سنن ابن ماجه | ibnmajah |
| موطأ مالك | malik |
| مسند أحمد | ahmad |
| سنن الدارمي | darimi |

**اللغات**:
| اللغة | الرمز |
|-------|-------|
| العربية | ara |
| الأردية | urd |
| الإنجليزية | eng |

---

### 6. Quran.com Audio (ملفات الصوت)
**الاستخدام**:
```
# رابط ملف صوت آية
https://verses.quran.com/{audioUrl}
```

---

## 🛠️ التقنيات المستخدمة

- **Next.js 16** - إطار العمل
- **React 19** - مكتبة واجهة المستخدم
- **TypeScript** - لغة البرمجة
- **Tailwind CSS 4** - التصميم
- **next-intl** - الترجمة والتدويل
- **Sonner** - إشعارات Toast
- **PWA** - تطبيق ويب تقدمي

---

## 📁 هيكل المشروع

```
src/
├── app/                    # صفحات التطبيق
│   ├── athkar/            # صفحات الأذكار
│   │   └── [category]/    # فئات الأذكار
│   ├── quran/             # صفحات المصحف
│   │   └── [number]/      # صفحة السورة
│   ├── mushaf/            # صفحات المصحف
│   │   └── [page]/        # صفحة المصحف
│   ├── daily-wird/        # الورد اليومي
│   │   └── read/          # قراءة الورد
│   ├── reciters/          # صفحة القراء
│   │   └── [id]/          # صفحة القارئ
│   ├── ruqyah/            # صفحات الرقية
│   │   └── [section]/     # أقسام الرقية
│   ├── tasbeeh/           # صفحة المسبحة
│   ├── qibla/             # صفحة القبلة
│   ├── prayer/            # مواقيت الصلاة
│   ├── library/           # المكتبة
│   │   ├── hadith/        # الحديث
│   │   │   └── [book]/    # كتاب الحديث
│   │   ├── tafsir/        # التفسير
│   │   │   └── [surah]/   # تفسير السورة
│   │   └── names/         # أسماء الله الحسنى
│   ├── menu/              # القائمة
│   ├── about/             # عن التطبيق
│   └── khatmah/           # إدارة الختمة
├── components/             # المكونات
│   ├── layout/            # مكونات التخطيط
│   │   ├── Header.tsx
│   │   ├── BottomNavigation.tsx
│   │   └── LayoutWrapper.tsx
│   └── ui/                # مكونات واجهة المستخدم
│       ├── WirdCard.tsx
│       ├── FeatureCard.tsx
│       └── ContinueReadingCard.tsx
├── data/                   # البيانات الثابتة
│   ├── athkar/            # بيانات الأذكار (JSON)
│   ├── quran/             # بيانات القرآن
│   │   ├── surahs.json    # معلومات السور
│   │   ├── pages.json     # معلومات الصفحات
│   │   └── reciters.json  # قائمة القراء
│   └── ruqyah.json        # بيانات الرقية
├── messages/               # ملفات الترجمة
│   ├── ar.json            # العربية
│   └── ur.json            # الأردية
└── types/                  # أنواع TypeScript
    └── index.ts
```

---

## 🚀 تشغيل المشروع

### التثبيت

```bash
npm install
```

### التطوير

```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

### البناء للإنتاج

```bash
npm run build
npm start
```

---

## 📱 تحويل التطبيق إلى تطبيق موبايل (Capacitor)

يمكنك تحويل هذا التطبيق إلى تطبيق موبايل أصلي لـ Android و iOS باستخدام Capacitor.

### ✅ الحالة الحالية

التطبيق **جاهز الآن** للنشر على الموبايل! تم إكمال الخطوات التالية:
- ✅ تثبيت Capacitor Core و CLI
- ✅ تثبيت منصتي Android و iOS
- ✅ تعديل Next.js للتصدير الثابت (Static Export)
- ✅ بناء 904 صفحة ثابتة
- ✅ مزامنة الملفات مع المنصات

### المتطلبات الأساسية

#### لنظام Android:
- [Android Studio](https://developer.android.com/studio) (أحدث إصدار)
- Java Development Kit (JDK 17+)
- Android SDK (API 22+)

#### لنظام iOS (يتطلب جهاز Mac):
- [Xcode](https://apps.apple.com/us/app/xcode/id497799835) (أحدث إصدار)
- CocoaPods (`sudo gem install cocoapods`)
- حساب Apple Developer للنشر على App Store

---

### 🚀 البناء السريع (الخطوات المطلوبة الآن)

لبناء التطبيق للموبايل، اتبع هذه الخطوات:

```bash
# 1. بناء التطبيق
npm run build

# 2. مزامنة مع المنصات
npx cap sync

# 3. فتح Android Studio
npx cap open android

# أو فتح Xcode (على Mac فقط)
npx cap open ios
```

---

### الخطوة 1: تثبيت Capacitor (مكتمل ✅)

```bash
# تثبيت Capacitor CLI والمكتبات الأساسية
npm install @capacitor/core @capacitor/cli

# تهيئة Capacitor في المشروع
npx cap init "اقرأ" "com.iqra.quran.app" --web-dir=out
```

> **ملاحظة**: `com.iqra.quran.app` هو معرف التطبيق (Bundle ID).

---

### الخطوة 2: تعديل إعدادات Next.js للتصدير الثابت

عدّل ملف `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
```

---

### الخطوة 3: بناء التطبيق

```bash
# بناء التطبيق
npm run build
```

سيتم إنشاء مجلد `out` يحتوي على الملفات الثابتة.

---

### الخطوة 4: إضافة منصات الموبايل

#### لـ Android:

```bash
# تثبيت حزمة Android
npm install @capacitor/android

# إضافة منصة Android
npx cap add android

# مزامنة الملفات مع Android
npx cap sync android
```

#### لـ iOS:

```bash
# تثبيت حزمة iOS
npm install @capacitor/ios

# إضافة منصة iOS
npx cap add ios

# مزامنة الملفات مع iOS
npx cap sync ios

# تثبيت pods (مطلوب لـ iOS)
cd ios/App && pod install && cd ../..
```

---

### الخطوة 5: تشغيل التطبيق

#### Android:

```bash
# فتح المشروع في Android Studio
npx cap open android
```

في Android Studio:
1. انتظر حتى يكتمل تحميل Gradle
2. اختر جهاز (Emulator أو جهاز حقيقي متصل)
3. اضغط على زر ▶️ Run

#### iOS (Mac فقط):

```bash
# فتح المشروع في Xcode
npx cap open ios
```

في Xcode:
1. اختر Signing Team من إعدادات المشروع
2. اختر جهاز Simulator أو جهاز حقيقي
3. اضغط على زر ▶️ Run

---

### الخطوة 6: إضافة الأيقونات و Splash Screen

#### تثبيت حزمة الموارد:

```bash
npm install @capacitor/splash-screen @capacitor/status-bar
```

#### إنشاء الأيقونات:

ضع الصور في مجلد `resources/`:

```
resources/
├── icon.png          (1024x1024 px)
├── splash.png        (2732x2732 px)
```

ثم شغّل:

```bash
# تثبيت أداة توليد الأيقونات
npm install -g @capacitor/assets

# توليد الأيقونات لجميع المنصات
npx capacitor-assets generate
```

---

### الخطوة 7: إعدادات إضافية (capacitor.config.ts)

أنشئ أو عدّل ملف `capacitor.config.ts`:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.iqra.quran.app',
  appName: 'اقرأ',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1A1A2E",
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1A1A2E',
    },
  },
};

export default config;
```

---

### الخطوة 8: إضافة مميزات Native (اختياري)

```bash
# للاهتزاز (Vibration)
npm install @capacitor/haptics

# للتخزين المحلي
npm install @capacitor/preferences

# للإشعارات
npm install @capacitor/push-notifications
npm install @capacitor/local-notifications

# للمشاركة
npm install @capacitor/share
```

---

### الخطوة 9: بناء APK / AAB للنشر

#### Android:

في Android Studio:
1. اذهب إلى **Build > Generate Signed Bundle / APK**
2. اختر **Android App Bundle (AAB)** للنشر على Play Store
3. أو اختر **APK** للتوزيع المباشر
4. أنشئ Keystore جديد أو استخدم موجود
5. اختر **release** ثم **Finish**

الملف سيكون في:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

#### iOS:

في Xcode:
1. اذهب إلى **Product > Archive**
2. بعد اكتمال الـ Archive، اضغط **Distribute App**
3. اختر **App Store Connect** للنشر
4. اتبع الخطوات لرفع التطبيق

---

### الخطوة 10: تحديث التطبيق

بعد أي تعديل على الكود:

```bash
# بناء التطبيق
npm run build

# مزامنة التغييرات
npx cap sync

# أو لمنصة محددة
npx cap sync android
npx cap sync ios
```

---

### ملخص الأوامر السريعة

```bash
# التثبيت الأولي
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init "اقرأ" "com.iqra.quran.app" --web-dir=out

# البناء والمزامنة
npm run build
npx cap sync

# فتح المشاريع
npx cap open android    # Android Studio
npx cap open ios        # Xcode

# تشغيل مباشر (بدون فتح IDE)
npx cap run android
npx cap run ios
```

---

### حل المشاكل الشائعة

| المشكلة | الحل |
|---------|------|
| `Gradle sync failed` | تأكد من تثبيت JDK 17+ و Android SDK |
| `CocoaPods not found` | شغّل `sudo gem install cocoapods` |
| `Signing error (iOS)` | أضف Apple Developer Team في Xcode |
| `White screen` | تأكد من أن `webDir` هو `out` وليس `.next` |
| `Images not loading` | أضف `unoptimized: true` في `next.config.ts` |

---

### الروابط المفيدة

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Studio Download](https://developer.android.com/studio)
- [Xcode Download](https://apps.apple.com/us/app/xcode/id497799835)
- [Google Play Console](https://play.google.com/console)
- [Apple App Store Connect](https://appstoreconnect.apple.com)

---

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى:
1. عمل Fork للمشروع
2. إنشاء فرع جديد (`git checkout -b feature/amazing-feature`)
3. عمل Commit للتغييرات (`git commit -m 'Add amazing feature'`)
4. رفع الفرع (`git push origin feature/amazing-feature`)
5. فتح Pull Request

---

## 📄 الترخيص

هذا المشروع مفتوح المصدر.

---

## 🤲 لا تنسونا من صالح دعائكم

**بارك الله فيكم** 🤲

---

## 📞 التواصل

للتواصل والاقتراحات:
- WhatsApp: [+91 6363857328](https://wa.me/916363857328)
