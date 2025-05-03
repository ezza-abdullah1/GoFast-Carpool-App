import React from "react";

const StopsSidebar = ({
    stops,
    setStops,
    stopMarkersRef,
    mapInstanceRef,
    routeLayerRef,
    activeTab
}) => {
    return (
        <div className="w-full md:w-1/3 border border-muted p-3 rounded-lg bg-muted/50 overflow-y-auto max-h-[400px]">
            <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Stops</h4>
            <ul className="space-y-2 text-sm">
                {stops
                    .map((stop, actualIndex) => ({ ...stop, actualIndex }))
                    .filter((stop) => stop.label === "Stop")
                    .map((stop, i) => (
                        <li
                            key={i}
                            className="flex items-center justify-between bg-white dark:bg-background border rounded px-3 py-2"
                        >
                            <div>
                                <div className="font-medium">{stop.label}</div>
                                <div className="text-xs text-muted-foreground">
                                    {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                                </div>
                            </div>
                            {activeTab === "upcoming" && 
                            <button
                                className="text-red-500 hover:text-red-700"
                                onClick={() => {
                                    const updatedStops = stops.filter((_, j) => j !== stop.actualIndex);
                                    setStops(updatedStops);

                                    if (stopMarkersRef.current[stop.actualIndex]) {
                                        mapInstanceRef.current.removeLayer(stopMarkersRef.current[stop.actualIndex]);
                                        stopMarkersRef.current.splice(stop.actualIndex, 1);
                                    }

                                    if (routeLayerRef.current && mapInstanceRef.current) {
                                        mapInstanceRef.current.removeLayer(routeLayerRef.current);
                                    }
                                }}
                            >
                                ✖
                            </button>}
                        </li>
                    ))}
            </ul>
        </div>
    );
};

export default StopsSidebar;
