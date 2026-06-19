require('dotenv').config();
const db = require("../../../config/db/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {OAuth2Client} = require ('google-auth-library');
const transporter = require('./mailer');
const { sendOtpMail } = require('./mailService');
const { validationResult } = require('express-validator');
const { createWallet } = require('../../../paymentControllers/userWallet');
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

 const googleClient = new OAuth2Client((
  process.env.GOOGLE_CLIENT_ID
)
 )

// Common validation patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10}$/;


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

      await createWallet(result.insertId);
    
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

      await createWallet(user.id);
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

exports.register = async (req, res, next) => {
  const { name, email, phone_number, password } = req.body;

  try {
    console.log("=== REGISTER START ===");
    console.log("BODY:", req.body);
    console.log("NAME:", name);
    console.log("EMAIL:", email);
    console.log("PHONE:", phone_number);
    console.log("PASSWORD:", password);

    if (!name || !email || !phone_number || !password) {
      console.log("REGISTER FAIL: Missing fields");
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (!emailRegex.test(email)) {
      console.log("REGISTER FAIL: Invalid email format");
      return res.status(400).json({
        message: "Invalid email format"
      });
    }

    if (!phoneRegex.test(phone_number)) {
      console.log("REGISTER FAIL: Invalid phone format");
      return res.status(400).json({
        message:
          "Invalid phone number format. It should be 10 digits."
      });
    }

    if (password.length < 8) {
      console.log("REGISTER FAIL: Password too short");
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long"
      });
    }

    console.log("Checking OTP verification...");
    const [otpVerification] = await db.query(
      `
      SELECT *
      FROM otp_verifications
      WHERE email = ?
      AND purpose = 'registration'
      AND verified = 1
      ORDER BY id DESC
      LIMIT 1
      `,
      [email]
    );

    console.log("OTP VERIFICATION ROWS:", otpVerification);

    if (otpVerification.length === 0) {
      console.log("REGISTER FAIL: OTP not verified");
      return res.status(400).json({
        message: "Please verify your email OTP first"
      });
    }

    console.log("Checking existing user...");
    const [existingUser] = await db.query(
      `
      SELECT *
      FROM users
      WHERE email = ?
      OR phone_number = ?
      `,
      [email, phone_number]
    );

    console.log("EXISTING USER ROWS:", existingUser);

    if (existingUser.length > 0) {
      console.log("REGISTER FAIL: User already exists");
      return res.status(409).json({
        message:
          "Email or phone number already registered"
      });
    }

    console.log("Hashing password...");
    const hashedPassword =
      await bcrypt.hash(password, 12);

    console.log("Inserting user...");
    const [result] = await db.query(
      `
      INSERT INTO users
      (
        name,
        email,
        phone_number,
        password,
        auth_provider,
        is_verified
      )
      VALUES (?,?,?,?,?,?)
      `,
      [
        name,
        email,
        phone_number,
        hashedPassword,
        'local',
        1
      ]
    );

    console.log("USER INSERT RESULT:", result);

    await createWallet(result.insertId);

    console.log("Cleaning OTP records...");
    await db.query(
      `
      DELETE FROM otp_verifications
      WHERE email = ?
      AND purpose = 'registration'
      `,
      [email]
    );

    console.log("Signing JWT...");
    const token = jwt.sign(
      {
        userId: result.insertId
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    console.log("REGISTER SUCCESS:", result.insertId);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: result.insertId,
        name,
        email
      }
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    console.log("=== LOGIN START ===");
    console.log("BODY:", req.body);
    console.log("EMAIL:", email);
    console.log("PASSWORD:", password);

    if (!email || !password) {
      console.log("LOGIN FAIL: Missing email/password");
      return res.status(400).json({
        message:
          "Email and password are required"
      });
    }

    if (!emailRegex.test(email)) {
      console.log("LOGIN FAIL: Invalid email format");
      return res.status(400).json({
        message: "Invalid email format"
      });
    }

    console.log("Finding user by email...");
    const [rows] = await db.query(
      `
      SELECT *
      FROM users
      WHERE email = ?
      `,
      [email]
    );

    console.log("USER ROWS:", rows);

    if (rows.length === 0) {
      console.log("LOGIN FAIL: User not found");
      return res.status(401).json({
        message:
          "Invalid email or password"
      });
    }

    const user = rows[0];
    console.log("USER FOUND:", user);

    if (user.auth_provider === 'google') {
      console.log("LOGIN FAIL: Google account");
      return res.status(400).json({
        message:
          "This account uses Google Sign-In. Please continue with Google."
      });
    }

    if (!user.is_verified) {
      console.log("LOGIN FAIL: Email not verified");
      return res.status(400).json({
        message:
          "Please verify your email before login."
      });
    }

    console.log("Comparing password...");
    const match = await bcrypt.compare(
      password,
      user.password
    );

    console.log("PASSWORD MATCH:", match);

    if (!match) {
      console.log("LOGIN FAIL: Password mismatch");
      return res.status(401).json({
        message:
          "Invalid email or password"
      });
    }

    await createWallet(user.id);

    console.log("Signing JWT...");
    const token = jwt.sign(
      {
        userId: user.id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    console.log("LOGIN SUCCESS:", user.id);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    next(err);
  }
};

exports.sendRegistrationOtp = async (req, res) => {
  try {
    console.log("=== SEND REGISTRATION OTP START ===");
    console.log("BODY:", req.body);

    const { email } = req.body;
    console.log("EMAIL:", email);

    const otp = generateOtp();
    console.log("GENERATED OTP:", otp);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    console.log("OTP EXPIRES AT:", expiresAt);

    const insertResult = await db.query(
      `INSERT INTO otp_verifications
      (email,otp,purpose,expires_at)
      VALUES (?,?,?,?)`,
      [
        email,
        otp,
        'registration',
        expiresAt
      ]
    );

    console.log("OTP INSERT RESULT:", insertResult);

    await sendOtpMail(
      email,
      otp,
      'registration'
    );

    console.log("OTP MAIL SENT");

    return res.json({
      message:'OTP sent successfully'
    });
  } catch(error) {
    console.error("OTP ERROR:", error);
    console.error("OTP ERROR MESSAGE:", error.message);
    console.error("OTP ERROR STACK:", error.stack);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.verifyRegistrationOtp = async (req, res) => {
  try {
    console.log("=== VERIFY REGISTRATION OTP START ===");
    console.log("BODY:", req.body);

    const { email, otp } = req.body;
    console.log("EMAIL:", email);
    console.log("OTP:", otp);

    const [rows] = await db.query(
      `SELECT *
       FROM otp_verifications
       WHERE email=?
       AND otp=?
       AND purpose='registration'
       AND expires_at > NOW()
       ORDER BY id DESC
       LIMIT 1`,
      [email, otp]
    );

    console.log("OTP LOOKUP ROWS:", rows);

    if (rows.length === 0) {
      console.log("VERIFY REG OTP FAIL: Invalid OTP");
      return res.status(400).json({
        message:'Invalid OTP'
      });
    }

    const updateResult = await db.query(
      `UPDATE otp_verifications
       SET verified=1
       WHERE id=?`,
      [rows[0].id]
    );

    console.log("OTP UPDATE RESULT:", updateResult);
    console.log("VERIFY REG OTP SUCCESS");

    return res.json({
      message:'OTP verified'
    });

  } catch (error) {
    console.error("VERIFY REG OTP ERROR:", error);
    return res.status(500).json({
      message: "Failed to verify registration OTP"
    });
  }
};


exports.sendResetOtp = async (req, res) => {
  try {
    console.log("=== SEND RESET OTP START ===");
    console.log("BODY:", req.body);

    const { email } = req.body;
    console.log("EMAIL:", email);

    const [users] = await db.query(
      `SELECT *
       FROM users
       WHERE email=?`,
      [email]
    );

    console.log("RESET OTP USER ROWS:", users);

    if(users.length === 0){
      console.log("SEND RESET OTP FAIL: User not found");
      return res.status(404).json({
        message:'User not found'
      });
    }

    const user = users[0];
    console.log("USER:", user);

    if(user.auth_provider === 'google'){
      console.log("SEND RESET OTP FAIL: Google account");
      return res.status(400).json({
        message:'Google account. Use Google Login.'
      });
    }

    const otp = generateOtp();
    console.log("GENERATED RESET OTP:", otp);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    console.log("RESET OTP EXPIRES AT:", expiresAt);

    const insertResult = await db.query(
      `INSERT INTO otp_verifications
      (email,otp,purpose,expires_at)
      VALUES (?,?,?,?)`,
      [
        email,
        otp,
        'reset_password',
        expiresAt
      ]
    );

    console.log("RESET OTP INSERT RESULT:", insertResult);

    await sendOtpMail(
      email,
      otp,
      'reset_password'
    );

    console.log("RESET OTP MAIL SENT");

    return res.json({
      message:'OTP sent'
    });

  } catch (error) {
    console.error("SEND RESET OTP ERROR:", error);
    return res.status(500).json({
      message: "Failed to send reset OTP"
    });
  }
};


exports.verifyResetOtp = async (req, res) => {
  try {
    console.log("=== VERIFY RESET OTP START ===");
    console.log("BODY:", req.body);

    const { email, otp } = req.body;
    console.log("EMAIL:", email);
    console.log("OTP:", otp);

    if (!email || !otp) {
      console.log("VERIFY RESET OTP FAIL: Missing email/otp");
      return res.status(400).json({
        message: "Email and OTP are required"
      });
    }

    const [rows] = await db.query(
      `
      SELECT *
      FROM otp_verifications
      WHERE email = ?
      AND otp = ?
      AND purpose = 'reset_password'
      AND expires_at > NOW()
      ORDER BY id DESC
      LIMIT 1
      `,
      [email, otp]
    );

    console.log("RESET OTP LOOKUP ROWS:", rows);

    if (rows.length === 0) {
      console.log("VERIFY RESET OTP FAIL: Invalid or expired OTP");
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    const updateResult = await db.query(
      `
      UPDATE otp_verifications
      SET verified = 1
      WHERE id = ?
      `,
      [rows[0].id]
    );

    console.log("RESET OTP UPDATE RESULT:", updateResult);
    console.log("VERIFY RESET OTP SUCCESS");

    return res.json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (error) {
    console.error("VERIFY RESET OTP ERROR:", error);
    return res.status(500).json({
      message: "Failed to verify OTP"
    });
  }
};

exports.resetPassword = async (req,res) => {

    const {
        email,
        password
    } = req.body;

    const [otpCheck] = await db.query(
        `SELECT *
         FROM otp_verifications
         WHERE email=?
         AND purpose='reset_password'
         AND verified=1
         ORDER BY id DESC
         LIMIT 1`,
        [email]
    );

    if(otpCheck.length === 0){
        return res.status(400).json({
            message:'OTP verification required'
        });
    }

    const hashedPassword =
        await bcrypt.hash(password,12);

    await db.query(
        `UPDATE users
         SET password=?
         WHERE email=?`,
        [
            hashedPassword,
            email
        ]
    );

    await db.query(
        `DELETE
         FROM otp_verifications
         WHERE email=?`,
        [email]
    );

    return res.json({
        message:'Password reset successful'
    });
};
