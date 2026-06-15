

// Validate credits
// Validate contests
// Activate match
// Open contests



const db = require('../../../config/db/db');

const activateMatchAutomation =
async (matchId) => {

  const [[contest]] =
    await db.query(`
      SELECT id
      FROM contests
      WHERE match_id=?
      LIMIT 1
    `,
    [matchId]);

  if(!contest){
    throw new Error(
      'Contest not available'
    );
  }

  const [[credits]] =
    await db.query(`
SELECT COUNT(*) total
FROM players p
INNER JOIN fixtures f
ON f.id = ?
WHERE p.season_id = f.season_id
AND p.team_id IN (
  f.localteam_id,
  f.visitorteam_id
)
AND p.credit_points > 0
`,
[matchId]);

  if(credits.total === 0){
    throw new Error(
      'Credits missing'
    );
  }

  await db.query(`
    UPDATE fixtures
    SET is_activated=1
    WHERE id=?
  `,
  [matchId]);

  const [[fixture]] =
    await db.query(`
      SELECT starting_at
      FROM fixtures
      WHERE id=?
    `,
    [matchId]);

  await db.query(`
    UPDATE contests
    SET
      registration_opens = NOW(),
      visible_until = ?
    WHERE match_id=?
  `,
  [
    fixture.starting_at,
    matchId
  ]);

  return true;
};

module.exports =
  activateMatchAutomation;