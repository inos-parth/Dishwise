import React, { useState, useEffect } from 'react';
import './LandingPage.css';

const LandingPage = () => {
    const [searchInput, setSearchInput] = useState('');
    const [showLocationOptions, setShowLocationOptions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [restaurants, setRestaurants] = useState([]);
    const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

    useEffect(() => {
        const loadGoogleMaps = () => {
            // Clear existing instance if any
            if (window.google) {
                window.google = undefined;
            }

            // Remove any existing scripts
            const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
            existingScripts.forEach(script => script.remove());

            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
                script.async = true;
                script.defer = true;

                script.addEventListener('load', () => {
                    if (window.google && window.google.maps) {
                        setGoogleMapsLoaded(true);
                        console.log('Google Maps loaded successfully');
                        resolve();
                    } else {
                        reject(new Error('Google Maps failed to load correctly'));
                    }
                });

                script.addEventListener('error', () => {
                    reject(new Error('Failed to load Google Maps'));
                });

                document.head.appendChild(script);
            });
        };

        loadGoogleMaps().catch(error => {
            console.error('Error loading Google Maps:', error);
            setError(error.message);
        });

        return () => {
            const script = document.querySelector('script[src*="maps.googleapis.com"]');
            if (script) {
                script.remove();
            }
        };
    }, []);

    // Initialize autocomplete when Google Maps is loaded
    useEffect(() => {
        let autocomplete = null;

        const initializeAutocomplete = () => {
            if (!window.google || !window.google.maps || !window.google.maps.places) {
                console.error('Google Maps Places API not loaded');
                return;
            }

            const input = document.getElementById('location-search');
            if (!input) {
                console.error('Search input not found');
                return;
            }

            try {
                const autocomplete = new window.google.maps.places.Autocomplete(input, {
                    types: ['(cities)'],
                    componentRestrictions: { country: "us" }
                });

                autocomplete.addListener('place_changed', async () => {
                    const place = autocomplete.getPlace();
                    if (place.geometry && place.geometry.location) {
                        setSearchInput(place.formatted_address);
                        setShowLocationOptions(false);

                        // Get location coordinates
                        const lat = place.geometry.location.lat();
                        const lng = place.geometry.location.lng();

                        console.log('Selected place:', place.formatted_address, lat, lng);
                        await searchNearbyRestaurants(lat, lng);
                    } else {
                        setError('No details available for this location');
                    }
                });

                return autocomplete;
            } catch (error) {
                console.error('Error initializing autocomplete:', error);
                setError('Error initializing location search');
                return null;
            }
        };

        if (googleMapsLoaded) {
            initializeAutocomplete();
        }

        return () => {
            if (autocomplete) {
                // Cleanup autocomplete instance if needed
                window.google.maps.event.clearInstanceListeners(autocomplete);
            }
        };
    }, [googleMapsLoaded]);

    const searchNearbyRestaurants = async (latitude, longitude) => {
        if (!window.google || !window.google.maps || !window.google.maps.places) {
            setError('Google Maps Places API is not loaded');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Create a permanent map element
            let mapDiv = document.getElementById('google-map-container');
            if (!mapDiv) {
                mapDiv = document.createElement('div');
                mapDiv.id = 'google-map-container';
                mapDiv.style.display = 'none';
                document.body.appendChild(mapDiv);
            }

            const location = {
                lat: typeof latitude === 'function' ? latitude() : parseFloat(latitude),
                lng: typeof longitude === 'function' ? longitude() : parseFloat(longitude)
            };

            // Initialize the map
            const map = new window.google.maps.Map(mapDiv, {
                center: location,
                zoom: 15
            });

            // Wait for map to load
            await new Promise((resolve) => {
                map.addListener('idle', resolve);
            });

            // Create Places service
            const service = new window.google.maps.places.PlacesService(map);

            // Perform the nearby search
            const results = await new Promise((resolve, reject) => {
                service.nearbySearch({
                    location: location,
                    radius: 5000,
                    type: ['restaurant']
                }, (results, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                        resolve(results || []);
                    } else {
                        reject(new Error(`Places search failed: ${status}`));
                    }
                });
            });

            console.log('Found restaurants:', results);
            setRestaurants(results);

        } catch (err) {
            console.error('Error in searchNearbyRestaurants:', err);
            setError(`Error searching restaurants: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;

                    if (googleMapsLoaded) {
                        const geocoder = new window.google.maps.Geocoder();
                        const response = await new Promise((resolve, reject) => {
                            geocoder.geocode(
                                { location: { lat: latitude, lng: longitude } },
                                (results, status) => {
                                    if (status === 'OK' && results[0]) {
                                        resolve(results[0]);
                                    } else {
                                        reject(new Error('Could not find address'));
                                    }
                                }
                            );
                        });

                        setSearchInput(response.formatted_address);
                        await searchNearbyRestaurants(latitude, longitude);
                    }
                } catch (err) {
                    setError('Error getting location details: ' + err.message);
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                setError('Error accessing your location: ' + error.message);
                setLoading(false);
            }
        );
    };
    const handleSearch = () => {
        if (!searchInput) return;

        // If we have google maps loaded and autocomplete instance
        if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();

            geocoder.geocode({ address: searchInput }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const location = results[0].geometry.location;
                    searchNearbyRestaurants(location.lat(), location.lng());
                } else {
                    setError('Could not find location. Please try again.');
                }
            });
        }
    };
    const handleFocus = () => setShowLocationOptions(true);
    const handleBlur = () => {
        setTimeout(() => setShowLocationOptions(false), 200);
    };


    return (
        <div className="landing-page">
            <div className="hero-section">
                <h1>Find your next favorite restaurant</h1>
                <div className="main-search">
                    <div className="search-container">
                        <input
                            id="location-search"
                            type="text"
                            placeholder="Search restaurants near you..."
                            className="main-search-input"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                            disabled={loading || !googleMapsLoaded}
                        />
                        <button
                            className="main-search-button"
                            disabled={loading || !googleMapsLoaded}
                            onClick={handleSearch}
                        >
                            <i className="fas fa-search"></i>
                        </button>
                    </div>

                    {showLocationOptions && (
                        <div className="location-options">
                            <button
                                className="use-location-btn"
                                onClick={handleCurrentLocation}
                                disabled={loading || !googleMapsLoaded}
                            >
                                <i className="fas fa-location-arrow"></i>
                                {loading ? 'Getting location...' : 'Use current location'}
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            {error}
                            <button
                                className="close-error"
                                onClick={() => setError(null)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="categories-section">
                <h2>Popular Categories</h2>
                <div className="category-grid">
                    <div className="category-card">
                        <img
                            src="https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?w=400&h=300&q=80"
                            alt="Fine Dining"
                        />
                        <h3>Fine Dining</h3>
                    </div>
                    <div className="category-card">
                        <img
                            src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&q=80"
                            alt="Casual Dining"
                        />
                        <h3>Casual Dining</h3>
                    </div>
                    <div className="category-card">
                        <img
                            src="https://images.unsplash.com/photo-1513185158878-8d8c2a2a3da3?w=400&h=300&q=80"
                            alt="Fast Food"
                        />
                        <h3>Fast Food</h3>
                    </div>
                </div>
            </div>

            {restaurants.length > 0 && (
                <div className="restaurants-section">
                    <h2>Restaurants Near You</h2>
                    <div className="restaurants-grid">
                        {restaurants.map((restaurant) => (
                            <div key={restaurant.place_id} className="restaurant-card">
                                <h3>{restaurant.name}</h3>
                                <p>{restaurant.vicinity}</p>
                                <p>Rating: {restaurant.rating} ⭐</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;