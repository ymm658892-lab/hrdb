export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const SHEETS_URL = process.env.SHEETS_URL;

  if (req.method === 'GET') {
    try {
      const response = await fetch(SHEETS_URL);
      const data = await response.json();
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ status: 'error', message: '無法連接試算表' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      const response = await fetch(SHEETS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ status: 'error', message: '操作失敗' });
    }
  }
}
