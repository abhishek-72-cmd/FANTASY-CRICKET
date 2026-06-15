// const cron = require('node-cron');
// const db = require('../db/db');

// const {
//   save22PlayersService
// } = require('../../controllers/admin/players/save22players');

// cron.schedule('*/5 * * * *', async () => {

//   try {

//     const [[settings]] = await db.query(`
//       SELECT auto_mode
//       FROM automation_settings
//       LIMIT 1
//     `);

//     if (!settings?.auto_mode) {
//       console.log('Automation OFF');
//       return;
//     }

//     const [matches] = await db.query(`
//       SELECT id, league_id
//       FROM fixtures
//       WHERE status='NS'
//       AND is_activated = 0
//       AND starting_at BETWEEN NOW()
//       AND DATE_ADD(NOW(), INTERVAL 1 HOUR)
//       ORDER BY starting_at ASC
//     `);

//     console.log(
//       `Found ${matches.length} upcoming matches`
//     );

//     for (const match of matches) {

//       try {

//         const [existing] = await db.query(`
//           SELECT 1
//           FROM 22_match_players
//           WHERE match_id = ?
//           LIMIT 1
//         `,[match.id]);

//         if(existing.length > 0){
//           console.log(
//             `Lineup already exists for match ${match.id}`
//           );
//           continue;
//         }

//         const savedCount =
//           await save22PlayersService(match.id);

//         if(!savedCount){
//           console.log(
//             `Lineup not available yet for ${match.id}`
//           );
//           continue;
//         }

//         const [[validation]] = await db.query(`
//           SELECT COUNT(*) AS totalPlayers
//           FROM 22_match_players
//           WHERE match_id=?
//         `,[match.id]);

//         if(validation.totalPlayers < 22){

//           console.log(
//             `Incomplete lineup for ${match.id}`
//           );

//           continue;
//         }

//         console.log(
//           `Final lineup saved for ${match.id}`
//         );

//         // NEXT STEP
//         await generateCredits(match.id);

//         await activateMatchAutomation(match.id);

//         // await openContests(match.id);

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
//       'Lineup cron failed',
//       err.message
//     );

//   }

// });



const cron = require('node-cron');
const db = require('../db/db');


const {
  save22PlayersService
} = require('../../controllers/admin/players/save22players');


cron.schedule('*/5 * * * *', async () => {
  try {
    console.log(
      '╔════════════════════════════════════════════════════════╗'
    );
    console.log(
      '║  🔄 Running lineup cron (every 5 mins)                 ║'
    );
    console.log(
      '╚════════════════════════════════════════════════════════╝'
    );
    const [[settings]] = await db.query(`
      SELECT auto_mode
      FROM automation_settings
      LIMIT 1
    `);


    console.log(
      `🔧 Automation settings: auto_mode = ${settings?.auto_mode}`
    );


    if (!settings?.auto_mode) {
      console.log(
        '❌ Automation OFF. Skipping lineup processing.'
      );
      console.log(
        '╔════════════════════════════════════════════════════════╗'
      );
      console.log(
        '║  ✅ Lineup cron completed (automation disabled)        ║'
      );
      console.log(
        '╚════════════════════════════════════════════════════════╝'
      );
      return;
    }
    console.log(
      '✅ Automation ON. Fetching upcoming matches...'
    );
    const [matches] = await db.query(`
      SELECT id, league_id
      FROM fixtures
      WHERE status='NS'
      AND is_activated = 0
      AND starting_at BETWEEN NOW()
      AND DATE_ADD(NOW(), INTERVAL 1 HOUR)
      ORDER BY starting_at ASC
    `);
    console.log(
      `📋 Found ${matches.length} upcoming matches (NS, not activated, starting in 1 hour)`
    );

    if (matches.length === 0) {
      console.log(
        '✅ No upcoming matches found in the next 1 hour.'
      );
      console.log(
        '╔════════════════════════════════════════════════════════╗'
      );
      console.log(
        '║  ✅ Lineup cron completed (no matches)                 ║'
      );
      console.log(
        '╚════════════════════════════════════════════════════════╝'
      );
      return;
    }

    for (const match of matches) {
      try {
        console.log(
          `\n──────────────────────────────────────────────────────────`
        );
        console.log(
          `🏏 Processing Match #${match.id} (League: ${match.league_id})`
        );
        console.log(
          `──────────────────────────────────────────────────────────`
        );
        console.log(
          `🔍 STEP 1: Checking if 22_players lineup exists for match ${match.id}`
        );
        const [existing] = await db.query(`
          SELECT 1
          FROM 22_match_players
          WHERE match_id = ?
          LIMIT 1
        `, [match.id]);
        if(existing.length > 0){
          console.log(
            `✅ Lineup already exists for match ${match.id}, skipping...`
          );
          continue;
        }
        console.log(
          `⚠️  Lineup NOT found for match ${match.id}. Fetching from API...`
        );
        console.log(
          `📥 STEP 2: Calling save22PlayersService(${match.id})...`
        );

        const savedCount =
          await save22PlayersService(match.id);
        if(!savedCount){
          console.log(
            `❌ Lineup not available yet for ${match.id} (API returned 0 players)`
          );
          console.log(
            `⏳ Will retry in next cron cycle (5 mins)`
          );
          continue;
        }
        console.log(
          `✅ Successfully saved ${savedCount} players for match ${match.id}`
        );

        console.log(
          `🔍 STEP 3: Validating lineup (checking if 22 players exist)...`
        );
        const [[validation]] = await db.query(`
          SELECT COUNT(*) AS totalPlayers
          FROM 22_match_players
          WHERE match_id=?
        `, [match.id]);
        console.log(
          `📊 Validation result: ${validation.totalPlayers} players found`
        );

        if(validation.totalPlayers < 22){
          console.log(
            `❌ Incomplete lineup for ${match.id} (only ${validation.totalPlayers} of 22 players)`
          );
          console.log(
            `⏳ Will retry in next cron cycle (5 mins)`
          );
          continue;
        }

        console.log(
          `✅ Full lineup validated: 22 players for match ${match.id}`
        );

        console.log(
          `🎯 STEP 4: Lineup complete. Finalizing match automation...`
        );

        console.log(
          `📝 Calling generateCredits(${match.id})...`
        );

        // // NEXT STEP
        // await generateCredits(match.id);
        // console.log(
        //   `✅ Credits generated for match ${match.id}`
        // );
        // console.log(
        //   `📝 Calling activateMatchAutomation(${match.id})...`
        // );

        // await activateMatchAutomation(match.id);
        // console.log(
        //   `✅ Match automation activated for match ${match.id}`
        // );

        // Uncomment if needed:
        // console.log(`📝 Calling openContests(${match.id})...`);
        // await openContests(match.id);
        // console.log(`✅ Contests opened for match ${match.id}`);

        console.log(
          `\n✅ Match #${match.id} lineup processing completed successfully`
        );
      }
      catch(err){
        console.error(
          `❌ Match ${match.id} failed:`,
          err.message
        );
        console.error(
          `🔍 Error details:`,
          err
        );
      }
    }
    console.log(
      '\n╔════════════════════════════════════════════════════════╗'
    );
    console.log(
      '║  ✅ Lineup cron completed successfully                 ║'
    );
    console.log(
      '╚════════════════════════════════════════════════════════╝'
    );
  }
  catch(err){
    console.error(
      '❌ Lineup cron failed:',
      err.message
    );
    console.error(
      '🔍 Error details:',
      err
    );
  }
});