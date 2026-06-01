// controllers/admin/contestController.js

const db = require('../../../config/db/db');


createContest = async (req, res, next) => {
  try {
    const {
      match_id,
      match_title,
      prize_pool,
      max_prize_pool,
      buy_in,
      entry_fee,
      min_players,
      max_players,
      winner_type,
      visible_until,
      registration_opens
    } = req.body;

    if (!match_id || !prize_pool || !entry_fee || !min_players || !max_players || !winner_type) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const [result] = await db.query(
      `INSERT INTO contests 
        (match_id, match_title, prize_pool, max_prize_pool, buy_in, entry_fee, min_players, max_players, winner_type, visible_until, registration_opens)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        match_id,
        match_title,
        prize_pool,
        max_prize_pool,
        buy_in,
        entry_fee,
        min_players,
        max_players,
        winner_type,
        visible_until,
        registration_opens
      ]
    );

    res.status(201).json({
      success: true,
      message: "Contest created successfully",
      contest_id: result.insertId
    });
  } catch (err) {
    console.error("Error creating contest:", err);
    next(err);
  }
};

module.exports = createContest;