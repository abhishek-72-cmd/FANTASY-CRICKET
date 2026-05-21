
require("dotenv").config();
const db = require ('../../../config/db/db.js')

const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

const viewUserTeams = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, SECRET);
    const userId = decoded.userId;

    // Step 1️⃣: Get all teams of this user
    const [teams] = await db.query(
      `SELECT id AS team_id, match_id, players, created_at
       FROM user_teams
       WHERE user_id = ?`,
      [userId]
    );

    if (teams.length === 0) {
      return res.json({ success: true, teams: [] });
    }

    // Step 2️⃣: Collect all unique playerIds and matchIds
    const allPlayerIds = new Set();
    const allMatchIds = new Set();

    teams.forEach(team => {
      let playersArr;
      if (typeof team.players === 'string') {
        playersArr = JSON.parse(team.players);
      } else {
        playersArr = team.players; // already an array
      }
      team._playersArr = playersArr;

      playersArr.forEach(p => allPlayerIds.add(p.playerId));
      allMatchIds.add(team.match_id);
    });

    // Step 3️⃣: Fetch player names
    const [playersData] = await db.query(
      `SELECT player_id, fullname FROM players WHERE player_id IN (${[...allPlayerIds].map(() => "?").join(",")})`,
      [...allPlayerIds]
    );
    const playerMap = {};
    playersData.forEach(p => { playerMap[p.player_id] = p.fullname; });

    // Step 4️⃣: Fetch contests info (by match_id)
    const [contestsData] = await db.query(
      `SELECT match_id, match_title, buy_in, entry_fee
       FROM contests
       WHERE match_id IN (${[...allMatchIds].map(() => "?").join(",")})`,
      [...allMatchIds]
    );


const contestMap = {};
contestsData.forEach(c => {
  const buyIn = parseFloat(c.buy_in) || 0;
  const entryFee = parseFloat(c.entry_fee) || 0;

  contestMap[c.match_id] = {
    match_title: c.match_title,
    buy_in: buyIn,
    entry_fee: entryFee,
    total_fee: buyIn + entryFee
  };
});

    // Step 5️⃣: Build response
    const enrichedTeams = teams.map(team => {
      const players = team._playersArr.map(p => ({
        id: p.playerId,
        fullname: playerMap[p.playerId] || "Unknown",
        role: p.role
      }));

      const contest = contestMap[team.match_id] || null;

      return {
        team_id: team.team_id,
        created_at: team.created_at,
        match: {
          id: team.match_id,
          title: contest ? contest.match_title : "Unknown"
        },
        contest: contest,
        players
      };
    });

    res.json({
      success: true,
      teams: enrichedTeams
    });

  } catch (err) {
    console.error("Error fetching user teams:", err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({
      success: false,
      message: "Failed to fetch user teams",
      error: err.message
    });
  }
};

module.exports = viewUserTeams;
