const  db = require ('../../../../config/db/db.js');


const activateMatch = async (req, res) => {
  const { matchId } = req.params;
  
  try {
    await db.query('UPDATE fixtures SET is_activated = TRUE WHERE id = ?', [matchId]);
    res.json({ message: 'Match activated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to activate match', error: err.message });
  }
};

module.exports = activateMatch ;