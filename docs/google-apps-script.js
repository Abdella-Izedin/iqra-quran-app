// ══════════════════════════════════════════════════════════════
// كود Google Apps Script — لاستقبال ملاحظات تطبيق إقرأ
// ══════════════════════════════════════════════════════════════
//
// 📌 خطوات الإعداد:
//
// 1. افتح Google Sheets جديد من: https://sheets.google.com
//
// 2. سمّ الملف: "ملاحظات تطبيق إقرأ"
//
// 3. في الصف الأول (A1 إلى H1) أضف العناوين التالية:
//    التاريخ | الاسم | الإيميل | التقييم | النوع | الملاحظة | الجهاز | اللغة
//
// 4. من القائمة العلوية: Extensions > Apps Script
//
// 5. احذف الكود الموجود والصق هذا الكود كاملاً
//
// 6. غيّر الإيميل في السطر التالي إلى إيميلك:

const YOUR_EMAIL = 'izedin2017@gmail.com';

// 7. هل تريد إشعار إيميل لكل ملاحظة؟ (true = نعم، false = لا)
const SEND_EMAIL = true;

// 8. من القائمة: Deploy > New deployment
//    - Type: Web app
//    - Execute as: Me
//    - Who has access: Anyone
//    - اضغط Deploy
//
// 9. انسخ الرابط الذي يظهر (Web app URL)
//
// 10. افتح ملف feedback.html وابحث عن:
//     YOUR_GOOGLE_APPS_SCRIPT_URL_HERE
//     واستبدله بالرابط الذي نسخته
//
// ══════════════════════════════════════════════════════════════


/**
 * دالة استقبال البيانات من صفحة الملاحظات
 * تُستدعى تلقائياً عند إرسال POST request
 */
function doPost(e) {
  try {
    // قراءة البيانات المُرسلة
    var data = JSON.parse(e.postData.contents);

    // حفظ في Google Sheets
    saveToSheet(data);

    // إرسال إشعار بالإيميل (اختياري)
    if (SEND_EMAIL) {
      sendEmailNotification(data);
    }

    // إرجاع رد ناجح
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // إرجاع رد خطأ
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


/**
 * حفظ البيانات في Google Sheets
 */
function saveToSheet(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // ترجمة التقييم لنص مفهوم
  var ratingLabels = ['', '⭐ ضعيف', '⭐⭐ مقبول', '⭐⭐⭐ جيد', '⭐⭐⭐⭐ ممتاز', '⭐⭐⭐⭐⭐ رائع'];
  var ratingText = ratingLabels[data.rating] || 'لم يُقيّم';

  // ترجمة نوع الملاحظة
  var categoryLabels = {
    'feature': '💡 اقتراح ميزة',
    'bug': '🐛 بلاغ عن خطأ',
    'usability': '🎯 سهولة الاستخدام',
    'quran_content': '📖 محتوى قرآني',
    'other': '✨ أخرى'
  };
  var categoryText = categoryLabels[data.category] || 'غير محدد';

  // إضافة صف جديد
  sheet.appendRow([
    new Date(),                          // التاريخ
    data.name || 'مجهول',                // الاسم
    data.email || '-',                   // الإيميل
    ratingText,                          // التقييم
    categoryText,                        // النوع
    data.feedback,                       // الملاحظة
    data.device || '-',                  // الجهاز
    data.language || '-'                 // اللغة
  ]);
}


/**
 * إرسال إشعار بالإيميل عند استقبال ملاحظة جديدة
 */
function sendEmailNotification(data) {
  var ratingStars = '';
  for (var i = 0; i < (data.rating || 0); i++) ratingStars += '⭐';
  if (!ratingStars) ratingStars = 'لم يُقيّم';

  var categoryLabels = {
    'feature': '💡 اقتراح ميزة',
    'bug': '🐛 بلاغ عن خطأ',
    'usability': '🎯 سهولة الاستخدام',
    'quran_content': '📖 محتوى قرآني',
    'other': '✨ أخرى'
  };

  var subject = '📬 ملاحظة جديدة — تطبيق إقرأ';

  var htmlBody = ''
    + '<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:600px;margin:0 auto;'
    + 'background:#f9f9f9;border-radius:16px;overflow:hidden;border:1px solid #e0e0e0;">'

    // Header
    + '<div style="background:linear-gradient(135deg,#0B6B4F,#085a42);padding:24px;text-align:center;">'
    + '<h2 style="color:#C9A84C;margin:0;font-size:20px;">📬 ملاحظة جديدة</h2>'
    + '<p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px;">تطبيق إقرأ للقرآن الكريم</p>'
    + '</div>'

    // Body
    + '<div style="padding:24px;">'

    + '<table style="width:100%;border-collapse:collapse;">'

    + '<tr><td style="padding:10px 8px;color:#888;font-size:13px;border-bottom:1px solid #eee;width:100px;">التقييم</td>'
    + '<td style="padding:10px 8px;font-size:15px;border-bottom:1px solid #eee;">' + ratingStars + '</td></tr>'

    + '<tr><td style="padding:10px 8px;color:#888;font-size:13px;border-bottom:1px solid #eee;">النوع</td>'
    + '<td style="padding:10px 8px;font-size:15px;border-bottom:1px solid #eee;">'
    + (categoryLabels[data.category] || 'غير محدد') + '</td></tr>'

    + '<tr><td style="padding:10px 8px;color:#888;font-size:13px;border-bottom:1px solid #eee;">الاسم</td>'
    + '<td style="padding:10px 8px;font-size:15px;border-bottom:1px solid #eee;">'
    + (data.name || 'مجهول') + '</td></tr>'

    + '<tr><td style="padding:10px 8px;color:#888;font-size:13px;border-bottom:1px solid #eee;">الإيميل</td>'
    + '<td style="padding:10px 8px;font-size:15px;border-bottom:1px solid #eee;direction:ltr;text-align:right;">'
    + (data.email || '-') + '</td></tr>'

    + '<tr><td style="padding:10px 8px;color:#888;font-size:13px;border-bottom:1px solid #eee;">الجهاز</td>'
    + '<td style="padding:10px 8px;font-size:15px;border-bottom:1px solid #eee;">'
    + (data.device || '-') + '</td></tr>'

    + '<tr><td style="padding:10px 8px;color:#888;font-size:13px;border-bottom:1px solid #eee;">اللغة</td>'
    + '<td style="padding:10px 8px;font-size:15px;border-bottom:1px solid #eee;">'
    + (data.language || '-') + '</td></tr>'

    + '</table>'

    // الملاحظة
    + '<div style="margin-top:20px;padding:16px;background:#fff;border-radius:12px;'
    + 'border:1px solid #e8e8e8;border-right:4px solid #0B6B4F;">'
    + '<p style="color:#888;font-size:12px;margin:0 0 8px;">الملاحظة:</p>'
    + '<p style="color:#333;font-size:15px;line-height:1.8;margin:0;white-space:pre-wrap;">'
    + data.feedback + '</p>'
    + '</div>'

    + '</div>'

    // Footer
    + '<div style="padding:16px;text-align:center;background:#f0f0f0;border-top:1px solid #e0e0e0;">'
    + '<p style="color:#999;font-size:12px;margin:0;">تم الإرسال بتاريخ: '
    + new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' }) + '</p>'
    + '</div>'

    + '</div>';

  MailApp.sendEmail({
    to: YOUR_EMAIL,
    subject: subject,
    htmlBody: htmlBody
  });
}
