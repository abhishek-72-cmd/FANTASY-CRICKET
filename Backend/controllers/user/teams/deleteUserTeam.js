const express = require ('express');
const db = require ('../../../config/db/db.js')


const deleteUserTeam = async (req, res) => {
  const teamId = req.params.teamId;
console.log (teamId)
  if (!teamId) {
    return res.status(400).json({ message: 'teamId is required' });
  }

  try {
    const [result] = await db.query(`DELETE FROM user_teams WHERE id = ?`, [teamId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    return res.json({ message: 'Team deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error while deleting team', err });
  }
};

module.exports = deleteUserTeam;
