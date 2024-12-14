import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGoogleMap } from "../hooks/useGoogleMaps";
import "./RestaurantResults.css";

const RestaurantResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const searchLocation = location.state?.searchLocation;
    const { restaurants, loading, error, initMap } = useGoogleMap(searchLocation);
    const [showMap, setShowMap] = useState(true);

    const toggleMap = () => {
        setShowMap((prev) => !prev);
    };
    // State for filters
    const [filters, setFilters] = useState({
        cuisine: "", // E.g., "italian", "indian", etc.
        openNow: false,
        priceLevel: null, // E.g., 1, 2, 3 (number of dollar signs)
    });

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
                await initMap(filters);
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
    }, [searchLocation, navigate, initMap, filters]);

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: name === "minRating" && value !== "" ? parseFloat(value) : type === "checkbox" ? checked : value,
        }));
    };

    const saveRestaurantsToDB = async (restaurants) => {
        try {
            const response = await fetch("http://localhost:8000/api/restaurants/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ restaurants }),
            });
    
            const result = await response.json();
    
            if (!response.ok) {
                console.error("Error response from server:", result);
                throw new Error(result.message || "Failed to save restaurants to the database");
            }
    
            console.log("Restaurants saved successfully:", result);
        } catch (err) {
            console.error("Error saving restaurants:", err.message);
        }
    };
    
    
    // Use the saveRestaurantsToDB function after fetching restaurants
    useEffect(() => {
        if (!loading && !error && restaurants.length > 0) {
            saveRestaurantsToDB(restaurants);
        }
    }, [loading, error, restaurants]);

    return (
        <div className="results-page">
            <div className="results-header">
                <button onClick={() => navigate("/")} className="back-button">
                    <i className="fas fa-arrow-left"></i> Back to Search
                </button>
                <h1>
                    Restaurants near {searchLocation?.address || "the selected location"}
                </h1>
            </div>

            {/* Filters Section */}
            <div className="filters-container">
                <select name="cuisine" value={filters.cuisine} onChange={handleFilterChange}>
                    <option value="">All Cuisines</option>
                    <option value="italian">Italian</option>
                    <option value="indian">Indian</option>
                    <option value="chinese">Chinese</option>
                    <option value="pizza">Pizza</option>
                </select>
                <label>
                    <input
                        type="checkbox"
                        name="openNow"
                        checked={filters.openNow}
                        onChange={handleFilterChange}
                    />
                    Open Now
                </label>
                <select name="minRating" value={filters.minRating || ""} onChange={handleFilterChange}>
                    <option value="">All Ratings</option>
                    <option value="3">3 ⭐</option>
                    <option value="4">4 ⭐</option>
                    <option value="5">5 ⭐</option>
                </select>
            </div>

            {/* Results Section */}
            <div className="results-container">
                {showMap && (
                    <div id="map" className="map-container">
                        <div className="dropdown">
                            <select onChange={toggleMap} className="dropdown-toggle">
                                <option value="show">Hide Map</option>
                                <option value="hide">Show Map</option>
                            </select>
                        </div>
                    </div>
                )}
                {!showMap && (
                    <div className="dropdown">
                        <select onChange={toggleMap} className="dropdown-toggle">
                            <option value="show">Show Map</option>
                        </select>
                    </div>
                )}

                <div className="restaurants-list">
                    {loading && <div className="loading">Searching for restaurants...</div>}
                    {error && <div className="error-message">{error}</div>}

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
