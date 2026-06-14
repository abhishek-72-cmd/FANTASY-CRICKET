const cron = require('node-cron');
const db = require('../db/db');
const MatchEvents = require('../../controllers/admin/matches/events/matchEventsPerBall');
const {fetchMatchEventsForMatch } =  require('../../controllers/admin/matches/events/matchEventsPerBall');



cron.schedule('0 4 * * *', async () => {
  console.log(` Running matchEvents cron at ${new Date().toISOString()}`);
  const [matches] = await db.query(
    'SELECT id FROM fixtures WHERE status = "Finished" AND starting_at >= DATE_SUB(NOW(), INTERVAL 6 DAY)'
  );

  for (const m of matches) {
    try {
      await fetchMatchEventsForMatch(m.id);
    } catch (err) {
      console.error(`❌ Error processing match ${m.id}:`, err.message);
    }
  }
});



