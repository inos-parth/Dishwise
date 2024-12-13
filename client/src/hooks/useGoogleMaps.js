// src/hooks/useGoogleMap.js
import { useState, useCallback, useRef, useEffect } from 'react';

export const useGoogleMap = (searchLocation) => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const markersRef = useRef([]);
    const mapRef = useRef(null);

    const clearMarkers = () => {
        if (markersRef.current) {
            markersRef.current.forEach(marker => marker.setMap(null));
            markersRef.current = [];
        }
    };

    const initMap = useCallback(async () => {
        if (!window.google) {
            throw new Error("Google Maps not loaded");
        }

        try {
            clearMarkers();

            if (!searchLocation?.coordinates?.lat || !searchLocation?.coordinates?.lng) {
                throw new Error("Invalid location coordinates");
            }

            const coordinates = new window.google.maps.LatLng(
                searchLocation.coordinates.lat,
                searchLocation.coordinates.lng
            );

            mapRef.current = new window.google.maps.Map(document.getElementById("map"), {
                center: coordinates,
                zoom: 14,
                mapId: "3d323ae4d3f413fd"
            });

            const service = new window.google.maps.places.PlacesService(mapRef.current);

            const results = await new Promise((resolve, reject) => {
                service.nearbySearch({
                    location: coordinates,
                    radius: 5000,
                    type: 'restaurant'  // Change from ["restaurant"] to 'restaurant'
                }, (results, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                        resolve(results);
                    } else {
                        reject(new Error(`Places API error: ${status}`));
                    }
                });
            });

            // Create markers for each restaurant
            results.forEach(restaurant => {
                if (restaurant.geometry?.location) {
                    const marker = new window.google.maps.Marker({
                        position: restaurant.geometry.location,
                        map: mapRef.current,
                        title: restaurant.name
                    });

                    const infowindow = new window.google.maps.InfoWindow({
                        content: `
                            <div>
                                <h3>${restaurant.name}</h3>
                                <p>${restaurant.vicinity}</p>
                                <p>${restaurant.rating ? `${restaurant.rating} ⭐` : "No rating"}</p>
                            </div>
                        `
                    });

                    marker.addListener('click', () => {
                        infowindow.open(mapRef.current, marker);
                    });

                    markersRef.current.push(marker);
                }
            });

            setRestaurants(results);
            setLoading(false);
            return results;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    }, [searchLocation]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearMarkers();
        };
    }, []);

    return { restaurants, loading, error, initMap };
};