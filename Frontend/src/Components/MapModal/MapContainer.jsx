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
    const isMapValid = useCallback((map) => {
        try {
            return map && map._container && map._container.isConnected && document.body.contains(map._container);
        } catch (e) {
            return false;
        }
    }, []);
    
    const safeMapOperation = useCallback((operation, fallback = null) => {
        try {
            if (!mapInstanceRef.current || !isMapValid(mapInstanceRef.current)) {
                return fallback;
            }
            return operation(mapInstanceRef.current);
        } catch (e) {
            return fallback;
        }
    }, [isMapValid]);

    useEffect(() => {
        if (!open) {
            if (mapInstanceRef.current) {
                try {
                    mapInstanceRef.current.remove();
                } catch (err) {}
                mapInstanceRef.current = null;
            }
            return;
        }

        if (!mapRef.current) return;

        if (!mapRef.current.offsetParent || !mapRef.current.isConnected) return;

        if (mapInstanceRef.current && isMapValid(mapInstanceRef.current)) {
            return;
        }

        try {
            const L = window.L;
            if (!L) return;

            if (mapInstanceRef.current) {
                try {
                    mapInstanceRef.current.remove();
                } catch (err) {}
                mapInstanceRef.current = null;
            }

            if (mapRef.current.childNodes.length > 0) {
                while (mapRef.current.firstChild) {
                    mapRef.current.removeChild(mapRef.current.firstChild);
                }
            }

            const map = L.map(mapRef.current).setView([31.52, 74.3], 10);
            mapInstanceRef.current = map;

            try {
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    maxZoom: 18,
                }).addTo(map);
            } catch (err) {
                setError(true);
                setErrorMsg("Failed to load map tiles");
                return;
            }

            if (buttonFlag && L.Control.geocoder) {
                try {
                    const geocoder = L.Control.geocoder({
                        collapsed: false,
                        placeholder: "Search for a location",
                        geocoder: L.Control.Geocoder.nominatim(),
                    });
                    geocoder.addTo(map);
                    
                    setTimeout(() => {
                        try {
                            const input = document.querySelector(".leaflet-control-geocoder-form input");
                            if (input) {
                                input.className = "px-3 py-2 rounded border border-input shadow-sm w-64 dark:text-black text-sm";
                            }
                        } catch (err) {}
                    }, 300);
                } catch (err) {}
            }

            if (stops && stops.length > 0) {
                setLoading(true);
            }

            setTimeout(() => {
                if (isMapValid(map)) {
                    try {
                        map.invalidateSize();
                    } catch (err) {}
                }
            }, 400);
        } catch (err) {
            mapInstanceRef.current = null;
            setError(true);
            setErrorMsg("Failed to initialize map");
        }
    }, [open, buttonFlag, stops, setLoading, setError, setErrorMsg, isMapValid]);

    useEffect(() => {
        if (!mapInstanceRef.current || !open || !buttonFlag || !isMapValid(mapInstanceRef.current)) return;

        const map = mapInstanceRef.current;
        
        const handleClick = async (e) => {
            if (!isMapValid(map)) return;

            const { lat, lng } = e.latlng;
           
            setSelectedLatLng({ lat: e.latlng.lat, lng: e.latlng.lng });

            setConfirmEnabled(true);
            setErrorMsg("");

            if (markerRef.current) {
                try {
                    if (map.hasLayer(markerRef.current)) {
                        map.removeLayer(markerRef.current);
                    }
                } catch (err) {}
            }

            try {
                if (!isMapValid(map)) return;
                
                markerRef.current = window.L.marker([lat, lng]);
                markerRef.current.addTo(map).bindPopup("🟣 Your Stop").openPopup();
            } catch (err) {
                setError(true);
                setErrorMsg("Map rendering failed.");
                return;
            }

            await safeMapOperation(async (map) => {
                try {
                    map.eachLayer((layer) => {
                        if (layer instanceof window.L.Polyline && layer !== routeLayerRef.current) {
                            map.removeLayer(layer);
                        }
                    });

                    if (routeLayerRef.current && map.hasLayer(routeLayerRef.current)) {
                        map.removeLayer(routeLayerRef.current);
                    }
                    routeLayerRef.current = null;

                    const updatedRoute = getUpdatedRoute([lat, lng], stops.map((s) => [s.lng, s.lat]));

                    if (!isMapValid(map)) return;

                    routeLayerRef.current = await drawRoute(
                        map,
                        updatedRoute,
                        setError,
                        setErrorMsg,
                        setConfirmEnabled,
                        setSelectedLatLng
                    );
                } catch (err) {
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
                } catch (err) {}
            }
        };
    }, [stops, open, buttonFlag, setConfirmEnabled, setError, setErrorMsg, setSelectedLatLng, isMapValid, safeMapOperation]);

    useEffect(() => {
        if (!open) return;

        if (!isMapValid(mapInstanceRef.current)) return;

        if (!mapRef.current || !mapRef.current.isConnected || !mapRef.current.offsetParent) return;

        const map = mapInstanceRef.current;
        
        let isCancelled = false;

        const updateMap = async () => {
            setLoading(true);

            if (!isMapValid(map)) {
                if (!isCancelled) setLoading(false);
                return;
            }

            safeMapOperation((map) => {
                try {
                    if (typeof map.eachLayer === 'function') {
                        map.eachLayer((layer) => {
                            if (layer instanceof window.L.Polyline && layer !== routeLayerRef.current) {
                                map.removeLayer(layer);
                            }
                        });
                    }

                    if (routeLayerRef.current && typeof map.hasLayer === 'function' && 
                        map.hasLayer(routeLayerRef.current)) {
                        map.removeLayer(routeLayerRef.current);
                    }
                    routeLayerRef.current = null;
                } catch (err) {}
            });

            if (isCancelled) return;

            if (stops.length > 0) {
                const routeCoords = stops.map((s) => [s.lng, s.lat]);

                try {
                    await new Promise(resolve => setTimeout(resolve, 50));

                    if (!isMapValid(map)) {
                        if (!isCancelled) setLoading(false);
                        return;
                    }
                    
                    const newRouteLayer = await drawRoute(
                        map,
                        routeCoords,
                        setError,
                        setErrorMsg,
                        setConfirmEnabled,
                        setSelectedLatLng
                    );
                    
                    if (isCancelled) return;
                    
                    routeLayerRef.current = newRouteLayer;
                } catch (error) {
                    if (!isCancelled) {
                        setError(true);
                        setErrorMsg("Failed to draw route");
                    }
                }
            }

            if (isCancelled) return;

            await new Promise(resolve => setTimeout(resolve, 50));

            if (!isMapValid(map) || isCancelled) {
                if (!isCancelled) setLoading(false);
                return;
            }

            safeMapOperation((map) => {
                try {
                    if (stopMarkersRef.current && stopMarkersRef.current.length > 0) {
                        stopMarkersRef.current.forEach((marker) => {
                            if (marker && typeof map.hasLayer === 'function' && map.hasLayer(marker)) {
                                map.removeLayer(marker);
                            }
                        });
                    }
                    stopMarkersRef.current = [];

                    const newMarkers = stops.map((s, i) => {
                        const emoji = i === 0 ? "🟢" : i === stops.length - 1 ? "🔴" : "🟡";
                        return {
                            position: [s.lat, s.lng],
                            popup: `${emoji} ${s.label}`
                        };
                    });

                    if (!isMapValid(map)) return;

                    stopMarkersRef.current = newMarkers.map(({position, popup}) => {
                        try {
                            if (!isMapValid(map)) return null;
                            
                            const marker = window.L.marker(position);
                            marker.addTo(map).bindPopup(popup);
                            return marker;
                        } catch (err) {
                            return null;
                        }
                    }).filter(Boolean);
                } catch (err) {}
            });

            if (!isCancelled) setLoading(false);
        };

        updateMap();

        return () => {
            isCancelled = true;
        };
    }, [stops, open, setConfirmEnabled, setError, setErrorMsg, setLoading, setSelectedLatLng, isMapValid, safeMapOperation]);

    useEffect(() => {
        return () => {
            if (mapInstanceRef.current) {
                try {
                    if (typeof mapInstanceRef.current.eachLayer === 'function') {
                        mapInstanceRef.current.eachLayer(layer => {
                            try {
                                if (mapInstanceRef.current.hasLayer(layer)) {
                                    mapInstanceRef.current.removeLayer(layer);
                                }
                            } catch (e) {}
                        });
                    }
                    mapInstanceRef.current.remove();
                } catch (err) {
                    console.error("Error during map cleanup:", err);
                } finally {
                    mapInstanceRef.current = null;
                }
            }

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
