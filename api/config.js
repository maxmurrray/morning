const fs = require('fs');
const path = require('path');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const configPath = path.join(process.cwd(), 'config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    const daysSinceStart = Math.max(0, Math.floor(
      (Date.now() - new Date(config.startDate).getTime()) / 86400000
    ));

    // Retainer ramp: 1h day1, 2h day2, 3h day3, 4h day4, 5h+ cap
    const retainerHours = Math.min(5, daysSinceStart + 1);
    const retainerPlural = retainerHours === 1 ? '' : 's';

    // Inject retainer hours into task strings
    const tasks = JSON.parse(JSON.stringify(config.tasks)); // deep copy
    if (tasks.retainer) {
      tasks.retainer = tasks.retainer.map(t =>
        t.replace('{{retainer_hours}}', retainerHours)
         .replace('{{retainer_plural}}', retainerPlural)
      );
    }

    // Today's article
    const article = config.articles[daysSinceStart % config.articles.length];

    return res.json({
      targets: config.targets,
      tasks,
      books: config.books,
      article,
      week: config.week,
      retainerHours,
    });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
};
