// // Finished Match
// // ↓
// // Events Missing
// // ↓
// // Fetch Events

// // Points Missing
// // ↓
// // Calculate Points





// const cron = require('node-cron');
// const db = require('../db/db');

// const {
//   fetchMatchEventsForMatch
// } = require('../../controllers/admin/matches/events/matchEventsPerBall');

// const {
//   calculateAllPointsService
// } = require('../../controllers/admin/pointCalculation/calculateAllPoints');

// cron.schedule('*/5 * * * *', async () => {

//   try {

//     console.log(
//       'Running post match processor'
//     );

//     const [matches] = await db.query(`
//       SELECT id
//       FROM fixtures
//        WHERE status IN (
//       'Finished',
//       'finished'
//        )
//       AND starting_at >=
//       DATE_SUB(NOW(), INTERVAL 7 DAY)
//       ORDER BY starting_at DESC
//     `);

//     for(const match of matches){

//       try{

//         const matchId = match.id;

//         /*
//         ===================================
//         STEP 1
//         MATCH EVENTS
//         ===================================
//         */

//         const [[eventsExist]] =
//           await db.query(`
//             SELECT 1
//             FROM match_events
//             WHERE match_id=?
//             LIMIT 1
//           `,
//           [matchId]);

//         if(!eventsExist){

//           try{

//             await db.query(`
//               INSERT INTO automation_logs
//               (
//                 match_id,
//                 action,
//                 status,
//                 process_key,
//                 message
//               )
//               VALUES(
//                 ?,?,?,?,?
//               )
//             `,
//             [
//               matchId,
//               'FETCH_EVENTS',
//               'PROCESSING',
//               `events_${matchId}`,
//               'Fetching match events'
//             ]);

//           }
//           catch(err){

//             if(
//               err.code ===
//               'ER_DUP_ENTRY'
//             ){
//               continue;
//             }

//             throw err;
//           }

//           await fetchMatchEventsForMatch(
//             matchId
//           );

//           await db.query(`
//             UPDATE automation_logs
//             SET
//               status='SUCCESS',
//               message='Events fetched'
//             WHERE process_key=?
//           `,
//           [
//             `events_${matchId}`
//           ]);

//         }

//         /*
//         ===================================
//         STEP 2
//         PLAYER POINTS
//         ===================================
//         */

//         const [[pointsExist]] =
//           await db.query(`
//             SELECT 1
//             FROM player_match_points
//             WHERE match_id=?
//             LIMIT 1
//           `,
//           [matchId]);

//         if(!pointsExist){

//           try{

//             await db.query(`
//               INSERT INTO automation_logs
//               (
//                 match_id,
//                 action,
//                 status,
//                 process_key,
//                 message
//               )
//               VALUES(
//                 ?,?,?,?,?
//               )
//             `,
//             [
//               matchId,
//               'CALCULATE_POINTS',
//               'PROCESSING',
//               `points_${matchId}`,
//               'Calculating points'
//             ]);

//           }
//           catch(err){

//             if(
//               err.code ===
//               'ER_DUP_ENTRY'
//             ){
//               continue;
//             }

//             throw err;
//           }

//           await calculateAllPointsService(
//             matchId
//           );

//           await db.query(`
//             UPDATE automation_logs
//             SET
//               status='SUCCESS',
//               message='Points calculated'
//             WHERE process_key=?
//           `,
//           [
//             `points_${matchId}`
//           ]);

//         }

//       }
//       catch(err){

//         console.error(
//           `Match ${match.id}`,
//           err.message
//         );

//       }

//     }

//   }
//   catch(err){

//     console.error(
//       'Post Match Processor Failed',
//       err.message
//     );

//   }

// });








// Finished Match
// ↓
// Events Missing
// ↓
// Fetch Events


// Points Missing
// ↓
// Calculate Points






const cron = require('node-cron');
const db = require('../db/db');


const {
  fetchMatchEventsForMatch
} = require('../../controllers/admin/matches/events/matchEventsPerBall');

const {
  calculateAllPointsService
} = require('../../controllers/admin/pointCalculation/calculateAllPoints');

