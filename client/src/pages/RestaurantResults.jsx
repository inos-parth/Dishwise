import React, { useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGoogleMap } from "../hooks/useGoogleMaps";
import "./RestaurantResults.css";

const RestaurantResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const searchLocation = location.state?.searchLocation;
    const { restaurants, loading, error, initMap } = useGoogleMap(searchLocation);

    useEffect(() => {
        if (!searchLocation) {
            navigate("/");
            return;
        }

        let timeoutId;
        const MAX_RETRIES = 5;
        const RETRY_INTERVAL = 1000;
        let retryCount = 0;

        const attemptLoad = async () => {
            try {
                await initMap();
            } catch (err) {
                if (retryCount < MAX_RETRIES) {
                    retryCount++;
                    timeoutId = setTimeout(attemptLoad, RETRY_INTERVAL);
                } else {
                    console.error("Failed to load map after retries:", err);
                }
            }
        };

        attemptLoad();

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [searchLocation, navigate, initMap]);

    return (
        <div className="results-page">
            <div className="results-header">
                <button onClick={() => navigate("/")} className="back-button">
                    <i className="fas fa-arrow-left"></i> Back to Search
                </button>
                <h1>Restaurants near {searchLocation?.address || "the selected location"}</h1>
            </div>

            <div className="results-container">
                <div id="map" className="map-container"></div>

                <div className="restaurants-list">
                    {loading && <div className="loading">Searching for restaurants...</div>}
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        restaurants.map((restaurant) => (
                            <div key={restaurant.place_id} className="restaurant-card">
                                {restaurant.photos?.[0] && (
                                    <img
                                        src={restaurant.photos[0].getUrl()}
                                        alt={restaurant.name}
                                        className="restaurant-image"
                                    />
                                )}
                                <div className="restaurant-info">
                                    <h3>{restaurant.name}</h3>
                                    <p>{restaurant.vicinity}</p>
                                    <div className="restaurant-details">
                                        <span className="rating">
                                            {restaurant.rating
                                                ? `${restaurant.rating} ⭐`
                                                : "No rating"}
                                        </span>
                                        {restaurant.price_level && (
                                            <span className="price-level">
                                                {"$".repeat(restaurant.price_level)}
                                            </span>
                                        )}
                                    </div>
                                    {restaurant.opening_hours && (
                                        <p className={`status ${restaurant.opening_hours.isOpen
                                            ? restaurant.opening_hours.isOpen()
                                                ? "open"
                                                : "closed"
                                            : "unknown"
                                            }`}>
                                            {restaurant.opening_hours.isOpen
                                                ? restaurant.opening_hours.isOpen()
                                                    ? "Open Now"
                                                    : "Closed"
                                                : "No Opening Information"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default RestaurantResults;
