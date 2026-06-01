// controllers/admin/matchController.js
const  db = require ('../../../../config/db/db.js');

const getActiveMatchCount = async (req, res) => {
  try {
 const [rows] = await db.query(`
  SELECT COUNT(*) AS activeCount
  FROM fixtures
  WHERE is_activated = 1
`);

    return res.json({
      success: true,
      activeCount: rows[0].activeCount
    });
  } catch (error) {
    console.error('GET ACTIVE MATCH COUNT ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch active match count'
    });
  }
};


module.exports = getActiveMatchCount;