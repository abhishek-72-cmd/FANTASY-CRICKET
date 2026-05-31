const cron = require('node-cron');
const db = require('../db/db');
const MatchEvents = require('../../controllers/admin/matches/events/matchEventsPerBall');
const {fetchMatchEventsForMatch } =  require('../../controllers/admin/matches/events/matchEventsPerBall');



// this fetch the matches whoes status is finished and fetches the fixtures for last 6 days for the finished matches 

// cron: runs at 3am & 3pm server time  '0 3,15 * * *

//*/480 * * * * *
// 8 mins 3 mins after update fixture status 



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



// this fetching the all the matches whoes match status is finished and run the fetchMatchesEventForMatches // this should be done for 

//cron job with 30 secs 

// console.log ('\\*cron schuduled for fetching match events whoes status is finished*//')

// cron.schedule('*/30 * * * * *', async () => {
//   console.log(`🕒 Running matchEvents cron at ${new Date().toISOString()}`);
//   const [matches] = await db.query(
//     'SELECT id FROM fixtures WHERE status = "Finished"'
//   );

//   for (const m of matches) {
//     try {
//       await fetchMatchEventsForMatch(m.id);
//     } catch (err) {
//       console.error(` Error processing match ${m.id}:`, err.message);
//     }
//   }
// });