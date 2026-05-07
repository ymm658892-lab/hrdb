import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = '聯絡人';

function getAuth() {
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    if (req.method === 'GET') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:J1000`,
      });
      const rows = (response.data.values || [])
        .filter(row => row[2] && String(row[2]).trim() !== '')
        .map(row => ({
          id:        String(row[0] || ''),
          type:      row[1] || '',
          name:      row[2] || '',
          title:     row[3] || '',
          email:     row[4] || '',
          phone:     String(row[5] || ''),
          specialty: row[6] || '',
          tags:      row[7] || '',
          note:      row[8] || '',
          link:      row[9] || '',
        }));
      return res.status(200).json({ status: 'ok', data: rows });
    }

    if (req.method === 'POST') {
      const body = req.body;

      if (body.action === 'add') {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!A:J`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[
              body.id, body.type, body.name, body.title,
              body.email, body.phone, body.specialty, body.tags, body.note, body.link || ''
            ]],
          },
        });
        return res.status(200).json({ status: 'ok' });
      }

      if (body.action === 'delete') {
        const getRes = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!A2:A1000`,
        });
        const rows = getRes.data.values || [];
        const rowIndex = rows.findIndex(r => String(r[0]) === String(body.id));
        if (rowIndex === -1) return res.status(200).json({ status: 'ok' });

        const sheetId = await getSheetId(sheets, SPREADSHEET_ID, SHEET_NAME);
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            requests: [{
              deleteDimension: {
                range: {
                  sheetId,
                  dimension: 'ROWS',
                  startIndex: rowIndex + 1,
                  endIndex: rowIndex + 2,
                },
              },
            }],
          },
        });
        return res.status(200).json({ status: 'ok' });
      }
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ status: 'error', message: e.message });
  }
}

async function getSheetId(sheets, spreadsheetId, sheetName) {
  const res = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = res.data.sheets.find(s => s.properties.title === sheetName);
  return sheet?.properties?.sheetId ?? 0;
}
