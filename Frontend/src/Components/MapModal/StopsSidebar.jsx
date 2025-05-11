import React, { useState, memo, useEffect } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../Authentication/redux/axiosInstance";
import ConfirmModal from "../ui/comfirmModal";
import { useDispatch } from "react-redux";
import { removeStopFromRide } from "../Authentication/redux/upcomingRidesSlice";
import { useSelector } from "react-redux";
const StopsSidebar = memo(({
    stops,
    setStops,
    stopMarkersRef,
    mapInstanceRef,
    routeLayerRef,
    activeTab,
    rideId
}) => {
    const [showModal, setShowModal] = useState(false);
    const [stopToDeleteIndex, setStopToDeleteIndex] = useState(null);
    const { userDetails } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const handleCancelStopCondition = () => {
    for (const stop of stops) {
        if (stop.userId === userDetails.id) {
            return false;
        }
    }
    return true;
};
    const handleConfirmRemove = async () => {
        const index = stopToDeleteIndex;
        setShowModal(false);

        try {
            const stop = stops[index];
            await axiosInstance.delete(`/stop/${stop.id}`);
            toast.success("Stop removed successfully");

            const updatedStops = stops.filter((_, j) => j !== index);
            setStops(updatedStops);

            // Update Redux ride data
            dispatch(removeStopFromRide({ rideId, stopId: stop.id }));


            if (stopMarkersRef.current?.[index] && mapInstanceRef.current?.removeLayer) {
                mapInstanceRef.current.removeLayer(stopMarkersRef.current[index]);
                stopMarkersRef.current.splice(index, 1);
            }

            if (routeLayerRef.current && mapInstanceRef.current?.removeLayer) {
                mapInstanceRef.current.removeLayer(routeLayerRef.current);
            }
        } catch (error) {

            toast.error("Failed to remove stop. Please try again.");
        }
    };
    const confirmRemoveStop = (index) => {
        setStopToDeleteIndex(index);
        setShowModal(true);
    };

    const safeStops = Array.isArray(stops) ? stops : [];

    return (
        <>
            <ConfirmModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleConfirmRemove}
                message="Do you really want to remove this stop?"
            />

            <div className="w-full md:w-1/3 border border-muted p-3 rounded-lg bg-muted/50 overflow-y-auto max-h-[400px]">
                <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Stops</h4>

                <ul className="space-y-2 text-sm">
                    {safeStops.length > 0 ?
                        safeStops
                            .map((stop, actualIndex) => ({ ...stop, actualIndex }))
                            .filter((stop) => stop.label === "Stop")
                            .map((stop, i) => (
                                <li
                                    key={stop.id || `stop-${i}-${stop.lat}-${stop.lng}`}
                                    className="flex items-center justify-between bg-white dark:bg-background border rounded px-3 py-2"
                                >
                                    <div className="flex-1 pr-2">
                                        <div className="font-medium">{stop.label}</div>
                                        {stop.lat !== undefined && stop.lng !== undefined && (
                                            <div className="text-xs text-muted-foreground">
                                                {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                                            </div>
                                        )}
                                        {stop.name && (
                                            <div className="text-xs text-muted-foreground break-words">
                                                {stop.name}
                                            </div>

                                        )}
                                    </div>
                                    {activeTab === "upcoming" &&handleCancelStopCondition()&& (
                                        <button
                                            className="text-red-500 hover:text-red-700 flex-shrink-0"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                confirmRemoveStop(stop.actualIndex);
                                            }}
                                        >
                                            ✖
                                        </button>
                                    )}
                                </li>
                            )
                            ) : (
                            <li className="text-center text-muted-foreground py-2">No stops available</li>
                        )}
                </ul>
            </div>
        </>
    );
});

StopsSidebar.displayName = 'StopsSidebar';

export default StopsSidebar;
