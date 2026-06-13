const express = require('express');
const router =  express.Router();

const {
  updateAutomationStatus,
  getAutomationStatus
} = require("../../controllers/admin/Automation/get&updateAutomationStatus ");


router.get('/status', getAutomationStatus);
router.put('/update-status', updateAutomationStatus);


module.exports = router;