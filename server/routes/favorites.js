const express = require("express");
const { addFavorite, getFavorites } = require("../controllers/favoritesController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Route to add a favorite
router.post("/add", protect, addFavorite);

// Route to get all favorites
router.get("/", protect, getFavorites);

module.exports = router;
