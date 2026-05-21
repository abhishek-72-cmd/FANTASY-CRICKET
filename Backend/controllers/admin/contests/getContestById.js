const db = require('../../../config/db/db');


const getContestById = async (req, res) => {
  const { contestId } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT * FROM contests WHERE id = ?',[contestId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    res.status(200).json({ success: true, contest: rows[0] });
  } catch (error) {
    console.error('Error fetching contest:', error);
    res.status(500).json({ message: 'Server error while fetching contest' });
  }
};

module.exports = getContestById;
