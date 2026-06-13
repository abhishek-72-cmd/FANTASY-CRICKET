const cron = require('node-cron');
const db = require('../db/db');

const {
  save22PlayersService
} = require('../../controllers/admin/players/save22players');

cron.schedule('*/5 * * * *', async () => {

  try {

    const [[settings]] = await db.query(`
      SELECT auto_mode
      FROM automation_settings
      LIMIT 1
    `);

    if (!settings?.auto_mode) {
      console.log('Automation OFF');
      return;
    }

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
      `Found ${matches.length} upcoming matches`
    );

    for (const match of matches) {

      try {

        const [existing] = await db.query(`
          SELECT 1
          FROM 22_match_players
          WHERE match_id = ?
          LIMIT 1
        `,[match.id]);

        if(existing.length > 0){
          console.log(
            `Lineup already exists for match ${match.id}`
          );
          continue;
        }

        const savedCount =
          await save22PlayersService(match.id);

        if(!savedCount){
          console.log(
            `Lineup not available yet for ${match.id}`
          );
          continue;
        }

        const [[validation]] = await db.query(`
          SELECT COUNT(*) AS totalPlayers
          FROM 22_match_players
          WHERE match_id=?
        `,[match.id]);

        if(validation.totalPlayers < 22){

          console.log(
            `Incomplete lineup for ${match.id}`
          );

          continue;
        }

        console.log(
          `Final lineup saved for ${match.id}`
        );

        // NEXT STEP
        await generateCredits(match.id);

        await activateMatchAutomation(match.id);

        // await openContests(match.id);

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
      'Lineup cron failed',
      err.message
    );

  }

});