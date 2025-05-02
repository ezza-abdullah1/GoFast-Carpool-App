import React, { useEffect, useCallback } from "react";
import { drawRoute, getUpdatedRoute } from "../UtilsFunctions/MapUtils";

const MapContainer = ({
    mapRef,
    mapInstanceRef,
    markerRef,
    stopMarkersRef,
    routeLayerRef,
    stops,
    setStops,
    setSelectedLatLng,
    setConfirmEnabled,
    setError,
    setErrorMsg,
    buttonFlag,
    open,
    setLoading,
}) => {
    // Helper function to safely check if map is valid
    const isMapValid = useCallback((map) => {
        try {
            return map && map._container && map._container.isConnected && document.body.contains(map._container);
        } catch (e) {
            console.warn("Error checking map validity:", e);
            return false;
        }
    }, []);
    
    // Helper function to safely perform operations on map
    const safeMapOperation = useCallback((operation, fallback = null) => {
        try {
            if (!mapInstanceRef.current || !isMapValid(mapInstanceRef.current)) {
                return fallback;
            }
            return operation(mapInstanceRef.current);
        } catch (e) {
            console.error("Map operation failed:", e);
            return fallback;
        }
    }, [isMapValid]);

    // Initialize map when component is opened
    useEffect(() => {
        // Clean up existing map if dialog is closed
        if (!open) {
            if (mapInstanceRef.current) {
                try {
                    mapInstanceRef.current.remove();
                } catch (err) {
                    console.error("Error removing map:", err);
                }
                mapInstanceRef.current = null;
            }
            return;
        }

        // Don't proceed if map container isn't ready or map already exists
        if (!mapRef.current) {
            console.warn("Map ref is not available");
            return;
        }
        
        // Ensure DOM element is visible/attached
        if (!mapRef.current.offsetParent || !mapRef.current.isConnected) {
            console.warn("Map container is not visible or not in DOM");
            return;
        }
        
        // Don't reinitialize if map already exists
        if (mapInstanceRef.current && isMapValid(mapInstanceRef.current)) {
            return;
        }

        // Initialize map with error handling
        try {
            const L = window.L;
            if (!L) {
                console.error("Leaflet library not loaded");
                return;
            }
            
            // Clear any previous instance reference
            if (mapInstanceRef.current) {
                try {
                    mapInstanceRef.current.remove();
                } catch (err) {
                    console.error("Error cleaning up previous map:", err);
                }
                mapInstanceRef.current = null;
            }
            
            // Ensure the container is empty before creating a new map
            if (mapRef.current.childNodes.length > 0) {
                while (mapRef.current.firstChild) {
                    mapRef.current.removeChild(mapRef.current.firstChild);
                }
            }
            
            // Create a new map instance
            const map = L.map(mapRef.current).setView([31.52, 74.3], 12);
            mapInstanceRef.current = map;

            // Add tile layer with error handling
            try {
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    maxZoom: 18,
                }).addTo(map);
            } catch (err) {
                console.error("Failed to add tile layer:", err);
                setError(true);
                setErrorMsg("Failed to load map tiles");
                return;
            }

            // Add geocoder if button flag is true
            if (buttonFlag && L.Control.geocoder) {
                try {
                    const geocoder = L.Control.geocoder({
                        collapsed: false,
                        placeholder: "Search for a location",
                        geocoder: L.Control.Geocoder.nominatim(),
                    });
                    
                    geocoder.addTo(map);
                    
                    // Style geocoder input after it's been added to DOM
                    setTimeout(() => {
                        try {
                            const input = document.querySelector(".leaflet-control-geocoder-form input");
                            if (input) {
                                input.className = "px-3 py-2 rounded border border-input shadow-sm w-64 text-sm";
                            }
                        } catch (err) {
                            console.warn("Error styling geocoder:", err);
                        }
                    }, 300); // Increased timeout to ensure DOM is ready
                } catch (err) {
                    console.error("Failed to add geocoder:", err);
                }
            }

            if (stops && stops.length > 0) {
                setLoading(true);
            }
            
            // Invalidate map size after a small delay to handle any layout issues
            setTimeout(() => {
                if (isMapValid(map)) {
                    try {
                        map.invalidateSize();
                    } catch (err) {
                        console.warn("Error invalidating map size:", err);
                    }
                }
            }, 400);
        } catch (err) {
            console.error("Error initializing map:", err);
            mapInstanceRef.current = null;
            setError(true);
            setErrorMsg("Failed to initialize map");
        }
    }, [open, buttonFlag, stops, setLoading, setError, setErrorMsg, isMapValid]);

    // Handle click events on map
    useEffect(() => {
        if (!mapInstanceRef.current || !open || !buttonFlag || !isMapValid(mapInstanceRef.current)) return;

        const map = mapInstanceRef.current;
        
        const handleClick = async (e) => {
            // Ensure map is still valid
            if (!isMapValid(map)) return;

            const { lat, lng } = e.latlng;

            setSelectedLatLng([lat, lng]);
       
            setConfirmEnabled(true);
            setErrorMsg("");

            if (markerRef.current) {
                try {
                    if (map.hasLayer(markerRef.current)) {
                        map.removeLayer(markerRef.current);
                    }
                } catch (err) {
                    console.error("Failed to remove previous marker:", err);
                }
            }

            try {
                // Create marker but check map validity before adding
                if (!isMapValid(map)) return;
                
                markerRef.current = window.L.marker([lat, lng]);
                markerRef.current.addTo(map).bindPopup("🟣 Your Stop").openPopup();
            } catch (err) {
                console.error("Failed to add marker:", err);
                setError(true);
                setErrorMsg("Map rendering failed.");
                return;
            }

            // Clean up any existing route lines
            await safeMapOperation(async (map) => {
                try {
                    // Remove existing polylines
                    map.eachLayer((layer) => {
                        if (layer instanceof window.L.Polyline && layer !== routeLayerRef.current) {
                            map.removeLayer(layer);
                        }
                    });

                    if (routeLayerRef.current && map.hasLayer(routeLayerRef.current)) {
                        map.removeLayer(routeLayerRef.current);
                    }
                    routeLayerRef.current = null;

                    // Calculate updated route
                    const updatedRoute = getUpdatedRoute([lat, lng], stops.map((s) => [s.lng, s.lat]));

                    // Check map validity one last time
                    if (!isMapValid(map)) return;

                    // Draw the new route
                    routeLayerRef.current = await drawRoute(
                        map,
                        updatedRoute,
                        setError,
                        setErrorMsg,
                        setConfirmEnabled,
                        setSelectedLatLng
                    );
                } catch (err) {
                    console.error("Failed to update route:", err);
                    setError(true);
                    setErrorMsg("Unable to draw route.");
                }
            });
        };

        map.on("click", handleClick);

        return () => {
            if (map && typeof map.off === 'function') {
                try {
                    map.off("click", handleClick);
                } catch (err) {
                    console.error("Error removing click handler:", err);
                }
            }
        };
    }, [stops, open, buttonFlag, setConfirmEnabled, setError, setErrorMsg, setSelectedLatLng, isMapValid, safeMapOperation]);

    // Update map when stops change
    useEffect(() => {
        // Check if we should even try to update the map
        if (!open) return;
        
        // Use helper to safely check map validity
        if (!isMapValid(mapInstanceRef.current)) {
            console.warn("Map not valid for stop updates");
            return;
        }
        
        // Ensure map element is visible
        if (!mapRef.current || !mapRef.current.isConnected || !mapRef.current.offsetParent) {
            console.warn("Map container not visible for stop updates");
            return;
        }

        // Get local reference to map instance
        const map = mapInstanceRef.current;
        
        // Define a cancellation flag to handle race conditions
        let isCancelled = false;

        const updateMap = async () => {
            // Set loading state
            setLoading(true);
            
            // Perform a final validity check before proceeding
            if (!isMapValid(map)) {
                console.warn("Map became invalid before update started");
                if (!isCancelled) setLoading(false);
                return;
            }

            // STEP 1: Clean up existing routes
            safeMapOperation((map) => {
                try {
                    // Only iterate layers if eachLayer method exists
                    if (typeof map.eachLayer === 'function') {
                        map.eachLayer((layer) => {
                            if (layer instanceof window.L.Polyline && layer !== routeLayerRef.current) {
                                map.removeLayer(layer);
                            }
                        });
                    }
                    
                    // Remove current route layer if it exists and is on the map
                    if (routeLayerRef.current && typeof map.hasLayer === 'function' && 
                        map.hasLayer(routeLayerRef.current)) {
                        map.removeLayer(routeLayerRef.current);
                    }
                    routeLayerRef.current = null;
                } catch (err) {
                    console.error("Error cleaning up routes:", err);
                }
            });
            
            // Check if operation was cancelled
            if (isCancelled) return;

            // STEP 2: Draw new route if stops exist
            if (stops.length > 0) {
                const routeCoords = stops.map((s) => [s.lng, s.lat]);

                try {
                    // Add small delay to ensure DOM stability
                    await new Promise(resolve => setTimeout(resolve, 50));
                    
                    // Final validity check before drawing route
                    if (!isMapValid(map)) {
                        console.warn("Map became invalid before drawing route");
                        if (!isCancelled) setLoading(false);
                        return;
                    }
                    
                    // Only proceed with route drawing if the map is still valid
                    const newRouteLayer = await drawRoute(
                        map,
                        routeCoords,
                        setError,
                        setErrorMsg,
                        setConfirmEnabled,
                        setSelectedLatLng
                    );
                    
                    // Check if component was unmounted during async operation
                    if (isCancelled) return;
                    
                    routeLayerRef.current = newRouteLayer;
                } catch (error) {
                    console.error("Error drawing route:", error);
                    if (!isCancelled) {
                        setError(true);
                        setErrorMsg("Failed to draw route");
                    }
                }
            }
            
            // Check if operation was cancelled
            if (isCancelled) return;

            // STEP 3: Clean up and add stop markers with delay
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Final check before adding markers
            if (!isMapValid(map) || isCancelled) {
                if (!isCancelled) setLoading(false);
                return;
            }
            
            safeMapOperation((map) => {
                try {
                    // Remove existing markers
                    if (stopMarkersRef.current && stopMarkersRef.current.length > 0) {
                        stopMarkersRef.current.forEach((marker) => {
                            if (marker && typeof map.hasLayer === 'function' && map.hasLayer(marker)) {
                                map.removeLayer(marker);
                            }
                        });
                    }
                    stopMarkersRef.current = [];
                    
                    // Create markers without adding them first
                    const newMarkers = stops.map((s, i) => {
                        const emoji = i === 0 ? "🟢" : i === stops.length - 1 ? "🔴" : "🟡";
                        return {
                            position: [s.lat, s.lng],
                            popup: `${emoji} ${s.label}`
                        };
                    });
                    
                    // Check map validity one more time
                    if (!isMapValid(map)) {
                        console.warn("Map became invalid before adding markers");
                        return;
                    }
                    
                    // Now add all markers to map
                    stopMarkersRef.current = newMarkers.map(({position, popup}) => {
                        try {
                            // Double-check map is still valid
                            if (!isMapValid(map)) return null;
                            
                            const marker = window.L.marker(position);
                            marker.addTo(map).bindPopup(popup);
                            return marker;
                        } catch (err) {
                            console.error("Error adding marker:", err);
                            return null;
                        }
                    }).filter(Boolean); // Filter out any nulls
                } catch (err) {
                    console.error("Error managing stop markers:", err);
                }
            });
            
            // Finish loading only if not cancelled
            if (!isCancelled) setLoading(false);
        };

        // Start the update
        updateMap();

        // Cleanup function to handle unmounting during async operations
        return () => {
            isCancelled = true;
        };
    }, [stops, open, setConfirmEnabled, setError, setErrorMsg, setLoading, setSelectedLatLng, isMapValid, safeMapOperation]);

    // Cleanup on unmount - most critical for preventing memory leaks and DOM errors
    useEffect(() => {
        return () => {
            // Clean up map instance
            if (mapInstanceRef.current) {
                try {
                    // First remove all known layers to prevent event listener leaks
                    if (typeof mapInstanceRef.current.eachLayer === 'function') {
                        mapInstanceRef.current.eachLayer(layer => {
                            try {
                                if (mapInstanceRef.current.hasLayer(layer)) {
                                    mapInstanceRef.current.removeLayer(layer);
                                }
                            } catch (e) {
                                // Silently fail individual layer removals
                            }
                        });
                    }
                    
                    // Then remove map - this should also clean up any remaining layers
                    mapInstanceRef.current.remove();
                } catch (err) {
                    console.error("Error during map cleanup:", err);
                } finally {
                    // Always clear the refs even if cleanup fails
                    mapInstanceRef.current = null;
                }
            }
            
            // Clear all other refs
            if (markerRef.current) markerRef.current = null;
            if (stopMarkersRef.current) stopMarkersRef.current = [];
            if (routeLayerRef.current) routeLayerRef.current = null;
        };
    }, []);

    return (
        <div
            ref={mapRef}
            className="rounded-lg w-full h-[350px] mb-4 border border-dashed border-input"
        />
    );
};

export default MapContainer;