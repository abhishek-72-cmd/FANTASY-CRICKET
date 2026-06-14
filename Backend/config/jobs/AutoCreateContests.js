const cron = require('node-cron');
const db = require('../db/db');

cron.schedule('15 */6 * * *', async () => {

  try {

    const [[settings]] = await db.query(`
      SELECT auto_mode
      FROM automation_settings
      LIMIT 1
    `);

    if (!settings?.auto_mode) {
      console.log(
        'Contest automation disabled'
      );
      return;
    }

    const [fixtures] = await db.query(`
      SELECT
        f.id,
        lt.name AS local_team,
        vt.name AS visitor_team
      FROM fixtures f
      LEFT JOIN teams lt
        ON lt.id = f.localteam_id
      LEFT JOIN teams vt
        ON vt.id = f.visitorteam_id
      WHERE f.status='NS'
      AND f.starting_at >= NOW()
      AND f.starting_at <=
          DATE_ADD(NOW(), INTERVAL 14 DAY)
    `);

    for(const fixture of fixtures){

      const [[existing]] =
        await db.query(`
          SELECT COUNT(*) total
          FROM contests
          WHERE match_id=?
        `,
        [fixture.id]);

      if(existing.total > 0){
        continue;
      }

      const matchTitle =
        `${fixture.local_team} vs ${fixture.visitor_team}`;

      await db.query(`
        INSERT INTO contests(
          match_id,
          match_title,
          prize_pool,
          buy_in,
          entry_fee,
          min_players,
          max_players,
          winner_type,
           registration_opens,
           visible_until
        )
        VALUES(
          ?,?,?,?,?,?,?,?,?,?
        )
      `,
      [
        fixture.id,
        matchTitle,
        900,
        10,
        10,
        2,
        100,
        'top_3',
          null,
      null
      ]);

      await db.query(`
        INSERT INTO contests(
          match_id,
          match_title,
          prize_pool,
          buy_in,
          entry_fee,
          min_players,
          max_players,
          winner_type,
          registration_opens,
          visible_until
        )
        VALUES(
          ?,?,?,?,?,?,?,?,?,?
        )
      `,
      [
        fixture.id,
        matchTitle,
        2700,
        30,
        30,
        2,
        100,
        'top_3',
        null,
        null
      ]);

      console.log(
        `Auto contests created for ${fixture.id}`
      );

    }

  }
  catch(err){

    console.error(
      'Contest automation failed',
      err.message
    );

  }

});