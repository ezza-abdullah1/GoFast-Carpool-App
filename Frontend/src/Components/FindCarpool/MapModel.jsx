import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "../ui/dialog";
import { MapPin } from "lucide-react";
import { useLocation } from "react-router-dom";
import AlertBox from "../ui/AlertBox"; 

const decodePolyline = (polyline) => {
    let index = 0, lat = 0, lng = 0, coordinates = [];
    while (index < polyline.length) {
        let b, shift = 0, result = 0;
        do {
            b = polyline.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
        lat += dlat;
        shift = 0;
        result = 0;
        do {
            b = polyline.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
        lng += dlng;
        coordinates.push([lat / 1e5, lng / 1e5]);
    }
    return coordinates;
};


const MapModal = ({ open, onOpenChange }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const routeLayerRef = useRef(null);
    const markerRef = useRef(null);

    const [selectedLatLng, setSelectedLatLng] = useState(null);
    const [confirmEnabled, setConfirmEnabled] = useState(false);
    const [buttonFlag, setButtonFlag] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [error, setError] = useState(false);
    const location = useLocation();

    const baseRoute = [
        [74.3016998, 31.5395453],
        [74.2926025, 31.5181999],
        [74.303364, 31.4810999],
    ];
    const drawRoute = async (map, coordinates, setErrorMsg) => {
        try {
            const response = await axios.post(
                "https://api.openrouteservice.org/v2/directions/driving-car",
                { coordinates },
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: "5b3ce3597851110001cf624816bc06dddea04b2c81243b68a7ffc44c",
                    },
                }
            );
            const geometry = response.data.routes[0].geometry;
            const decoded = decodePolyline(geometry);
            const routeLine = window.L.polyline(decoded, { color: "blue" }).addTo(map);
            map.fitBounds(routeLine.getBounds());
            setError(false);
            return routeLine;

        } catch (error) {
            setConfirmEnabled(false);
            setError(true);
            setSelectedLatLng(null);
            console.error("Failed to load route", error);
            if(selectedLatLng){
            setErrorMsg("Invalid location selected. Please try again.");
            }else{
                setErrorMsg("Unable to load route. Please try again later.");
            }
            return null;
        }
    };

    const getUpdatedRoute = (customStop, baseRoute) => {
        if (!customStop) return baseRoute;
        const newStop = [customStop[1], customStop[0]];
        const updatedRoute = [...baseRoute];
        updatedRoute.splice(-1, 0, newStop);
        return updatedRoute;
    };

    useEffect(() => {
        setButtonFlag(location.pathname === "/carpools");
    }, [location.pathname]);

    useEffect(() => {
        if (!open) return;

        setTimeout(async () => {
            const L = window.L;
            if (!mapRef.current || mapRef.current.children.length > 0) return;

            const map = L.map(mapRef.current).setView([31.52, 74.30], 12);
            mapInstanceRef.current = map;

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 18,
            }).addTo(map);

            L.marker([31.5395453, 74.3016998]).addTo(map).bindPopup("🟢 Start");
            L.marker([31.5181999, 74.2926025]).addTo(map).bindPopup("🟡 Stop");
            L.marker([31.4810999, 74.303364]).addTo(map).bindPopup("🔴 Destination");

            if (buttonFlag) {
                const geocoder = L.Control.geocoder({
                    collapsed: false,
                    placeholder: "Search for a location",
                    geocoder: L.Control.Geocoder.nominatim(),
                }).addTo(map);

                // Style the search input
                const geocoderInput = document.querySelector(".leaflet-control-geocoder-form input");
                if (geocoderInput) {
                    geocoderInput.className =
                        "px-3 py-2 rounded border border-input shadow-sm w-64 text-sm";
                }

                map.on("click", async (e) => {
                    const { lat, lng } = e.latlng;
                    setSelectedLatLng([lat, lng]);
                    setConfirmEnabled(true);
                    setErrorMsg("");

                    if (markerRef.current) {
                        map.removeLayer(markerRef.current);
                    }
                    markerRef.current = L.marker([lat, lng]).addTo(map).bindPopup("🟣 Your Stop").openPopup();

                    const updatedRoute = getUpdatedRoute([lat, lng], baseRoute);
                    if (routeLayerRef.current) {
                        map.removeLayer(routeLayerRef.current);
                    }
                    routeLayerRef.current = await drawRoute(map, updatedRoute, setErrorMsg);
                });
            }

            routeLayerRef.current = await drawRoute(map, baseRoute, setErrorMsg);
        }, 100);
    }, [open, buttonFlag]);

    useEffect(() => {
        if (!open) {
            setConfirmEnabled(false);
            setSelectedLatLng(null);
            setErrorMsg("");
            if (mapRef.current) mapRef.current.innerHTML = "";
        }
    }, [open]);

    return (
        <>

            <Dialog open={open} onOpenChange={onOpenChange}>
        
                <DialogContent className="max-w-2xl p-0">
                {error && <AlertBox message={errorMsg} onClose={() => setError(false)} />}
                    <DialogHeader className="px-6 pt-6">
                        <DialogTitle>
                            <span className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                Select Pickup Location
                            </span>
                        </DialogTitle>
                        <DialogDescription>
                            Choose your preferred pickup spot using the map below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="px-6 pb-6 pt-2 min-h-[450px] flex flex-col items-center justify-center">
                        <div
                            ref={mapRef}
                            className="rounded-lg w-full h-[350px] mb-4 border border-dashed border-input"
                        />
                        <DialogClose asChild>
                            {buttonFlag && (
                                <button
                                    className={`mt-2 px-4 py-2 bg-primary text-white rounded shadow ${confirmEnabled ? "hover:bg-primary/90" : "opacity-50 cursor-not-allowed"
                                        }`}
                                    disabled={!confirmEnabled}
                                >
                                    Confirm Location
                                </button>
                            )}
                        </DialogClose>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default MapModal;
