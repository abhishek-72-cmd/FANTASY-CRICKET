// const axios = require('axios');
// const db = require('../db/db');
// const cron = require('node-cron');

// // fetches the NS matches form the fixtures and update the status of the match if it is finished or not 
// // match status will be updated beyond 5 days from currentdate 


// const API_TOKEN = process.env.CRICKET_API_KEY;

// const updateStatuses = async () => {
//   console.log ('||| updating fixture status |||')
//   console.log(`[${new Date().toISOString()}] Checking fixture statuses...`);

//   const [fixtures] = await db.query(`
//     SELECT id 
//     FROM fixtures 
//     WHERE 
//       status IN ('NS', 'LIVE')
//       AND starting_at >= DATE_SUB(CURDATE(), INTERVAL 5 DAY)
//       AND starting_at <= CURDATE()
//     ORDER BY starting_at ASC
//   `);

//   console.log(` Found ${fixtures.length} fixtures to check.`);
 
//   let updated = 0;

//   for (const fixture of fixtures) {
//     try {
//       const { data } = await axios.get(
//         `https://cricket.sportmonks.com/api/v2.0/fixtures/${fixture.id}`,
//         { params: { api_token: API_TOKEN } }
//       );

//       if (!data?.data) continue;

//       await db.query(`
//         UPDATE fixtures
//         SET status = ?, live = ?
//         WHERE id = ?
//       `, [
//         data.data.status,
//         data.data.live ? 1 : 0,
//         fixture.id
//       ]);

//       console.log(` Fixture ${fixture.id} updated to status: ${data.data.status}`);
//       updated++;

//     } catch (err) {
//       console.error(` Error updating fixture ${fixture.id}:`, err.message);
//       if (err.response?.status === 429) {
//         console.error(`Rate limit hit. Stopping.`);
//         break;
//       }
//     }
//   }
//   console.log(` Fixtures update completed. Updated: ${updated}`);
// };

// // Run **once daily at 01:00 UTC**
// // 0 1 * * *


// // */480 * * * * *
// // every hour after run updateFixtures  
// // cron.schedule('0 * * * *', async () => {
// //   console.log('🕒 Scheduled fixture status update started…');
// //   await updateStatuses();
// // });

// // 30 sec timer

// // cron.schedule('*/30 * * * * *', async () => {
// //   console.log(' Running scheduled fixture status update...');
// //   await updateStatuses();
// // });


// module.exports = updateStatuses;



const axios = require('axios');
const db = require('../db/db');

const API_TOKEN = process.env.CRICKET_API_KEY;

async function updateFixtureStatuses(whereClause, label) {

  console.log(`=== ${label} ===`);

  const [fixtures] = await db.query(`
      SELECT id,status
      FROM fixtures
      WHERE ${whereClause}
      ORDER BY starting_at ASC
  `);

  console.log(`Found ${fixtures.length} fixtures`);

  for (const fixture of fixtures) {

    try {

      const { data } = await axios.get(
        `https://cricket.sportmonks.com/api/v2.0/fixtures/${fixture.id}`,
        {
          params: {
            api_token: API_TOKEN
          },
          timeout: 15000
        }
      );

      if (!data?.data) continue;

      const newStatus = data.data.status;
      const live = data.data.live ? 1 : 0;

      if (
        fixture.status !== newStatus ||
        live !== 0
      ) {

        await db.query(`
          UPDATE fixtures
          SET
            status=?,
            live=?,
            updated_at=NOW()
          WHERE id=?
        `,
        [
          newStatus,
          live,
          fixture.id
        ]);

        console.log(
          `Fixture ${fixture.id}: ${fixture.status} -> ${newStatus}`
        );

      }

    } catch (err) {

      console.error(
        `Fixture ${fixture.id}`,
        err.response?.data || err.message
      );

      if (err.response?.status === 429) {
        break;
      }}}
}

module.exports = updateFixtureStatuses;