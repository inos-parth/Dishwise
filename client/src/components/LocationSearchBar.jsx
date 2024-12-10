import React, { useState } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import './LocationSearchBar.css';

const libraries = ['places'];

const LocationSearchBar = () => {
  const [searchInput, setSearchInput] = useState('');
  const [showLocationOptions, setShowLocationOptions] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, // Replace with your API key
    libraries: libraries,
  });

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBKm9cPiFuU_VtDB3nhtvolKI1JQG2_gso`
            );
            const data = await response.json();
            if (data.results[0]) {
              setSearchInput(data.results[0].formatted_address);
              setShowLocationOptions(false);
            }
          } catch (error) {
            console.error("Error getting location:", error);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const initializeAutocomplete = (input) => {
    if (!isLoaded) return;
    
    const autocomplete = new window.google.maps.places.Autocomplete(input, {
      types: ['(cities)'],
      componentRestrictions: { country: "us" } // Restrict to US locations
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        setSearchInput(place.formatted_address);
        setShowLocationOptions(false);
      }
    });
  };

  const handleFocus = () => {
    setShowLocationOptions(true);
  };

  if (loadError) return "Error loading maps";
  if (!isLoaded) return "Loading...";

  return (
    <div className="location-search-container">
      <div className="search-input-wrapper">
        <i className="fas fa-search search-icon"></i>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onFocus={handleFocus}
          placeholder="Enter location..."
          className="location-search-input"
          ref={(input) => input && initializeAutocomplete(input)}
        />
      </div>
      
      {showLocationOptions && (
        <div className="location-options">
          <button 
            className="use-current-location"
            onClick={getCurrentLocation}
          >
            <i className="fas fa-location-arrow"></i>
            Use current location
          </button>
          <div className="location-divider">or</div>
          <div className="search-prompt">
            Enter your city, state, or zip code
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSearchBar;