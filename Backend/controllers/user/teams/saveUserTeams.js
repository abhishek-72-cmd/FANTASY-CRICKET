require("dotenv").config();
const pool = require('../../../config/db/db')
const jwt = require ('jsonwebtoken')
const db = require('../../../config/db/db')

// const saveUserTeam = async (req, res) => {
//   try {
//     console.log('saveUserTeam called');
    
//     // 1. Log the complete request headers for debugging
//     console.log('Request headers:', req.headers);
    
//     // 2. Get the authorization header (correct property name)
//     const authHeader = req.headers['authorization'] || req.headers['Authorization'];
//     console.log('Authorization header:', authHeader);
    
//     if (!authHeader) {
//       console.log('Authorization header missing');
//       return res.status(401).json({ error: 'Authorization header missing' });
//     }

//     // 3. Extract token (handle case where Bearer is not properly capitalized)
//     const tokenParts = authHeader.split(' ');
//     if (tokenParts.length !== 2 || tokenParts[0].toLowerCase() !== 'bearer') {
//       console.log('Invalid authorization format');
//       return res.status(401).json({ error: 'Invalid authorization format' });
//     }

//     const token = tokenParts[1];
//     console.log('JWT Token:', token);
    
//     if (!token) {
//       console.log('No token provided');
//       return res.status(401).json({ error: 'No token provided' });
//     }





//     // 4. Decode and verify the token
//     let decoded;

//  decoded = jwt.verify(token, SECRET);
//       console.log('Decoded token:', decoded);
      
//       if (!decoded.userId) {
//         console.log('No userId in token');
//         return res.status(401).json({ error: 'Invalid token payload' });
//       }
      
//       console.log('User ID from token:', decoded.userId);


//    // 5. Log request body
//     const { match_id, players } = req.body;
//     console.log('Match ID:', match_id);
//     console.log('Players:', players);
//     console.log('userId', decoded.userId)




//     if (!match_id || !players?.length) {
//       console.log("Match ID or players not provided");
//       return res.status(400).json({ error: 'Match ID and players are required' });
//     }

//     // If everything is successful up to this point
//     console.log('All validations passed - ready to save to DB');


//      const playersJson = JSON.stringify(players);
//     console.log('Players JSON:', playersJson);

// const user_id = decoded.userId

//  const result = await new Promise((resolve, reject) => {
//      db.query(
//   'INSERT INTO user_teams (user_id, match_id, players) VALUES (?, ?, ?)',
//   [user_id, match_id, playersJson],
//   (err, result) => {
//     if (err) {
//       console.error('❌ DB Error:', err);
//       return res.status(500).json({ error: 'Database insert failed' });
//     }

//     console.log('✅ Team saved to DB for user_id', user_id);

//     return res.status(201).json({
//       success: true,
//       message: 'Team saved successfully',
//       teamId: result.insertId,
//     });
//   }
// );
//     });

    
//         // Success response
//         return res.status(201).json({
//           success: true,
//           message: 'Team saved successfully',
//           teamId: result.insertId
//         });


//   } catch (err) {
//     console.error('Unexpected error:', err);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };

// module.exports = saveUserTeam;



const saveUserTeam = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.userId;
    const match_id = req.params.matchId;
    const { players, captainId, viceCaptainId } = req.body;

    if (!Array.isArray(players) || players.length !== 11) {
      return res.status(400).json({ message: 'You must select exactly 11 players' });
    }

    // Optional role validation
    const roleCounts = {
      "Wicket Keeper": 0,
      "Batsman": 0,
      "All Rounder": 0,
      "Bowler": 0,
    };

    for (const player of players) {
      if (!roleCounts[player.role]) roleCounts[player.role] = 0;
      roleCounts[player.role]++;
    }

    const ROLE_LIMITS = {
      "Wicket Keeper": { min: 1, max: 2 },
      "Batsman": { min: 1, max: 5 },
      "All Rounder": { min: 1, max: 5 },
      "Bowler": { min: 1, max: 5 },
    };

    for (const role in ROLE_LIMITS) {
      const count = roleCounts[role] || 0;
      if (count < ROLE_LIMITS[role].min || count > ROLE_LIMITS[role].max) {
        return res.status(400).json({ message: `Invalid number of ${role}` });
      }
    }

    // ✅ Insert single team as JSON
    await db.query(
      `INSERT INTO user_teams (user_id, match_id, players, captain_id, vice_captain_id) VALUES (?, ?, ?, ?, ?)`,
      [user_id, match_id, JSON.stringify(players), captainId, viceCaptainId]
    );

    return res.status(200).json({ message: 'Team saved successfully' });

  } catch (err) {
    console.error('Error saving team:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = saveUserTeam;
