const db = require('../../../config/db/db');


const deleteContest = async (req, res) => {
  const { contestId } = req.params;

  try {
    const [result] = await db.query(
      'DELETE FROM contests WHERE id = ?',
      [contestId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Contest not found or already deleted' });
    }

    res.status(200).json({ success: true, message: 'Contest deleted successfully' });
  } catch (error) {
    console.error('Error deleting contest:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = deleteContest;
