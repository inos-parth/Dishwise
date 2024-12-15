const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');

exports.saveRestaurants = async (req, res) => {
  try {
    const restaurants = req.body.restaurants; // Array of restaurants
    const dummyMenu = [
      { name: 'Pasta', price: 12, averageRating: 0, totalReviews: 0, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2762&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
      { name: 'Pizza', price: 15, averageRating: 0, totalReviews: 0, imageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
      { name: 'Salad', price: 10, averageRating: 0, totalReviews: 0, imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=2784&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
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

exports.getRestaurantMenu = async (req, res) => {
  try {
    const { placeId } = req.params;

    const restaurant = await Restaurant.findOne({ place_id: placeId });
    
    if (!restaurant) {
      console.log('Restaurant not found for place_id:', placeId);
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (!restaurant.menu || restaurant.menu.length === 0) {
      console.log('No menu found for restaurant:', restaurant.name);
      return res.status(404).json({ message: 'Menu not available' });
    }
    res.json({ 
      menu: restaurant.menu,
      restaurant: {
        name: restaurant.name,
        address: restaurant.address,
        rating: restaurant.rating
      }
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ message: 'Error fetching menu' });
  }
};

exports.submitReview = async (req, res) => {
  try {
    const { placeId, dishName, rating, review } = req.body;

    console.log('Received review:', { placeId, dishName, rating, review });

    // Validate inputs
    if (!placeId || !dishName || !rating) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Ensure review is not null or empty
    if (typeof review !== 'string' || review.trim() === '') {
      console.log('Review text is empty or invalid');
      return res.status(400).json({ message: 'Review text cannot be empty' });
    }

    // Find the restaurant by place_id
    const restaurant = await Restaurant.findOne({ place_id: placeId });
    if (!restaurant) {
      console.log('Restaurant not found');
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    console.log('Restaurant found:', restaurant.name);

    // Find the dish in the menu
    const dish = restaurant.menu.find((d) => d.name === dishName);
    if (!dish) {
      console.log('Dish not found in the menu');
      return res.status(404).json({ message: 'Dish not found' });
    }

    console.log('Dish found:', dish.name);

    // Update the dish's average rating and total reviews
    const totalReviews = dish.totalReviews || 0;
    const totalRating = (dish.averageRating || 0) * totalReviews + rating;
    dish.totalReviews = totalReviews + 1;
    dish.averageRating = totalRating / dish.totalReviews;

    console.log('Updated dish ratings:', { averageRating: dish.averageRating, totalReviews: dish.totalReviews });

    // Add the review text to the reviews array
    if (!dish.reviews) dish.reviews = [];
    dish.reviews.unshift({ text: review, rating }); // Add the review at the beginning (latest first)
    console.log('Added review:', { text: review, rating });

    // Save the updated restaurant document
    await restaurant.save();
    console.log('Updated restaurant saved successfully');

    // Respond with updated data
    res.status(200).json({
      message: 'Review submitted successfully',
      averageRating: dish.averageRating,
      totalReviews: dish.totalReviews,
      reviews: dish.reviews.slice(0, 3), // Return the latest 3 reviews
    });
  } catch (error) {
    console.error('Error in submitReview:', error);
    res.status(500).json({ message: 'Error submitting review' });
  }
};



