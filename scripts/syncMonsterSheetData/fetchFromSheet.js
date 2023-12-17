require('dotenv').config();
const { google } = require('googleapis');

const { SHEET_ID } = process.env;

async function fetchFromSheet(sheetRange) {
  const auth = await google.auth.getClient({
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/devstorage.read_write',
    ],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: sheetRange,
  });

  const rows = response?.data?.values;
  const keys = rows[0];
  const data = rows.slice(1, rows.length)
    .map((row) => row.reduce((rowObj, cellStr, index) => {
      const key = keys[index];
      const value = cellStr.includes('[') || /^\d+$/.test(cellStr) ? JSON.parse(cellStr) : cellStr;
      if (!value) return rowObj;
      return {
        ...rowObj,
        [key]: value,
      };
    }, {}));
  return data;
}

module.exports = fetchFromSheet;
