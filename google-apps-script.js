// ============================================
// Google Apps Script - לוגים משותפים לאופטיסטור
// ============================================
//
// הוראות התקנה:
// 1. פתח את Google Sheets שלך (או צור חדש)
// 2. לחץ על Extensions > Apps Script
// 3. מחק את כל הקוד שם והדבק את הקוד הזה
// 4. לחץ Deploy > New deployment
// 5. בחר Type: Web app
// 6. הגדר: Execute as = Me, Who has access = Anyone
// 7. לחץ Deploy והעתק את ה-URL שמתקבל
// 8. הדבק את ה-URL בהגדרות האפליקציה
//
// הסקריפט יצור אוטומטית גיליון בשם "לוגים" אם הוא לא קיים

const SHEET_NAME = 'לוגים';
const HEADERS = ['תאריך', 'נציג/ה', 'פלטפורמה', 'שאלת הלקוח', 'הנציג כתב', 'המערכת תיקנה'];

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// POST - save a new log entry
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

    sheet.insertRowAfter(1); // Insert after header
    sheet.getRange(2, 1, 1, 6).setValues([[
      data.date || '',
      data.agent || '',
      data.platform || '',
      data.context || '',
      data.original || '',
      data.corrected || ''
    ]]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET - read all logs
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();

    // Skip header row, return as array of objects
    const logs = [];
    for (let i = 1; i < data.length; i++) {
      logs.push({
        date: data[i][0],
        agent: data[i][1],
        platform: data[i][2],
        context: data[i][3],
        original: data[i][4],
        corrected: data[i][5]
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify(logs))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
