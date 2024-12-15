const User = require('../models/User');

exports.addFavorite = async (req, res) => {
    try {
        const { dishId, dishName, price, imageUrl } = req.body; // Extract all fields from the request body
        const user = await User.findById(req.user.id); // Fetch user based on token's user id

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the dish already exists in favorites
        const existingFavorite = user.favorites.find(fav => fav.dishId === dishId);
        if (existingFavorite) {
            return res.status(400).json({ message: "Dish already in favorites" });
        }

        // Push the new favorite into the favorites array
        user.favorites.push({
            dishId, 
            name: dishName, // Ensure field matches schema
            price,
            image: imageUrl, // Ensure field matches schema
        });

        await user.save(); // Save the updated user document

        res.status(200).json({ 
            message: "Dish added to favorites",
            favorites: user.favorites, // Return updated favorites
        });
    } catch (error) {
        console.error("Error adding favorite:", error);
        res.status(500).json({ message: "Server error" });
    }
};




// Get user's favorites
exports.getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("favorites");
        console.log(user.favorites);
        res.status(200).json({ favorites: user.favorites });
    } catch (error) {
        console.error("Error fetching favorites:", error);
        res.status(500).json({ message: "Server error" });
    }
};
