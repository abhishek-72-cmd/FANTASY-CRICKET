const cron = require('node-cron');
const calculateAllPoints = require('../../controllers/admin/pointCalculation/calculateAllPoints');
const db = require('../db/db');


//  Every day at 3:30 AM server time.

// */30 * * * * *  each 30 secs 
// 30 3 * * * 3:30 AM 


// console.log('crown scheduled for point calculation ')

cron.schedule(' 30 3 * * * ', async () => { 
  console.log(`🕒 Running Points Calculation Cron at ${new Date().toISOString()}`);

  try {
    const [matches] = await db.query(`
      SELECT f.id
      FROM fixtures f
      WHERE f.status = 'finished'
      AND NOT EXISTS (
        SELECT 1 FROM player_match_points pmp WHERE pmp.match_id = f.id
      )
    `);

    for (const match of matches) {
      console.log(`📊 Calculating points for match ${match.id}`);
      await calculateAllPoints({ params: { matchId: match.id } }, {
        json: msg => console.log(`✅ ${msg.message}`),
        status: () => ({ json: err => console.error(err) })
      });
    }

    console.log(`🎯 Points calculation cron completed.`);
  } catch (err) {
    console.error(`❌ Error in Points Calculation Cron:`, err);
  }
});