cron.schedule('*/5 * * * *', async () => {
  try {
    console.log(
      '╔════════════════════════════════════════════════════════╗'
    );
    console.log(
      '║  🔄 Running post match processor                       ║'
    );
    console.log(
      '╚════════════════════════════════════════════════════════╝'
    );

    const [matches] = await db.query(`
      SELECT id
      FROM fixtures
       WHERE status IN (
      'Finished',
      'finished'
       )
      AND starting_at >=
      DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY starting_at DESC
    `);

    console.log(
      `📋 Found ${matches.length} finished matches to process (last 7 days)`
    );

    if (matches.length === 0) {
      console.log(
        '✅ No finished matches found. Skipping.'
      );
      console.log(
        '╔════════════════════════════════════════════════════════╗'
      );
      console.log(
        '║  ✅ Post match processor completed (no matches)        ║'
      );
      console.log(
        '╚════════════════════════════════════════════════════════╝'
      );
      return;
    }

    for(const match of matches){

      try{
        const matchId = match.id;
        console.log(
          `\n──────────────────────────────────────────────────────────`
        );
        console.log(
          `🏏 Processing Match #${matchId}`
        );
        console.log(
          `──────────────────────────────────────────────────────────`
        );

        /*
        ===================================
        STEP 1
        MATCH EVENTS
        ===================================
        */
        console.log(
          `🔍 STEP 1: Checking if events exist for match ${matchId}`
        );

        const [[eventsExist]] =
          await db.query(`
            SELECT 1
            FROM match_events
            WHERE match_id=?
            LIMIT 1
          `,
          [matchId]);

        if(!eventsExist){

          console.log(
            `⚠️  Events NOT found for match ${matchId}. Starting fetch...`
          );

          try{

            await db.query(`
              INSERT INTO automation_logs
              (
                match_id,
                action,
                status,
                process_key,
                message
              )
              VALUES(
                ?,?,?,?,?
              )
            `,
            [
              matchId,
              'FETCH_EVENTS',
              'PROCESSING',
              `events_${matchId}`,
              'Fetching match events'
            ]);
            console.log(
              `📝 Logged automation_log: FETCH_EVENTS (PROCESSING)`
            );

          }
          catch(err){


            if(
              err.code ===
              'ER_DUP_ENTRY'
            ){
              console.log(
                `⚠️  Duplicate log entry exists for match ${matchId}, continuing...`
              );
              continue;
            }
            throw err;
          }

          console.log(
            `📥 Calling fetchMatchEventsForMatch(${matchId})...`
          );

          await fetchMatchEventsForMatch(
            matchId
          );

          console.log(
            `✅ Events fetched successfully for match ${matchId}`
          );

          await db.query(`
            UPDATE automation_logs
            SET
              status='SUCCESS',
              message='Events fetched'
            WHERE process_key=?
          `,
          [
            `events_${matchId}`
          ]);

          console.log(
            `📝 Updated automation_log: FETCH_EVENTS (SUCCESS)`
          );

        } else {
          console.log(
            `✅ Events already exist for match ${matchId}, skipping...`
          );
        }
        /*
        ===================================
        STEP 2
        PLAYER POINTS
        ===================================
        */


        console.log(
          `\n🔍 STEP 2: Checking if points exist for match ${matchId}`
        );
        const [[pointsExist]] =
          await db.query(`
            SELECT 1
            FROM player_match_points
            WHERE match_id=?
            LIMIT 1
          `,
          [matchId]);
        if(!pointsExist){
          console.log(
            `⚠️  Points NOT found for match ${matchId}. Starting calculation...`
          );
          try{
            await db.query(`
              INSERT INTO automation_logs
              (
                match_id,
                action,
                status,
                process_key,
                message
              )
              VALUES(
                ?,?,?,?,?
              )
            `,
            [
              matchId,
              'CALCULATE_POINTS',
              'PROCESSING',
              `points_${matchId}`,
              'Calculating points'
            ]);

            console.log(
              `📝 Logged automation_log: CALCULATE_POINTS (PROCESSING)`
            );
          }
          catch(err){
            if(
              err.code ===
              'ER_DUP_ENTRY'
            ){
              console.log(
                `⚠️  Duplicate log entry exists for match ${matchId}, continuing...`
              );
              continue;
            }
            throw err;
          }
          console.log(
            `📊 Calling calculateAllPointsService(${matchId})...`
          );
          await calculateAllPointsService(
            matchId
          );
          console.log(
            `✅ Points calculated successfully for match ${matchId}`
          );
          await db.query(`
            UPDATE automation_logs
            SET
              status='SUCCESS',
              message='Points calculated'
            WHERE process_key=?
          `,
          [
            `points_${matchId}`
          ]);

          console.log(
            `📝 Updated automation_log: CALCULATE_POINTS (SUCCESS)`
          );

        } else {
          console.log(
            `✅ Points already exist for match ${matchId}, skipping...`
          );

        }
        console.log(
          `\n✅ Match #${matchId} processing completed`
        );
      }
      catch(err){


        console.error(
          `❌ Match ${match.id} failed:`,
          err.message
        );
      }
    }
    console.log(
      '\n╔════════════════════════════════════════════════════════╗'
    );
    console.log(
      '║  ✅ Post match processor completed successfully        ║'
    );
    console.log(
      '╚════════════════════════════════════════════════════════╝'
    );

  }
  catch(err){
    console.error(
      '❌ Post Match Processor Failed:',
      err.message
    );
    }
  });