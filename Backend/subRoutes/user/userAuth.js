// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../../controllers/user/auth/userAuth')

const checkAdmin = require('../../middlewares/checkAdmin');

// for user
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);



module.exports = router;
