/**
 * Google Apps Script webhook that writes to two tabs: HealthCheck and VividVision.
 * Deploy as a Web App (access: Anyone with link) and set the URL as:
 * - HEALTHCHECK_WEBHOOK_URL (backend .env)
 * - VISION_WEBHOOK_URL (backend .env)
 */

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var sheetName = body.sheet || 'Unknown';
    var ss = SpreadsheetApp.getActive();
    var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

    var dataObj = body.ratings || body.answers || {};
    var ts = body.ts || new Date().toISOString();

    // Build header keys: ts + keys of data object (stable ordering)
    var keys = ['ts'].concat(Object.keys(dataObj));

    // Ensure headers
    var lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      sheet.appendRow(keys);
    } else {
      // If headers exist but missing new keys, extend headers
      var headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
      var headers = headerRange.getValues()[0];
      var missing = keys.filter(function(k){ return headers.indexOf(k) === -1; });
      if (missing.length > 0) {
        sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
        headers = headers.concat(missing);
      }
      keys = headers; // keep existing order + any appended columns
    }

    // Build row aligned to headers
    var headerRange2 = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    var headers2 = headerRange2.getValues()[0];
    var row = headers2.map(function(h){
      if (h === 'ts') return ts;
      var v = dataObj[h];
      if (v === null || v === undefined) return '';
      if (typeof v === 'object') return JSON.stringify(v);
      return v;
    });

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

