const express = require('express');
const { saveRestaurants } = require('../controllers/restaurantController');
const router = express.Router();

router.post('/save', saveRestaurants);

module.exports = router;
