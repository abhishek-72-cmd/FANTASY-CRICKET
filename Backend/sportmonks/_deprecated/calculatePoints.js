require('dotenv').config();
const db = require('../../config/db/db');

const calculatePoints = async (req, res) => {
  const { matchId } = req.params;

  if (!matchId) {
    return res.status(400).json({ message: 'matchId is required' });
  }

  console.log(`Calculating points for match: ${matchId}`);

  try {
    const [events] = await db.query(
      'SELECT * FROM match_events WHERE match_id = ?',
      [matchId]
    );

    if (!events.length) {
      return res.status(404).json({ message: 'No match events found.' });
    }

    const playerStats = {};

    // 1 Aggregate stats
    for (const e of events) {
      const batsmanId = e.batsman_id;
      const bowlerId = e.bowler_id;
      const assistId = e.assist_player_id;

      const runs = e.runs_scored;
      const event = e.event_type;

      //  Batting
      if (!playerStats[batsmanId]) playerStats[batsmanId] = initPlayer();
      if (event === 'RUN' || event === 'FOUR' || event === 'SIX' || event === 'DOTBALL') {
        playerStats[batsmanId].runs += runs;
        playerStats[batsmanId].ballsFaced += 1;

        if (event === 'FOUR') playerStats[batsmanId].fours += 1;
        if (event === 'SIX') playerStats[batsmanId].sixes += 1;
        if (runs === 0 && ['LBW', 'BOWLED', 'CATCH', 'RUNOUT', 'STUMPING', 'WICKET'].includes(event)) {
          playerStats[batsmanId].duck = true;
        }
      }

      //  Bowling
      if (!playerStats[bowlerId]) playerStats[bowlerId] = initPlayer();
      if (['LBW', 'BOWLED', 'CATCH', 'STUMPING', 'WICKET'].includes(event)) {
        playerStats[bowlerId].wickets += 1;
        if (event === 'LBW' || event === 'BOWLED') playerStats[bowlerId].bonusWicket += 1;
      }
      if (event === 'DOTBALL') playerStats[bowlerId].dotBalls += 1;

      //  Fielding
      if (assistId) {
        if (!playerStats[assistId]) playerStats[assistId] = initPlayer();
        if (event === 'CATCH') playerStats[assistId].catches += 1;
        if (event === 'STUMPING') playerStats[assistId].stumpings += 1;
        if (event === 'RUNOUT') playerStats[assistId].runouts += 1; // assume non-direct by default
      }
    }

    // 2 Calculate points
    for (const [playerId, stats] of Object.entries(playerStats)) {
      let points = 0;

      // Batting
      points += stats.runs * 1;
      points += stats.fours * 4;
      points += stats.sixes * 6;

      if (stats.runs >= 25) points += 8;
      if (stats.runs >= 50) points += 12;
      if (stats.runs >= 75) points += 16;
      if (stats.runs >= 100) points += 20;

      if (stats.duck) points -= 2;

      // Strike rate
      if (stats.ballsFaced > 0) {
        const sr = (stats.runs / stats.ballsFaced) * 100;
        if (sr > 140) points += 6;
        else if (sr >= 120.01) points += 4;
        else if (sr >= 100) points += 2;
        else if (sr >= 40) points -= 2;
        else if (sr >= 30) points -= 4;
        else points -= 6;
      }

      // Bowling
      points += stats.wickets * 20;
      points += stats.bonusWicket * 8;

      if (stats.wickets >= 4) points += 4;
      if (stats.wickets >= 5) points += 8;
      if (stats.wickets >= 6) points += 12;

      points += Math.floor(stats.dotBalls / 3) * 1;

      // Fielding
      points += stats.catches * 8;
      points += stats.stumpings * 12;
      points += stats.runouts * 6; // assuming non-direct

      // Save in DB
      await db.query(
        `INSERT INTO player_match_points (match_id, player_id, points)
         VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE points = ?`,
        [matchId, playerId, points, points]
      );
    }

    res.json({ message: `Points calculated for match ${matchId}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to calculate points', error: err.message });
  }
};

function initPlayer() {
  return {
    runs: 0,
    ballsFaced: 0,
    fours: 0,
    sixes: 0,
    duck: false,
    wickets: 0,
    bonusWicket: 0,
    dotBalls: 0,
    catches: 0,
    stumpings: 0,
    runouts: 0
  };
}

module.exports = calculatePoints;
