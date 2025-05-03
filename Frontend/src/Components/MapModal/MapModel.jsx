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

import MapContainer from "./MapContainer";
import FooterActions from "./FooterActions";
import UpcomingRideActions from "./UpcomingRideActions";
import StopsSidebar from "./StopsSideBar";
import { Loader2 } from "lucide-react";
import Button from "../ui/Button";

const MapModal = ({ open, onOpenChange, activeTab }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const routeLayerRef = useRef(null);
    const markerRef = useRef(null);
    const stopMarkersRef = useRef([]);

    const [stops, setStops] = useState([
        { lat: 31.5395453, lng: 74.3016998, label: "Start" },
        { lat: 31.5181999, lng: 74.2926025, label: "Stop" },
        { lat: 31.4810999, lng: 74.303364, label: "Destination" },
    ]);

    const [selectedLatLng, setSelectedLatLng] = useState(null);
    const [confirmEnabled, setConfirmEnabled] = useState(false);
    const [buttonFlag, setButtonFlag] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const location = useLocation();

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
