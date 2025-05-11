// RideDetailsModal.jsx
import React, { useState, useEffect } from "react";
import { X, MapPin } from "lucide-react";
import { Loader2 } from "lucide-react";
import axiosInstance from "../Authentication/redux/axiosInstance";

const RideDetailsModal = ({ open, onOpenChange, rideId }) => {
  const [rideDetails, setRideDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRideDetails = async () => {
      if (open && rideId) {
        setLoading(true);
        setError(null);
        try {
          const response = await axiosInstance.get(`/carpools/rides/${rideId}/details`);
          setRideDetails(response.data);
        } catch (error) {
          console.error("Error fetching ride details:", error);
          setError("Failed to fetch ride details.");
        } finally {
          setLoading(false);
        }
      } else {
        setRideDetails(null);
      }
    };

    fetchRideDetails();
  }, [open, rideId]);

  if (!open) {
    return null;
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="relative bg-card dark:bg-primary-900 rounded-lg shadow-lg w-full max-w-md m-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Ride Details</h3>
            <button onClick={() => onOpenChange(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="relative bg-card dark:bg-primary-900 rounded-lg shadow-lg w-full max-w-md m-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Ride Details</h3>
            <button onClick={() => onOpenChange(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!rideDetails) {
    return null; // Or a message like "No details available" if needed
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-card dark:bg-primary-900 rounded-lg shadow-lg w-full max-w-md m-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border dark:border-primary-800">
          <h3 className="text-lg font-semibold">Ride Details</h3>
          <button onClick={() => onOpenChange(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-1">Ride Information</h4>
            <p className="text-sm">
              Offered by: <span className="font-medium">{rideDetails.driverName}</span>
            </p>
            <div className="mt-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                From: <span className="text-muted-foreground">{rideDetails.pickupName}</span>
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                To: <span className="text-muted-foreground">{rideDetails.dropoffName}</span>
              </span>
            </div>
            <p className="text-sm mt-2">
              Date: <span className="text-muted-foreground">{new Date(rideDetails.date).toLocaleDateString()}</span>,
              Time: <span className="text-muted-foreground">{rideDetails.time}</span>
            </p>
          </div>

          {rideDetails.stops && rideDetails.stops.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Stops</h4>
              <ul className="space-y-2">
                {rideDetails.stops.map((stop) => (
                  <li key={stop.id} className="bg-muted/10 rounded-md p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-secondary" />
                      <span className="font-medium">{stop.locationName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Requested by: {stop.requesterName}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {rideDetails.stops && rideDetails.stops.length === 0 && (
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Stops</h4>
              <p className="text-sm text-muted-foreground">No stops requested for this ride.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideDetailsModal;