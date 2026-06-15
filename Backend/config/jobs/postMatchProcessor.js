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


let isRunning = false;


cron.schedule('*/5 * * * *', async () => {

  if(isRunning){
    console.log('⏳ Previous post-match process still running. Skipping...');
    return;
  }

  isRunning = true;

  try {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  🔄 Running post match processor                       ║');
    console.log('╚════════════════════════════════════════════════════════╝');


    // ✅ Improvement: Use status='Finished' instead of LOWER(status) for index efficiency
    const [matches] = await db.query(`
      SELECT id
      FROM fixtures
      WHERE status='Finished'
      AND starting_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY starting_at DESC
    `);


    console.log(`📋 Found ${matches.length} finished matches to process (last 7 days)`);


    if (matches.length === 0) {
      console.log('✅ No finished matches found. Skipping.');
      console.log('╔════════════════════════════════════════════════════════╗');
      console.log('║  ✅ Post match processor completed (no matches)        ║');
      console.log('╚════════════════════════════════════════════════════════╝');
      return;
    }


    for(const match of matches){


      try{
        const matchId = match.id;
        console.log(`\n──────────────────────────────────────────────────────────`);
        console.log(`🏏 Processing Match #${matchId}`);
        console.log(`──────────────────────────────────────────────────────────`);


        // STEP 1: MATCH EVENTS
        console.log(`🔍 STEP 1: Checking if events exist for match ${matchId}`);


        const [[eventsExist]] = await db.query(`
          SELECT 1 FROM match_events WHERE match_id=? LIMIT 1
        `, [matchId]);


        if(!eventsExist){


          console.log(`⚠️  Events NOT found for match ${matchId}. Starting fetch...`);


          let shouldFetch = true;


          try{
            await db.query(`
              INSERT INTO automation_logs (match_id, action, status, process_key, message)
              VALUES (?, ?, ?, ?, ?)
            `, [matchId, 'FETCH_EVENTS', 'PROCESSING', `events_${matchId}`, 'Fetching match events']);
            console.log(`📝 Logged automation_log: FETCH_EVENTS (PROCESSING)`);


          }
          catch(err){


            if(err.code === 'ER_DUP_ENTRY'){


              const [[log]] = await db.query(`
                SELECT status, created_at
                FROM automation_logs
                WHERE process_key=?
              `, [`events_${matchId}`]);


// ✅ Issue 3 Fix: Check if lock is stale (older than 15 minutes)
if(
  log?.status === 'SUCCESS' &&
  eventsExist
){


  console.log(`✅ Events already processed`);
  shouldFetch = false;


} else if (
  log?.status === 'PROCESSING' &&
  log?.created_at
){


  // Calculate age in minutes
  const ageMinutes = Math.floor(
    (new Date() - new Date(log.created_at)) / 60000
  );


  if(ageMinutes < 15){


    console.log(`⏳ Events processing in progress (age: ${ageMinutes} min). Skipping...`);
    shouldFetch = false;


  } else {


    console.log(`♻️ Stale lock found (age: ${ageMinutes} min). Removing...`);
    await db.query(`DELETE FROM automation_logs WHERE process_key=?`, [`events_${matchId}`]);
    console.log(`♻️ Stale lock removed. Will retry next cron cycle`);
    continue; // Skip to next match
  }


} else {


  console.log(`♻️ Previous attempt failed. Retrying...`);
  await db.query(`DELETE FROM automation_logs WHERE process_key=?`, [`events_${matchId}`]);
  console.log(`♻️ Stale lock removed. Will retry next cron cycle`);
  continue; // Skip to next match
}


            } else {


              throw err;


            }
          }


          if(shouldFetch){


// ✅ Issue 1 Fix: Wrap fetch in its own try/catch for FAILED logging
try{


  console.log(`📥 Calling fetchMatchEventsForMatch(${matchId})...`);
  await fetchMatchEventsForMatch(matchId);


  const [[eventValidation]] = await db.query(`
    SELECT 1
    FROM match_events
    WHERE match_id=?
    LIMIT 1
  `, [matchId]);


  if(!eventValidation){
    throw new Error('No match events inserted');
  }


  await db.query(`
    UPDATE automation_logs
    SET
      status='SUCCESS',
      message='Events fetched'
    WHERE process_key=?
  `, [`events_${matchId}`]);


  console.log(`✅ Events fetched successfully for match ${matchId}`);
  console.log(`📝 Updated automation_log: FETCH_EVENTS (SUCCESS)`);


}
catch(err){


  console.error(`❌ Event fetch failed for match ${matchId}`);


  await db.query(`
    UPDATE automation_logs
    SET
      status='FAILED',
      message=?
    WHERE process_key=?
  `,
  [
    err.message,
    `events_${matchId}`
  ]);


  throw err;
}


          }


        } else {
          console.log(`✅ Events already exist for match ${matchId}, skipping...`);
        }


        // STEP 2: PLAYER POINTS
        console.log(`\n🔍 STEP 2: Checking if points exist for match ${matchId}`);


        const [[pointsExist]] = await db.query(`
          SELECT 1 FROM player_match_points WHERE match_id=? LIMIT 1
        `, [matchId]);


        if(!pointsExist){


          console.log(`⚠️  Points NOT found for match ${matchId}. Starting calculation...`);


          let shouldCalculate = true;


          try{
            await db.query(`
              INSERT INTO automation_logs (match_id, action, status, process_key, message)
              VALUES (?, ?, ?, ?, ?)
            `, [matchId, 'CALCULATE_POINTS', 'PROCESSING', `points_${matchId}`, 'Calculating points']);
            console.log(`📝 Logged automation_log: CALCULATE_POINTS (PROCESSING)`);


          }
          catch(err){


            if(err.code === 'ER_DUP_ENTRY'){


              const [[log]] = await db.query(`
                SELECT status, created_at
                FROM automation_logs
                WHERE process_key=?
              `, [`points_${matchId}`]);


// ✅ Issue 3 Fix: Check if lock is stale (older than 15 minutes)
if(
  log?.status === 'SUCCESS' &&
  pointsExist
){


  console.log(`✅ Points already processed`);
  shouldCalculate = false;


} else if (
  log?.status === 'PROCESSING' &&
  log?.created_at
){


  // Calculate age in minutes
  const ageMinutes = Math.floor(
    (new Date() - new Date(log.created_at)) / 60000
  );


  if(ageMinutes < 15){


    console.log(`⏳ Points calculation in progress (age: ${ageMinutes} min). Skipping...`);
    shouldCalculate = false;


  } else {


    console.log(`♻️ Stale lock found (age: ${ageMinutes} min). Removing...`);
    await db.query(`DELETE FROM automation_logs WHERE process_key=?`, [`points_${matchId}`]);
    console.log(`♻️ Stale lock removed. Will retry next cron cycle`);
    continue; // Skip to next match
  }


} else {


  console.log(`♻️ Previous attempt failed. Retrying...`);
  await db.query(`DELETE FROM automation_logs WHERE process_key=?`, [`points_${matchId}`]);
  console.log(`♻️ Stale lock removed. Will retry next cron cycle`);
  continue; // Skip to next match
}


            } else {


              throw err;


            }
          }


          if(shouldCalculate){


// ✅ Issue 2 Fix: Wrap calculate in its own try/catch for FAILED logging
try{


  console.log(`📊 Calling calculateAllPointsService(${matchId})...`);


  await calculateAllPointsService(matchId);


  const [[validation]] = await db.query(`
    SELECT COUNT(*) total FROM player_match_points WHERE match_id=?
  `, [matchId]);


  if(validation.total === 0){
    throw new Error('Points not generated');
  }


  await db.query(`
    UPDATE automation_logs
    SET
      status='SUCCESS',
      message='Points calculated'
    WHERE process_key=?
  `, [`points_${matchId}`]);


  console.log(`✅ Points calculated successfully for match ${matchId}`);
  console.log(`📝 Updated automation_log: CALCULATE_POINTS (SUCCESS)`);


}
catch(err){


  console.error(`❌ Points calculation failed for match ${matchId}`);


  await db.query(`
    UPDATE automation_logs
    SET
      status='FAILED',
      message=?
    WHERE process_key=?
  `,
  [
    err.message,
    `points_${matchId}`
  ]);


  throw err;
}


          }


        } else {
          console.log(`✅ Points already exist for match ${matchId}, skipping...`);
        }


        console.log(`\n✅ Match #${matchId} processing completed`);


      }
      catch(err){
        console.error(`❌ Match ${match.id} failed:`, err.message);
      }
    }


    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  ✅ Post match processor completed successfully        ║');
    console.log('╚════════════════════════════════════════════════════════╝');


  }
  catch(err){
    console.error('❌ Post Match Processor Failed:', err.message);
  }
  finally{
    isRunning = false;
  }
});