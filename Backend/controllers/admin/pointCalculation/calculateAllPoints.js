require('dotenv').config();
const db = require('../../../config/db/db');

const calculateAllPointsService = async (matchId) => {


  if (!matchId) {
  throw new Error(
    'matchId is required'
  );
}

  try {
    console.log(` Starting point calculation for match ${matchId}`);

    const [rulesRows] = await db.query('SELECT * FROM fantasy_point_rules');
    const rulesMap = {};
    rulesRows.forEach(r => {
      if (!rulesMap[r.category]) rulesMap[r.category] = [];
      rulesMap[r.category].push(r); 
    });

    const getRule = (cat, act) => {
      const rule = rulesMap[cat]?.find(r => r.action === act);
      if (!rule) throw new Error(`Missing rule for ${cat} - ${act}`);
      return Number(rule.points);
    };

    const [events] = await db.query('SELECT * FROM match_events WHERE match_id = ?', [matchId]);
    const playerPointsMap = {};
    const dismissedPlayers = new Set();
    const battedPlayers = new Set();
    const activePlayers = new Set();

    const validEventTypes = new Set([
      'RUN', 'FOUR', 'SIX', 'DOTBALL', 'BOWLED', 'LBW', 'CATCH', 'STUMPING', 'RUNOUT'
    ]);

    for (const ev of events) {
      const { batsman_id, bowler_id, assist_player_id, event_type, runs_scored = 0 } = ev;
      if (!validEventTypes.has(event_type)) {
        console.warn(`Skipping invalid event_type: ${event_type}`);
        continue;
      }

      activePlayers.add(batsman_id);
      activePlayers.add(bowler_id);
      if (assist_player_id) activePlayers.add(assist_player_id);

      if (!playerPointsMap[batsman_id]) playerPointsMap[batsman_id] = { runs: 0, balls: 0, fours: 0, sixes: 0, points: 0 };
      if (!playerPointsMap[bowler_id]) playerPointsMap[bowler_id] = { wickets: 0, lbwBowled: 0, dotBalls: 0, runoutsDirect: 0, points: 0 };
      if (assist_player_id && !playerPointsMap[assist_player_id]) playerPointsMap[assist_player_id] = { catches: 0, stumpings: 0, runoutsIndirect: 0, points: 0 };

      if (["RUN", "FOUR", "SIX", "DOTBALL"].includes(event_type)) {
        playerPointsMap[batsman_id].runs += runs_scored;
        playerPointsMap[batsman_id].balls += 1;
        battedPlayers.add(batsman_id);
        if (event_type === 'FOUR') playerPointsMap[batsman_id].fours += 1;
        if (event_type === 'SIX') playerPointsMap[batsman_id].sixes += 1;
      }

      if (["BOWLED", "LBW", "CATCH", "STUMPING", "RUNOUT"].includes(event_type)) {
        dismissedPlayers.add(batsman_id);
      }

      if (["BOWLED", "LBW", "CATCH", "STUMPING"].includes(event_type)) {
        playerPointsMap[bowler_id].wickets += 1;
      }
      if (["BOWLED", "LBW"].includes(event_type)) {
        playerPointsMap[bowler_id].lbwBowled += 1;
      }
      if (event_type === 'DOTBALL') {
        playerPointsMap[bowler_id].dotBalls += 1;
      }
if (
  event_type === 'CATCH' &&
  assist_player_id &&
  playerPointsMap[assist_player_id]
) {
  playerPointsMap[assist_player_id].catches += 1;
}

if (
  event_type === 'STUMPING' &&
  assist_player_id &&
  playerPointsMap[assist_player_id]
) {
  playerPointsMap[assist_player_id].stumpings += 1;
}
      if (event_type === 'RUNOUT') {
        if (assist_player_id) playerPointsMap[assist_player_id].runoutsIndirect += 1;
        else playerPointsMap[bowler_id].runoutsDirect += 1;
      }
    }
     
    await db.query('DELETE FROM player_match_points WHERE match_id = ?', [matchId]);

    for (const [playerId, stats] of Object.entries(playerPointsMap)) {
      let points = 0;

      points += (stats.runs || 0) * getRule('Batting', 'Run');
      points += (stats.fours || 0) * getRule('Batting', 'Boundary Bonus');
      points += (stats.sixes || 0) * getRule('Batting', 'Six Bonus');

      if (stats.runs >= 100) points += getRule('Batting', 'Century Bonus');
      else if (stats.runs >= 75) points += getRule('Batting', '75 Runs Bonus');
      else if (stats.runs >= 50) points += getRule('Batting', '50 Runs Bonus');
      else if (stats.runs >= 25) points += getRule('Batting', '25 Runs Bonus');

      if ((stats.runs === 0) && dismissedPlayers.has(Number(playerId)) && battedPlayers.has(Number(playerId))) {
        points += getRule('Batting', 'Duck Penalty');
      }

      if ((stats.balls || 0) >= 5) {
        const sr = (stats.runs / stats.balls) * 100;
        const srRule = rulesMap['Batting'].find(r => r.unit === 'SR' && sr >= (r.min_value || 0) && (!r.max_value || sr <= r.max_value));
        if (srRule) points += Number(srRule.points);
      }

      points += (stats.wickets || 0) * getRule('Bowling', 'Wicket');
      points += (stats.lbwBowled || 0) * getRule('Bowling', 'LBW/Bowled Bonus');
      points += Math.floor((stats.dotBalls || 0) / 3) * getRule('Bowling', 'Dot Ball');

      if ((stats.wickets || 0) >= 6) points += getRule('Bowling', '6 Wickets Bonus');
      else if (stats.wickets === 5) points += getRule('Bowling', '5 Wickets Bonus');
      else if (stats.wickets === 4) points += getRule('Bowling', '4 Wickets Bonus');

      points += (stats.catches || 0) * getRule('Fielding', 'Catch');
      points += (stats.stumpings || 0) * getRule('Fielding', 'Stumping');
      points += (stats.runoutsDirect || 0) * getRule('Fielding', 'Run Out (Direct hit)');
      points += (stats.runoutsIndirect || 0) * getRule('Fielding', 'Run Out (Not a direct hit)');

      await db.query(
        `INSERT INTO player_match_points (match_id, player_id, fantasy_points, points)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           fantasy_points = VALUES(fantasy_points),
           points = VALUES(points)`,
        [matchId, playerId, points, points]
      );
    }

    console.log(`✅ Player points saved for match ${matchId}`);

    const [userTeams] = await db.query('SELECT * FROM user_teams WHERE match_id = ?', [matchId]);
    const [matchPlayers] = await db.query('SELECT player_id, is_substitute FROM 22_match_players WHERE match_id = ?', [matchId]);
    const lineupMap = {};
    for (const row of matchPlayers) {
      lineupMap[row.player_id] = row.is_substitute ? 'substitute' : 'playing11';
    }

    await db.query('DELETE FROM user_team_points WHERE match_id = ?', [matchId]);

    for (const ut of userTeams) {
      const userId = ut.user_id;
      let players;
      try {
        players = typeof ut.players === 'string' ? JSON.parse(ut.players) : ut.players;
      } catch (e) {
        console.error(`🚨 Failed to parse players for user ${userId}`);
        continue;
      }

      let totalPoints = 0;

      for (const p of players) {
        const [rows] = await db.query('SELECT fantasy_points FROM player_match_points WHERE match_id = ? AND player_id = ?', [matchId, p.playerId]);
        const playerPts = rows.length > 0 ? rows[0].fantasy_points : 0;
        let multiplier = p.role === 'Captain' ? 2 : (p.role === 'Vice Captain' ? 1.5 : 1);

        let bonus = 0;
        if (lineupMap[p.playerId] === 'playing11') {
          bonus = getRule('General', 'In Starting 11');
        } else if (lineupMap[p.playerId] === 'substitute' && activePlayers.has(Number(p.playerId))) {
          bonus = getRule('General', 'Playing Substitute');
        }

        totalPoints += playerPts * multiplier + bonus;
      }

      await db.query(
  `INSERT INTO user_team_points (match_id, user_id, user_team_id, fantasy_points, points)
   VALUES (?, ?, ?, ?, ?)
   ON DUPLICATE KEY UPDATE
     fantasy_points = VALUES(fantasy_points),
     points = VALUES(points)`,
  [matchId, userId, ut.id, totalPoints, totalPoints]
);
    }

    console.log(`✅ User team points saved for match ${matchId}`);
    res.json({ message: `Points calculated for match ${matchId}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to calculate points', error: err.message });
  }
};


const calculateAllPoints =async(req,res)=>{
  try{
    const { matchId } =
      req.params;

    const result =
      await calculateAllPointsService(
        matchId
      );

    return res.json({
      message:
        `Points calculated for match ${matchId}`,
      result
    });

  }
  catch(err){

    return res.status(500).json({
      message:
        'Failed to calculate points',
      error: err.message
    });

  }

};

module.exports = {
  calculateAllPoints,
  calculateAllPointsService
};