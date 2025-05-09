import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { toast } from "react-hot-toast";
import MapContainer from "./MapContainer";
import FooterActions from "./FooterActions";
import UpcomingRideActions from "./UpcomingRideActions";
import StopsSidebar from "./StopsSideBar";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import axiosInstance from "../Authentication/redux/axiosInstance";
import { getLocationName } from "../UtilsFunctions/LocationName";

const MapModal = ({ open, rideId, onOpenChange, activeTab, route, stop }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const routeLayerRef = useRef(null);
    const markerRef = useRef(null);
    const stopMarkersRef = useRef([]);
    const { userDetails } = useSelector((state) => state.user);
    const [selectedLatLng, setSelectedLatLng] = useState(null);
    const [confirmEnabled, setConfirmEnabled] = useState(false);
    const [buttonFlag, setButtonFlag] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    const [stops, setStops] = useState([]);
   

    const convertAllToStops = useCallback((router, stops) => {
        const result = [];

        if (router?.pickup) {
            const lat = router.pickup.latitude ?? 31.5395453;
            const lng = router.pickup.longitude ?? 74.3016998;
            result.push({
                lat,
                lng,
                label: "Start",
            });
        }

        if (Array.isArray(stops)) {
            stops.forEach((stop) => {
                const lat = stop?.location?.latitude;
                const lng = stop?.location?.longitude;
                const id = stop?._id || stop?.id;
                const name = stop?.location?.name;

                if (lat != null && lng != null) {
                    result.push({ id, lat, lng, name, label: "Stop" });
                }
            });
        }

        if (router?.dropoff) {
            const lat = router.dropoff.latitude ?? 31.4810999;
            const lng = router.dropoff.longitude ?? 74.303364;
            result.push({
                lat,
                lng,
                label: "Destination",
            });
        }

        return result;
    }, []);

    useEffect(() => {
        if (open) { // Only process when modal is open
            const formattedStops = convertAllToStops(route, stop);
            setStops(formattedStops);
        }
    }, [route, stop, convertAllToStops, open]); // Changed dependency from stopEnds to stop

    const saveStopRequest = async () => {
        if (!selectedLatLng) {
            toast.error("Please select a location first.");
            return;
        }

        const { lat, lng } = selectedLatLng;
        if (!selectedLatLng || selectedLatLng.lat === undefined || selectedLatLng.lng === undefined) {
            toast.error("Invalid location selected.");
            return;
        }

        let locationName = await getLocationName(lat, lng);

        const stopData = {
            rideId,
            userId: userDetails.id,
            location: {
                name: locationName,
                latitude: lat,
                longitude: lng,
            },
            status: "pending",
        };

        axiosInstance.post("/stop", stopData)
            .then(() => {
                toast.success("Request sent");
            })
            .catch(() => {
                toast.error("Error sending request");
            });
    };

    useEffect(() => {
        setButtonFlag(location.pathname === "/carpools");
    }, [location.pathname]);

    useEffect(() => {
        if (!open) {
            setConfirmEnabled(false);
            setSelectedLatLng(null);
            setErrorMsg("");
            if (mapRef.current) mapRef.current.innerHTML = "";
        }
    }, [open]);

    const noSidebar = activeTab !== "upcoming";
    const noFooter = !buttonFlag && !confirmEnabled && activeTab !== "offers";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">

                {error && <AlertBox message={errorMsg} onClose={() => setError(false)} />}

                <DialogHeader className="px-6 pt-6">
                    <DialogTitle>
                        <span className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            {buttonFlag ? "Select Pickup Location" : "Carpool Map"}


                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        Choose your preferred pickup spot using the map below.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col md:flex-row gap-4 px-6 pb-6 pt-2">
                    {activeTab !== "offer" && (
                        <StopsSidebar
                            stops={stops}
                            setStops={setStops}
                            stopMarkersRef={stopMarkersRef}
                            mapInstanceRef={mapInstanceRef}
                            routeLayerRef={routeLayerRef}
                            activeTab={activeTab}
                        />
                    )}

                    <div className="flex-1 relative">
                        {loading && (
                            <div
                                className="absolute inset-0 z-10 flex items-center justify-center bg-white/70"
                                role="status"
                                aria-live="polite"
                            >
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <span className="sr-only">Loading...</span>
                            </div>
                        )}




                        <MapContainer
                            setLoading={setLoading}
                            mapRef={mapRef}
                            mapInstanceRef={mapInstanceRef}
                            markerRef={markerRef}
                            stopMarkersRef={stopMarkersRef}
                            routeLayerRef={routeLayerRef}
                            stops={stops}
                            setStops={setStops}
                            setSelectedLatLng={setSelectedLatLng}
                            setConfirmEnabled={setConfirmEnabled}
                            setError={setError}
                            setErrorMsg={setErrorMsg}
                            buttonFlag={buttonFlag}
                            open={open}

                        />

                        {!noFooter && (
                            <DialogClose asChild>
                                <div>
                                    <FooterActions
                                        buttonFlag={buttonFlag}
                                        confirmEnabled={confirmEnabled}
                                        activeTab={activeTab}
                                        saveStopRequest={saveStopRequest}
                                    />
                                </div>
                            </DialogClose>
                        )}
                        {
                            noFooter && (
                                <DialogClose asChild>
                                    <div>
                                        <UpcomingRideActions
                                            activeTab={activeTab}
                                        />
                                    </div>
                                </DialogClose>
                            )
                        }


                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MapModal;
