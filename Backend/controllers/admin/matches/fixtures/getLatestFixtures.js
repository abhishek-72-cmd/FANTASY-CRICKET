const db = require('../../../../config/db/db')

const getUpcomingMatches = async (req, res) => {
  try {
    const [matches] = await db.query(
      'SELECT * FROM upcoming_matches WHERE start_time > NOW() ORDER BY start_time ASC'
    );

    res.status(200).json({
      success: true,
      data: matches,
    });

  } catch (error) {
    console.error('Error fetching upcoming matches:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming matches',
      error: error.message,
    });
  }
};

module.exports = getUpcomingMatches;
