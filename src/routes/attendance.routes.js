const express = require('express');
const router = express.Router();

const attendanceController = require('../controllers/attendace.controller');

router.post('/insert', attendanceController.insertNewAttendance);
router.get('/listtoday', attendanceController.fetchAttendantChildrenToday);
router.get('/todaychildactivity', attendanceController.fetchAttendantChildActivity);
router.post('/updateactivitytime', attendanceController.updateChildActivityTime);
router.post('/updateactivity', attendanceController.updateChildActivity);

module.exports = router;