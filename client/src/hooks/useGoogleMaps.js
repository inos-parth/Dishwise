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

    const initMap = useCallback(
        async (filters = {}) => {
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
                    mapId: "3d323ae4d3f413fd",
                });

                const service = new window.google.maps.places.PlacesService(mapRef.current);

                const request = {
                    location: coordinates,
                    keyword: `food ${filters.cuisine || ""}`.trim(),
                    rankBy: window.google.maps.places.RankBy.DISTANCE,
                };

                if (filters.openNow) {
                    request.openNow = true;
                }

                const results = await new Promise((resolve, reject) => {
                    service.nearbySearch(request, (results, status) => {
                        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                            resolve(results);
                        } else {
                            reject(new Error(`Places API error: ${status}`));
                        }
                    });
                });

                // Filter results by minimum rating (if specified)
                const filteredResults = filters.minRating
                    ? results.filter((place) => place.rating >= filters.minRating)
                    : results;

                const sortedResults = filters.minRating
                    ? filteredResults.sort((a, b) => b.rating - a.rating)
                    : filteredResults;

                // Add markers for sorted results
                sortedResults.forEach((place) => {
                    if (place.geometry?.location) {
                        const marker = new window.google.maps.Marker({
                            position: place.geometry.location,
                            map: mapRef.current,
                            title: place.name,
                        });

                        const infowindow = new window.google.maps.InfoWindow({
                            content: `
                            <div>
                                <h3>${place.name}</h3>
                                <p>${place.vicinity}</p>
                                <p>${place.rating ? `${place.rating} ⭐` : "No rating"}</p>
                            </div>
                        `,
                        });

                        marker.addListener("click", () => {
                            infowindow.open(mapRef.current, marker);
                        });

                        markersRef.current.push(marker);
                    }
                });

                // Update restaurants state
                setRestaurants(sortedResults);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                throw err;
            }
        },
        [searchLocation]
    );



    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearMarkers();
        };
    }, []);

    return { restaurants, loading, error, initMap };
};