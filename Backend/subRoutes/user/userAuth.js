// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../../controllers/user/auth/userAuth')

const checkAdmin = require('../../middlewares/checkAdmin');

// for user
router.post('/register', authController.register);
router.post('/send-registration-otp', authController.sendRegistrationOtp);
router.post('/verify-registration-otp', authController.verifyRegistrationOtp);
router.post('/send-reset-otp', authController.sendResetOtp);
router.post('/verify-reset-otp', authController.verifyResetOtp);
router.post('/login', authController.login);
router.post('/reset-password', authController.resetPassword);
router.post('/google-login', authController.googleLogin);



module.exports = router;
