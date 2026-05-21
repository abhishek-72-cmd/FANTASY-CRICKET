
const  db = require ('../../../../config/db/db.js');
const axios = require ('axios')


const fetchActivationStatus = async (req, res) => {
  const { matchId } = req.params;

  try {
    const [rows] = await db.query('SELECT is_activated FROM fixtures WHERE id = ?', [matchId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Fixture not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching fixture', error: err.message });
  }
};

module.exports = fetchActivationStatus;