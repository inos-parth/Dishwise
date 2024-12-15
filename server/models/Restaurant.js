const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    text: String,
    rating: Number,
    user: { type: String, default: 'Anonymous' }, // Added username for the reviewer
    createdAt: { type: Date, default: Date.now }, // Timestamp for sorting
});

const DishSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    reviews: [ReviewSchema], // Reviews for each dish
    imageUrl: { type: String }, // Added static image URL for menu items
});

const RestaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    place_id: { type: String, unique: true, required: true },
    rating: { type: Number },
    menu: [DishSchema], // Embedded menu schema
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', RestaurantSchema);
