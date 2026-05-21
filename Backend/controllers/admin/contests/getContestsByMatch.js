const express = require('express');
const db = require('../../../config/db/db');


const getContestsByMatch = async (req,res) => {
  const { matchId } = req.params;

    try{

        const [rows] = await db.query(
        'SELECT * FROM contests WHERE match_id = ? ORDER BY created_at DESC',
        [matchId]
        );

  res.status(200).json({
      success: true,
      contests: rows
    });

    } catch (err){
        res.status(401).json({Message: 'can not get matches'})
        console.log (err,'error while fetching contests')
    }

}

module.exports = getContestsByMatch