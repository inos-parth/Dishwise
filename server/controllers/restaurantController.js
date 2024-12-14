const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');

exports.saveRestaurants = async (req, res) => {
  try {
    console.log("Database name:", mongoose.connection.name); // Log current database name
    console.log("Using collection:", Restaurant.collection.name);
    const restaurants = req.body.restaurants; // Array of restaurants
    const dummyMenu = [
      { name: 'Pasta', price: 12 },
      { name: 'Pizza', price: 15 },
      { name: 'Salad', price: 10 },
    ];

    const savedRestaurants = [];
    for (const rest of restaurants) {
      // Check for duplicates based on `place_id`
      const existingRestaurant = await Restaurant.findOne({ place_id: rest.place_id });
      if (!existingRestaurant) {
        const newRestaurant = new Restaurant({
          name: rest.name,
          address: rest.vicinity,
          place_id: rest.place_id,
          rating: rest.rating,
          menu: dummyMenu,
        });
        const saved = await newRestaurant.save();
        savedRestaurants.push(saved);
      }
    }

    res.status(201).json({ message: 'Restaurants saved successfully', savedRestaurants });
  } catch (error) {
    console.error('Error saving restaurants:', error);
    res.status(500).json({ message: 'Error saving restaurants' });
  }
};
