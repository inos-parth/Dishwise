import React, { useEffect, useState } from "react";
import "./Favorites.css"; // Assuming the CSS file is linked

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch('http://localhost:8000/api/favorites', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error("Failed to fetch favorites");

                const data = await response.json();
                setFavorites(data.favorites || []); // Ensure it's an array
            } catch (error) {
                console.error("Error fetching favorites:", error);
                setFavorites([]); // Fallback for errors
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, []);

    return (
        <div className="favorites-page">
            <div className="favorites-container">
                <h1>My Favorites</h1>
                {loading ? (
                    <p>Loading favorites...</p>
                ) : favorites.length > 0 ? (
                    <div className="favorites-grid">
                        {favorites.map((dish) => (
                            <div key={dish.dishId} className="favorite-card">
                                <img
                                    src={dish.image || "https://via.placeholder.com/300"} // Fallback if no image
                                    alt={dish.name}
                                    className="favorite-image"
                                />
                                <div className="favorite-info">
                                    <h3>{dish.name}</h3>
                                    <p>Price: ${dish.price || "N/A"}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No favorites added yet.</p>
                )}
            </div>
        </div>
    );
};

export default Favorites;
