const express = require ('express')
require("dotenv").config();
const db = require ('../../../config/db/db.js')
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;
const axios = require ('axios')

const editTeam = async(req,res) => {

    try{

     const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token' });
    }


 const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET);
    const userId = decoded.userId;


  const teamId = req.params.teamId;
    const players = req.body.players;

    if (!players || !Array.isArray(players)) {
      return res.status(400).json({ message: 'Invalid players' });
    }



   const [result] = await db.query(
      'UPDATE user_teams SET players = ? WHERE id = ? AND user_id = ?',
      [JSON.stringify(players), teamId, userId]
    );

if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Team not found or unauthorized' });
    }
  res.json({ success: true, message: 'Team updated successfully' });
    } catch(err){
            console.error(err);
        res.status(500).json({message: 'Internam server error'})
    }

}

module.exports = editTeam;

