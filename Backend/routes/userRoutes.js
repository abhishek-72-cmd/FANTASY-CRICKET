

const express = require('express');
const router = express.Router();


router.use('/team', require('../subRoutes/user/teamRoutes'));
router.use('/auth', require('../subRoutes/user/userAuth'));
router.use('/wallet', require('../subRoutes/user/walletRoutes'));


module.exports = router;
