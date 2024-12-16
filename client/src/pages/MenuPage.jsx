import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./MenuPage.css";

const MenuPage = () => {
    const { placeId } = useParams();
    const navigate = useNavigate();
    const [menuData, setMenuData] = useState([]);
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [selectedDish, setSelectedDish] = useState(null);

    // States for rating and reviews
    const [currentRating, setCurrentRating] = useState(0);
    const [reviewText, setReviewText] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch Menu Data
                const menuResponse = await fetch(`http://localhost:8000/api/restaurants/menu/${placeId}`);
                const menuData = await menuResponse.json();
                if (menuResponse.ok && menuData.menu) {
                    setMenuData(menuData.menu);
                    setRestaurant(menuData.restaurant);
                } else {
                    setError("Menu not available");
                }

                // Fetch User's Favorites
                const token = localStorage.getItem("token");
                const favoritesResponse = await fetch(`http://localhost:8000/api/favorites`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const favoritesData = await favoritesResponse.json();
                if (favoritesResponse.ok && Array.isArray(favoritesData.favorites)) {
                    setFavorites(favoritesData.favorites);
                } else {
                    setFavorites([]); // Set to empty array if data is invalid
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to load menu");
                setFavorites([]); // Fallback to empty array
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [placeId]);


    const handleFavorite = async (dish) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch('http://localhost:8000/api/favorites/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    dishId: dish._id, // Ensure this matches your backend's expected field
                    dishName: dish.name,
                    price: dish.price,
                    imageUrl: dish.imageUrl || "na", // Add fallback for imageUrl
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add to favorites');
            }

            const data = await response.json();
            console.log("Favorite added:", data);

            alert(data.message || "Dish added to favorites!");
        } catch (error) {
            console.error('Error updating favorites:', error);
            alert('An error occurred. Please try again.');
        }
    };


    const handlePageChange = (direction) => {
        setSelectedDish((prevDish) => {
            const currentPage = prevDish.currentPage || 0; // Default to 0 if undefined
            const totalPages = Math.ceil(prevDish.reviews.length / 3);

            const newPage = currentPage + direction;

            if (newPage >= 0 && newPage < totalPages) {
                return { ...prevDish, currentPage: newPage };
            }
            return prevDish; // Do not change state if out of bounds
        });
    };



    const handleOpenModal = (dish) => {
        setSelectedDish({
            ...dish,
            currentPage: 0, // Reset to page 0
            reviews: dish.reviews || [], // Ensure reviews is always an array
        });
    };

    const handleRatingChange = (rating) => {
        setCurrentRating(rating); // `currentRating` is a new state to track selected stars
    };

    const submitReview = async () => {
        if (!reviewText.trim()) {
            alert('Review text cannot be empty.');
            return;
        }
        if (currentRating === 0) {
            alert('Please select a rating before submitting.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/restaurants/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    placeId: placeId, // Use the correct `placeId` from state or params
                    dishName: selectedDish.name,
                    rating: currentRating,
                    review: reviewText,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit review');
            }

            const updatedDish = await response.json(); // Get the updated dish data

            // Update the `menuData` state with the updated dish
            setMenuData((prevMenuData) =>
                prevMenuData.map((dish) =>
                    dish.name === updatedDish.name ? updatedDish : dish
                )
            );

            // Update the `selectedDish` to reflect the changes in the modal
            setSelectedDish((prevDish) => ({
                ...prevDish,
                averageRating: updatedDish.averageRating,
                totalReviews: updatedDish.totalReviews,
                reviews: updatedDish.reviews, // Update reviews dynamically
            }));

            // Clear the review text and rating after submission
            setReviewText('');
            setCurrentRating(0);
            alert('Review submitted successfully!');
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('An error occurred while submitting the review. Please try again.');
        }
    };


    return (
        <div className="menu-page">
            <div className="menu-header">
                <button onClick={() => navigate(-1)} className="back-button">
                    <i className="fas fa-arrow-left"></i> Back to Results
                </button>
                <h1>{restaurant?.name || "Restaurant"} Menu</h1>
            </div>

            <div className="menu-content">
                {loading && <div className="loading">Loading menu...</div>}
                {error && <div className="error-message">{error}</div>}

                {menuData.map((item, index) => {
                    const isFavorite = Array.isArray(favorites) && favorites.some((fav) => fav.dishId === item._id);
                    // Calculate isFavorite here
                    return (
                        <div key={index} className="menu-card">
                            <img src={item.imageUrl} alt={item.name} className="menu-card-image" />
                            <div className="menu-card-info">
                                <h2 className="menu-card-name">{item.name}</h2>
                                <p className="menu-card-price">${item.price}</p>
                                <button
                                    className="menu-card-reviews-button"
                                    onClick={() => setSelectedDish(item)}
                                >
                                    Reviews
                                </button>
                                <button
                                    className={`favorite-button ${isFavorite ? "favorited" : ""}`}
                                    onClick={() => handleFavorite(item)}
                                >
                                    {isFavorite ? "★ Favorited" : "☆ Add to Favorites"}
                                </button>
                            </div>
                        </div>
                    );
                })}

            </div>

            {selectedDish && (
                <div className="modal">
                    <div className="modal-content">
                        <button className="modal-close" onClick={() => setSelectedDish(null)}>
                            ×
                        </button>
                        <h2>{selectedDish.name}</h2>
                        <p>
                            {selectedDish.averageRating?.toFixed(1) || 0} / {selectedDish.totalReviews || 0} reviews
                        </p>
                        <div className="modal-reviews">
                            {selectedDish.reviews.length > 0 ? (
                                selectedDish.reviews
                                    .slice(
                                        (selectedDish.currentPage || 0) * 3,
                                        (selectedDish.currentPage || 0) * 3 + 3
                                    )
                                    .map((review, i) => (
                                        <div key={i} className="modal-review-item">
                                            <strong>{review.user || "Anonymous"}</strong>: {review.text} ({review.rating} stars)
                                        </div>
                                    ))
                            ) : (
                                <p>No reviews yet.</p>
                            )}


                            {/* Pagination */}
                            <div className="pagination">
                                <button
                                    onClick={() => handlePageChange(-1)}
                                    disabled={(selectedDish.currentPage || 0) === 0} // First page
                                >
                                    &#8592; Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={
                                        (selectedDish.currentPage || 0) + 1 >= Math.ceil(selectedDish.reviews.length / 3)
                                    } // Last page
                                >
                                    Next &#8594;
                                </button>
                            </div>

                        </div>


                        <div className="modal-add-review">
                            <h3>Add a Review</h3>
                            <textarea
                                placeholder="Write a review..."
                                className="review-textarea"
                                value={reviewText} // Bind the textarea to reviewText state
                                onChange={(e) => setReviewText(e.target.value)}
                            ></textarea>
                            <div className="rating-stars">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <i
                                        key={star}
                                        className={`fas fa-star ${currentRating >= star ? 'selected' : ''}`}
                                        onClick={() => handleRatingChange(star)}
                                    ></i>
                                ))}
                            </div>
                            <button
                                className="submit-review-button"
                                onClick={submitReview}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuPage;
