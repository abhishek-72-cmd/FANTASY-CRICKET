const express = require("express");
const router = express.Router();


const createContest = require("../../controllers/admin/contests/createContest.js");
const checkAdmin = require("../../middlewares/checkAdmin.js");
const getContestsByMatch = require("../../controllers/admin/contests/getContestsByMatch.js");
const getContestById = require("../../controllers/admin/contests/getContestById.js");
const deleteContest = require("../../controllers/admin/contests/deleteContest.js");
const updateContest = require ('../../controllers/admin/contests/updateContest.js')

router.post("/create", checkAdmin,createContest);
router.get("/view/:matchId",getContestsByMatch)
router.get('/viewById/:contestId', getContestById);
router.delete('/delete/:contestId', checkAdmin,deleteContest )
router.put('/update/:contestId',checkAdmin, updateContest )


module.exports = router;
