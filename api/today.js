module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const NOTION_KEY = process.env.NOTION_KEY;
  const DB_ID = process.env.TRACKER_DB_ID;
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

  const headers = {
    'Authorization': `Bearer ${NOTION_KEY}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  };

  const qRes = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
    method: 'POST', headers,
    body: JSON.stringify({ filter: { property: 'Date', title: { equals: today } } })
  });
  const qData = await qRes.json();

  let page;
  if (qData.results && qData.results.length > 0) {
    page = qData.results[0];
  } else {
    const cRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST', headers,
      body: JSON.stringify({
        parent: { database_id: DB_ID },
        properties: { 'Date': { title: [{ text: { content: today } }] } }
      })
    });
    page = await cRes.json();
  }

  const p = page.properties || {};
  const chk = (k) => (p[k] && p[k].checkbox) || false;
  const txt = (k) => (p[k] && p[k].rich_text && p[k].rich_text[0] && p[k].rich_text[0].plain_text) || '';
  const num = (k) => (p[k] && p[k].number) || null;

  return res.json({
    pageId: page.id,
    date: today,
    habits: {
      spiritual:    chk('🙏 Spiritual Practice'),
      meditate:     chk('🧘 Meditate'),
      journal:      chk('📓 Journal'),
      read:         chk('📖 Read'),
      learn:        chk('💡 Learned Something'),
      eat:          chk('🥗 Ate Healthy'),
      workout:      chk('🏋️ Workout'),
      workoutType:  txt('Workout Type'),
      coldShower:   chk('🚿 Cold Shower'),
      weedFree:     chk('🚫 Weed-Free'),
      phone:        chk('📵 Phone Controlled'),
      noPorn:       chk('🚫 No Porn'),
      value:        chk('💼 Created Value'),
      wakeTime:     txt('Wake Time'),
      notes:        txt('Notes'),
      pagesCode:    num('📖 Pages Read (Code)'),
      screenTime:   num('📱 Screen Time (hrs)'),
    }
  });
};
