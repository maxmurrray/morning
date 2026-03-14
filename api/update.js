module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const NOTION_KEY = process.env.NOTION_KEY;
  const { pageId, property, value, type } = req.body;

  let propValue;
  if (type === 'checkbox') propValue = { checkbox: value };
  else if (type === 'text')   propValue = { rich_text: [{ text: { content: value || '' } }] };
  else if (type === 'number') propValue = { number: value };

  const resp = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${NOTION_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ properties: { [property]: propValue } })
  });

  const data = await resp.json();
  return res.json({ ok: resp.ok });
};
