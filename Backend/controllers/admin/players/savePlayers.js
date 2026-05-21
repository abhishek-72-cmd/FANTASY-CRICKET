const savePlayersForFixture = require('./savePlayersForFixture');

const savePlayers = async (req, res) => {
  const { match_id } = req.params;

  try {
    await savePlayersForFixture(match_id);
    res.status(200).json({ message: 'Players fetched and saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = savePlayers;
