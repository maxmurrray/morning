const fs = require('fs');
const path = require('path');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const configPath = path.join(process.cwd(), 'config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    // Pick today's article (rotate by day-of-year)
    const dayOfYear = Math.floor((Date.now() - new Date(config.startDate).getTime()) / 86400000);
    const article = config.articles[dayOfYear % config.articles.length];

    return res.json({
      targets: config.targets,
      tasks: config.tasks,
      books: config.books,
      article,
      week: config.week,
    });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
};
