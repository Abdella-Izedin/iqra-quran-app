// استخدام ملفات أحاديث جاهزة بسيطة
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data', 'hadith');

// بيانات مبسطة للأحاديث الأربعين النووية (الأهم والأكثر حفظاً)
const nawawi40 = {
  collection: 'nawawi40',
  name: 'الأربعون النووية',
  urduName: 'چالیس حدیثیں',
  description: 'مجموعة من أهم الأحاديث النبوية التي جمعها الإمام النووي',
  totalHadith: 42,
  hadiths: [
    {
      number: 1,
      arabicText: 'عن أمير المؤمنين أبي حفص عمر بن الخطاب رضي الله عنه قال: سمعت رسول الله صلى الله عليه وسلم يقول: إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى، فمن كانت هجرته إلى الله ورسوله فهجرته إلى الله ورسوله، ومن كانت هجرته لدنيا يصيبها أو امرأة ينكحها فهجرته إلى ما هاجر إليه. رواه البخاري ومسلم',
      urduText: 'امیر المؤمنین ابو حفص عمر بن خطاب رضی اللہ عنہ سے روایت ہے کہ میں نے رسول اللہ صلی اللہ علیہ وسلم کو فرماتے ہوئے سنا: بے شک اعمال کا دارومدار نیتوں پر ہے اور ہر شخص کے لیے وہی ہے جو اس نے نیت کی۔',
      theme: 'النية',
      urduTheme: 'نیت'
    },
    {
      number: 2,
      arabicText: 'عن عمر رضي الله عنه أيضاً قال: بينما نحن جلوس عند رسول الله صلى الله عليه وسلم ذات يوم إذ طلع علينا رجل شديد بياض الثياب، شديد سواد الشعر، لا يرى عليه أثر السفر، ولا يعرفه منا أحد... الحديث الطويل في الإسلام والإيمان والإحسان',
      urduText: 'عمر رضی اللہ عنہ سے روایت ہے: ہم رسول اللہ صلی اللہ علیہ وسلم کی خدمت میں بیٹھے تھے کہ ایک شخص آیا جس کے کپڑے بہت سفید تھے اور بال بہت سیاہ...',
      theme: 'الإسلام والإيمان والإحسان',
      urduTheme: 'اسلام، ایمان اور احسان'
    },
    // يمكن إضافة باقي الأحاديث لاحقاً
  ],
  lastUpdated: new Date().toISOString()
};

// أحاديث الأذكار المهمة
const adhkarHadith = {
  collection: 'adhkar',
  name: 'أحاديث الأذكار',
  urduName: 'اذکار کی احادیث',
  description: 'أحاديث مختارة في فضل الأذكار',
  categories: [
    {
      name: 'أذكار الصباح والمساء',
      urduName: 'صبح و شام کے اذکار',
      hadiths: [
        {
          arabicText: 'من قال: لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير، في يوم مائة مرة كانت له عدل عشر رقاب، وكتبت له مائة حسنة، ومحيت عنه مائة سيئة...',
          urduText: 'جس نے دن میں سو بار کہا: لا الہ الا اللہ وحدہ لا شریک لہ... اس کے لیے دس غلام آزاد کرنے کا ثواب ہے۔',
          reference: 'البخاري ومسلم'
        }
      ]
    }
  ],
  lastUpdated: new Date().toISOString()
};

function saveHadithData() {
  console.log('💾 حفظ بيانات الأحاديث المختارة...\n');
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // حفظ الأربعين النووية
  const nawawi40File = path.join(OUTPUT_DIR, 'nawawi40.json');
  fs.writeFileSync(nawawi40File, JSON.stringify(nawawi40, null, 2));
  console.log(`✓ تم حفظ: ${nawawi40.name}`);
  console.log(`  ${nawawi40.totalHadith} حديث`);
  
  // حفظ أحاديث الأذكار
  const adhkarFile = path.join(OUTPUT_DIR, 'adhkar-hadith.json');
  fs.writeFileSync(adhkarFile, JSON.stringify(adhkarHadith, null, 2));
  console.log(`✓ تم حفظ: ${adhkarHadith.name}`);
  
  console.log('\n📝 ملاحظة: يمكن إضافة المزيد من الأحاديث لاحقاً');
  console.log('   - صحيح البخاري (7563 حديث)');
  console.log('   - صحيح مسلم (7190 حديث)');
  console.log('   - بقية الكتب الستة');
}

saveHadithData();
