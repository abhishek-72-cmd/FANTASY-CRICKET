require("dotenv").config();
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res
      .status(401)
      .json({ success: false, error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ success: false, error: "Malformed token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = { userId: decoded.userId };
    return next(); 
  } catch (err) {
    console.error(err);
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
};

module.exports = authMiddleware;
