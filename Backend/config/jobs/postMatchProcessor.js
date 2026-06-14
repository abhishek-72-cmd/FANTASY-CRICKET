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
      'Running post match processor'
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

    for(const match of matches){

      try{

        const matchId = match.id;

        /*
        ===================================
        STEP 1
        MATCH EVENTS
        ===================================
        */

        const [[eventsExist]] =
          await db.query(`
            SELECT 1
            FROM match_events
            WHERE match_id=?
            LIMIT 1
          `,
          [matchId]);

        if(!eventsExist){

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

          }
          catch(err){

            if(
              err.code ===
              'ER_DUP_ENTRY'
            ){
              continue;
            }

            throw err;
          }

          await fetchMatchEventsForMatch(
            matchId
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

        }

        /*
        ===================================
        STEP 2
        PLAYER POINTS
        ===================================
        */

        const [[pointsExist]] =
          await db.query(`
            SELECT 1
            FROM player_match_points
            WHERE match_id=?
            LIMIT 1
          `,
          [matchId]);

        if(!pointsExist){

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

          }
          catch(err){

            if(
              err.code ===
              'ER_DUP_ENTRY'
            ){
              continue;
            }

            throw err;
          }

          await calculateAllPointsService(
            matchId
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

        }

      }
      catch(err){

        console.error(
          `Match ${match.id}`,
          err.message
        );

      }

    }

  }
  catch(err){

    console.error(
      'Post Match Processor Failed',
      err.message
    );

  }

});