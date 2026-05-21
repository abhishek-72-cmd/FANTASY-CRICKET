const db = require('../../../config/db/db');


// const db = require('../../config/db');

// const updateContest = async (req, res) => {
//   const { contestId } = req.params;
//   const updates = req.body;

//   if (!Object.keys(updates).length) {
//     return res.status(400).json({ success: false, message: 'No fields to update' });
//   }

//   try {
//     // Build SET clause dynamically
//     const setClause = Object.keys(updates)
//       .map(field => `${field} = ?`)
//       .join(', ');

//     const values = Object.values(updates);

//     // Add updated_at and contestId to the query
//     const finalQuery = `UPDATE contests SET ${setClause}, updated_at = NOW() WHERE id = ?`;

//     const [result] = await db.query(finalQuery, [...values, contestId]);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ success: false, message: 'Contest not found' });
//     }

//     res.status(200).json({ success: true, message: 'Contest updated successfully' });
//   } catch (err) {
//     console.error('Error updating contest:', err);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

// module.exports = updateContest;


const updateContest = async (req, res) => {
  const { contestId } = req.params;

  const {
    prize_pool,
    max_prize_pool,
    buy_in,
    entry_fee,
    min_players,
    max_players,
    winner_type,
    visible_until,
    registration_opens,
  } = req.body;

  try {
    const [result] = await db.query(
      `
      UPDATE contests
      SET prize_pool = ?, max_prize_pool = ?, buy_in = ?, entry_fee = ?, min_players = ?, max_players = ?, winner_type = ?, visible_until = ?, registration_opens = ?, updated_at = NOW()
      WHERE id = ?
      `,
      [
        prize_pool,
        max_prize_pool,
        buy_in,
        entry_fee,
        min_players,
        max_players,
        winner_type,
        visible_until,
        registration_opens,
        contestId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    res.status(200).json({ success: true, message: 'Contest updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


module.exports=updateContest