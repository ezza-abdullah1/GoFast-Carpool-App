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

const MapModal = ({ open, onOpenChange }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [selectedLatLng, setSelectedLatLng] = useState(null);
    const [confirmEnabled, setConfirmEnabled] = useState(false);
    const [buttonFlag, setButtonFlag] = useState(false);
    const location = useLocation();

    const routeCoords = [
        [74.3016998, 31.5395453],
        [74.2926025390625, 31.518199920654297],
        [74.303364, 31.4810999]
    ];

    const decodePolyline = (polyline) => {
        let index = 0, lat = 0, lng = 0, coordinates = [];
        while (index < polyline.length) {
            let b, shift = 0, result = 0;
            do {
                b = polyline.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            let dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
            lat += dlat;

            shift = 0;
            result = 0;
            do {
                b = polyline.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            let dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
            lng += dlng;

            coordinates.push([lat / 1e5, lng / 1e5]);
        }
        return coordinates;
    };

    useEffect(() => {
        if (!open) return;

        setTimeout(() => {
            const L = window.L;
            if (!mapRef.current || mapRef.current.children.length > 0) return;

            const map = L.map(mapRef.current).setView([31.52, 74.30], 12);
            mapInstanceRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
            }).addTo(map);

            L.marker([31.5395453, 74.3016998]).addTo(map).bindPopup("🟢 Start");
            L.marker([31.5181999, 74.2926025]).addTo(map).bindPopup("🟡 Stop");
            L.marker([31.4810999, 74.303364]).addTo(map).bindPopup("🔴 Destination");

            axios.post("https://api.openrouteservice.org/v2/directions/driving-car", {
                coordinates: routeCoords
            }, {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "5b3ce3597851110001cf624816bc06dddea04b2c81243b68a7ffc44c"
                }
            })
                .then(response => {
                    const geometry = response.data.routes[0].geometry;
                    const decoded = decodePolyline(geometry);
                    const routeLine = L.polyline(decoded, { color: "blue" }).addTo(map);
                    map.fitBounds(routeLine.getBounds());
                })
                .catch(console.error);

            let marker;
            if (buttonFlag) {
                map.on("click", (e) => {
                    const { lat, lng } = e.latlng;
                    if (marker) {
                        map.removeLayer(marker);
                    }
                    marker = L.marker([lat, lng]).addTo(map);
                    setSelectedLatLng([lat, lng]);
                    setConfirmEnabled(true);
                });
            }
        }, 100);
    }, [open, buttonFlag]);

    useEffect(() => {
        if (location.pathname === "/carpools") {
            setButtonFlag(true);
        } else {
            setButtonFlag(false);
        }
    }, [location.pathname]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0">
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
                                className={`mt-2 px-4 py-2 bg-primary text-white rounded shadow ${confirmEnabled ? "hover:bg-primary/90" : "opacity-50 cursor-not-allowed"}`}
                                disabled={!confirmEnabled}
                            >
                                Confirm Location
                            </button>
                        )}
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MapModal;
