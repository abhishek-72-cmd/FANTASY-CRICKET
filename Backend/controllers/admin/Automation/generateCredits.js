// Generate fantasy credits
// Update 22_match_players
// Update player_points_cache



// const db = require('../../../config/db/db');

// const generateCredits = async (matchId) => {

//   const [[fixture]] = await db.query(`
//     SELECT league_id
//     FROM fixtures
//     WHERE id=?
//   `,[matchId]);

//   if(!fixture){
//     throw new Error('Fixture not found');
//   }

//   const [players] = await db.query(`
//     SELECT
//       mp.player_id,
//       COALESCE(
//         ppc.last_known_points,
//         0
//       ) AS last_known_points
//     FROM 22_match_players mp
//     LEFT JOIN player_points_cache ppc
//       ON ppc.player_id = mp.player_id
//       AND ppc.league_id = mp.league_id
//     WHERE mp.match_id = ?
//     ORDER BY last_known_points DESC
//   `,[matchId]);

//   if(players.length < 22){
//     throw new Error(
//       '22 players not available'
//     );
//   }

//   const creditMap = [];

//   players.forEach((player,index)=>{

//     let credit = 6;

//     if(index < 2){
//       credit = 10;
//     }
//     else if(index < 6){
//       credit = 9;
//     }
//     else if(index < 12){
//       credit = 8;
//     }
//     else if(index < 18){
//       credit = 7;
//     }

//     creditMap.push({
//       playerId: player.player_id,
//       credit
//     });

//   });

//   for(const player of creditMap){

//     await db.query(`
//       UPDATE 22_match_players
//       SET credit_points=?
//       WHERE match_id=?
//       AND player_id=?
//     `,
//     [
//       player.credit,
//       matchId,
//       player.playerId
//     ]);

//     await db.query(`
//       UPDATE player_points_cache
//       SET last_known_credit_points=?
//       WHERE player_id=?
//       AND league_id=?
//     `,
//     [
//       player.credit,
//       player.playerId,
//       fixture.league_id
//     ]);

//   }

//   return true;
// };

// module.exports = generateCredits;






const db = require('../../../config/db/db');

const generateCredits = async (matchId) => {

  console.log(
    `🏏 Starting credit generation for match ${matchId}`
  );

  const [[fixture]] = await db.query(`
    SELECT
      league_id,
      season_id,
      localteam_id,
      visitorteam_id
    FROM fixtures
    WHERE id=?
  `,[matchId]);

  if(!fixture){
    throw new Error(
      'Fixture not found'
    );
  }

  const [players] = await db.query(`
    SELECT
      p.player_id,
      p.team_id,
      COALESCE(
        ppc.last_known_points,
        1
      ) AS rating
    FROM players p
    LEFT JOIN player_points_cache ppc
      ON p.player_id = ppc.player_id
      AND ppc.league_id = ?
    WHERE p.season_id = ?
    AND p.team_id IN (?,?)
    ORDER BY rating DESC
  `,
  [
    fixture.league_id,
    fixture.season_id,
    fixture.localteam_id,
    fixture.visitorteam_id
  ]);

  if(players.length === 0){
    throw new Error(
      'No tentative players found'
    );
  }

  console.log(
    `📋 Found ${players.length} tentative players`
  );

  const totalPlayers = players.length;

  const bucket1 =
    Math.ceil(totalPlayers * 0.25);

  const bucket2 =
    Math.ceil(totalPlayers * 0.50);

  const bucket3 =
    Math.ceil(totalPlayers * 0.75);

  let updatedCount = 0;

  for(let index=0;
      index<players.length;
      index++){

    const player =
      players[index];

    let credit = 7;

    if(index < bucket1){
      credit = 10;
    }
    else if(index < bucket2){
      credit = 9;
    }
    else if(index < bucket3){
      credit = 8;
    }

    await db.query(`
      UPDATE players
      SET credit_points=?
      WHERE player_id=?
    `,
    [
      credit,
      player.player_id
    ]);

    await db.query(`
      UPDATE player_points_cache
      SET last_known_credit_points=?
      WHERE player_id=?
      AND league_id=?
    `,
    [
      credit,
      player.player_id,
      fixture.league_id
    ]);

    updatedCount++;

    console.log(
      `✅ Player ${player.player_id} assigned ${credit} credits`
    );

  }

  console.log(
    `🎯 Credit generation completed for match ${matchId}`
  );

  console.log(
    `📊 Updated ${updatedCount} players`
  );

  return true;

};

module.exports = generateCredits;