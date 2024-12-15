import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoadScript } from "@react-google-maps/api";
import './LandingPage.css';


const LandingPage = () => {
    const libraries = useMemo(() => ['places', 'marker'], []);
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries,
        mapIds: ["3d323ae4d3f413fd"]
    });

    useEffect(() => {
        if (loadError) {
            console.error('Google Maps API loading error:', loadError);
        }
    }, [loadError]);


    const navigateToResults = useCallback((address, coordinates) => {
        navigate('/restaurants', {
            state: {
                searchLocation: {
                    address,
                    coordinates
                }
            }
        });
    }, [navigate]);

    useEffect(() => {
        if (!isLoaded) return;

        const initializeAutocomplete = () => {
            const input = document.getElementById('location-search');
            if (!input) return;

            const autocomplete = new window.google.maps.places.Autocomplete(input, {
                componentRestrictions: { country: "us" }
            });

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place.geometry && place.geometry.location) {
                    setSearchInput(place.formatted_address);
                    navigateToResults(
                        place.formatted_address,
                        {
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng()
                        }
                    );
                }
            });
        };

        initializeAutocomplete();
    }, [isLoaded, navigateToResults]);

    const handleSearch = () => {
        if (!searchInput || !isLoaded) return;

        const geocoder = new window.google.maps.Geocoder();
        setLoading(true);

        geocoder.geocode({ address: searchInput }, (results, status) => {
            setLoading(false);
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                navigateToResults(
                    searchInput,
                    {
                        lat: location.lat(),
                        lng: location.lng()
                    }
                );
            } else {
                setError('Could not find this location');
            }
        });
    };

    if (loadError) return <div>Error loading Google Maps API. Please try again later.</div>;
    if (!isLoaded) return <div>Loading Google Maps...</div>;

    return (
        <div className="landing-page">
            <div className="hero-section">
                <h1>Find your next favorite restaurant</h1>
                <div className="main-search">
                    <div className="search-container">
                        <input
                            id="location-search"
                            type="text"
                            placeholder="Enter any address..."
                            className="main-search-input"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            className="main-search-button"
                            disabled={loading}
                            onClick={handleSearch}
                        >
                            <i className="fas fa-search"></i>
                        </button>
                    </div>

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
        </div>
    );
};

export default LandingPage;