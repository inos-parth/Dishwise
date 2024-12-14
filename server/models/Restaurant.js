const mongoose = require('mongoose');

const DishSchema = new mongoose.Schema({
  name: String,
  price: Number,
});

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  place_id: { type: String, unique: true, required: true },
  rating: { type: Number },
  menu: [DishSchema], // Embedded menu schema
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', RestaurantSchema);
