const db = require('../db/db');

const Autocreatecontests = async (fixtureId) => {

  try {

    const [[fixture]] = await db.query(`
      SELECT
        f.id,
        lt.name AS local_team,
        vt.name AS visitor_team
      FROM fixtures f
      LEFT JOIN teams lt
        ON lt.id = f.localteam_id
      LEFT JOIN teams vt
        ON vt.id = f.visitorteam_id
      WHERE f.id = ?
      LIMIT 1
    `,[fixtureId]);

    if(!fixture){
      throw new Error(
        `Fixture ${fixtureId} not found`
      );
    }

    const [[existing]] =
      await db.query(`
        SELECT COUNT(*) total
        FROM contests
        WHERE match_id=?
      `,
      [fixtureId]);

    if(existing.total > 0){

      console.log(
        `✅ Contests already exist for ${fixtureId}`
      );

      return true;
    }

    const matchTitle =
      `${fixture.local_team} vs ${fixture.visitor_team}`;

    /*
    ₹10 Contest
    */

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
      fixtureId,
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

    /*
    ₹30 Contest
    */

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
      fixtureId,
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
      `🏆 Default contests created for fixture ${fixtureId}`
    );

    return true;

  }
  catch(err){

    console.error(
      `❌ Contest creation failed for ${fixtureId}`
    );

    console.error(
      err.message
    );

    throw err;
  }

};

module.exports = Autocreatecontests;