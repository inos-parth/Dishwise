import React, { useState, useEffect } from 'react';
import './LocationSearchBar.css';

const LocationSearchBar = ({ onLocationSelect }) => {
  const [searchInput, setSearchInput] = useState('');
  const [showLocationOptions, setShowLocationOptions] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            if (!window.google || !window.google.maps) return;
            
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode(
              { location: { lat: latitude, lng: longitude } },
              (results, status) => {
                if (status === 'OK' && results[0]) {
                  setSearchInput(results[0].formatted_address);
                  setShowLocationOptions(false);
                  onLocationSelect?.({
                    address: results[0].formatted_address,
                    coordinates: { lat: latitude, lng: longitude }
                  });
                }
              }
            );
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

  useEffect(() => {
    if (!window.google || !window.google.maps) return;

    const input = document.getElementById('location-search-input');
    if (!input) return;

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        componentRestrictions: { country: "us" }
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          setSearchInput(place.formatted_address);
          setShowLocationOptions(false);
          
          onLocationSelect?.({
            address: place.formatted_address,
            coordinates: { lat, lng },
            placeDetails: place
          });
        }
      });

      return () => {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      };
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
    }
  }, [isLoaded, onLocationSelect]);

  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleFocus = () => {
    setShowLocationOptions(true);
  };

  const handleBlur = () => {
    setTimeout(() => setShowLocationOptions(false), 200);
  };

  useEffect(() => {
    setIsLoaded(!!window.google?.maps);
  }, [window.google?.maps]);

  return (
    <div className="location-search-container">
      <div className="search-input-wrapper">
        <i className="fas fa-search search-icon"></i>
        <input
          id="location-search-input"
          type="text"
          value={searchInput}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Enter any address, place, or landmark..."
          className="location-search-input"
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
            Enter any address, place, neighborhood, or landmark
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSearchBar;