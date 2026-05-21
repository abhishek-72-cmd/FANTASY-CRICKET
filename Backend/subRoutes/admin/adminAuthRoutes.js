const express = require('express');
const router = express.Router();
const adminAuthController =  require('../../controllers/admin/auth/adminAuth');
const checkAdmin = require('../../middlewares/checkAdmin');


// for admin
router.post('/register', adminAuthController.register);
router.post('/login', adminAuthController.login);

// protected admin route
router.get('/admin/dashboard', checkAdmin, (req, res) => {
  res.json({
    message: 'Welcome to the Admin Dashboard',
    adminId: req.user.userId, // available from token
    role: req.user.role
  });
});


module.exports = router;