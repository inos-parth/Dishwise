const express = require('express');
const { saveRestaurants, getRestaurantMenu, submitReview } = require('../controllers/restaurantController');

const router = express.Router();

router.post('/save', saveRestaurants); // For saving restaurants
router.get('/menu/:placeId', getRestaurantMenu); // For fetching restaurant menu
router.post('/reviews', submitReview); // For submitting reviews

router.post('/reviews', (req, res, next) => {
    console.log('POST /reviews route hit'); // Debug log
    next(); // Pass control to the actual controller
}, submitReview);


module.exports = router; 
