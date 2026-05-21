
const db = require ('../../../config/db/db.js');

const getpoints = async (req, res) => {
  const matchId = req.params.matchId;

  try {
    const [rows] = await db.query(
      'SELECT COUNT(*) AS count FROM 22_match_players WHERE match_id = ?',
      [matchId]
    );

    const count = rows[0]?.count || 0;

    res.json({ pointsAvailable: count > 0 });
  } catch (err) {
    console.error('Error fetching points:', err);
    res.status(500).json({ message: 'Error fetching points', error: err });
  }
};
module.exports = getpoints;