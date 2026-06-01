require('dotenv').config();
const db = require("../../../config/db/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {OAuth2Client} = require ('google-auth-library');


 const googleClient = new OAuth2Client((
  process.env.GOOGLE_CLIENT_ID
)
 )

// Common validation patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10}$/;

exports.register = async (req, res, next) => {
  const { name, email, phone_number, password } = req.body;

  try {
    // Validate inputs
    if (!name || !email || !phone_number || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!phoneRegex.test(phone_number)) {
      return res.status(400).json({ 
        message: "Invalid phone number format. It should be 10 digits." 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long"
      });
    }

    // Check if email or phone already exists
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE email = ? OR phone_number = ?', 
      [email, phone_number]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ 
        message: "Email or phone number already registered" 
      });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users (name, email, phone_number, password) VALUES (?, ?, ?, ?)',
      [name, email, phone_number, hashedPassword]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertId },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({ 
      message: 'User registered successfully', 
      userId: result.insertId,
      token,
      user: {
        id: result.insertId,
        name,
        email
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Find user
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?", 
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];
    
    // Verify password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    res.json({ 
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.googleLogin = async (req, res) => {
  try {

    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: 'Google credential missing'
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;

    let [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    let user;

    if (users.length === 0) {

      const [result] = await db.query(
        `INSERT INTO users
        (name,email,google_id,auth_provider,is_verified)
        VALUES (?,?,?,?,?)`,
        [
          name,
          email,
          googleId,
          'google',
          1
        ]
      );

      user = {
        id: result.insertId,
        name,
        email
      };

    } else {

      user = users[0];

      if (!user.google_id) {

        await db.query(
          `UPDATE users
           SET google_id=?,
               auth_provider='google',
               is_verified=1
           WHERE id=?`,
          [googleId, user.id]
        );
      }
    }

    const token = jwt.sign(
      {
        userId: user.id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    return res.json({
      success: true,
      token,
      user
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: 'Google login failed'
    });
  }
};

