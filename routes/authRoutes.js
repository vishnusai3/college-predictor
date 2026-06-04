const express = require('express');
const router = express.Router();
const { studentSignup, studentLogin, updateStudentProfile, adminLogin } = require('../controllers/authController');

router.post('/student-signup', studentSignup);
router.post('/student-login', studentLogin);
router.put('/update-profile', updateStudentProfile);
router.post('/admin-login', adminLogin);

module.exports = router;
