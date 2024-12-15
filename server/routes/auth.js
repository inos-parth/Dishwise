const express = require('express');
const { register, login } = require('../controllers/authController');
const { getProfile, updateUserProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { protect } = require("../middleware/auth");
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateUserProfile);



module.exports = router;