import React, { useEffect, useRef, useState } from "react";
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
import { decodePolyline, fetchRouteFromORS, drawRoute, getUpdatedRoute } from "../UtilsFunctions/MapUtils";

const MapModal = ({ open, onOpenChange, offerRide }) => {
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

    const handleAcceptRide = () => {
        console.log("Ride accepted");
    };

    const handleDeclineRide = () => {
        console.log("Ride declined");
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

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(map);

            L.marker([31.5395453, 74.3016998]).addTo(map).bindPopup("🟢 Start");
            L.marker([31.5181999, 74.2926025]).addTo(map).bindPopup("🟡 Stop");
            L.marker([31.4810999, 74.303364]).addTo(map).bindPopup("🔴 Destination");

            if (buttonFlag) {
                L.Control.geocoder({
                    collapsed: false,
                    placeholder: "Search for a location",
                    geocoder: L.Control.Geocoder.nominatim(),
                }).addTo(map);

                const geocoderInput = document.querySelector(".leaflet-control-geocoder-form input");
                if (geocoderInput) {
                    geocoderInput.className = "px-3 py-2 rounded border border-input shadow-sm w-64 text-sm";
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
                    routeLayerRef.current = await drawRoute(map, updatedRoute, setError, setErrorMsg, setConfirmEnabled, setSelectedLatLng);
                });
            }

            routeLayerRef.current = await drawRoute(map, baseRoute, setError, setErrorMsg, setConfirmEnabled, setSelectedLatLng);
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
                        <>
                            {buttonFlag && (
                                <button
                                    className={`mt-2 px-4 py-2 bg-primary  text-white rounded shadow ${confirmEnabled ? "hover:bg-primary/90" : "opacity-50 cursor-not-allowed"
                                        }`}
                                    disabled={!confirmEnabled}
                                >
                                    Confirm Location
                                </button>
                            )}
                            {offerRide && (
                                <><div className="mt-2 flex space-x-2">
                                    <button
                                        className="px-4 py-2 mr-6 bg-primary  dark:bg-primary-900/20 dark:text-white  dark:hover:bg-button-hover/60 transition-colors text-white rounded shadow hover:bg-primary/90"
                                        onClick={handleAcceptRide}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-red-600  dark:text-white  dark:bg-button-dark dark:hover:bg-button-hover  text-white rounded shadow hover:bg-red-700"
                                        onClick={handleDeclineRide}
                                    >
                                        Decline
                                    </button>
                                </div>

                                </>
                            )}
                        </>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MapModal;
