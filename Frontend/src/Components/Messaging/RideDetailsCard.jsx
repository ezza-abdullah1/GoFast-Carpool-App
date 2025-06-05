// src/components/Messaging/RideDetailsCard.jsx

import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import Button from "../ui/compatibility-button";
import { Loader2 } from "lucide-react";
import axiosInstance from "../Authentication/redux/axiosInstance";

export default function RideDetailsCard({ rideId, activeContactId }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!rideId) {
      setDetails(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);

    axiosInstance
      .get(`/carpools/rides/${rideId}/details`)
      .then((res) => setDetails(res.data))
      .catch((err) => {
        console.error("Error fetching ride details:", err);
        setError("Failed to load ride details.");
      })
      .finally(() => setLoading(false));
  }, [rideId]);

  if (loading) {
    return (
      <div className="flex justify-center my-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (error) {
    return <p className="text-center text-red-500 my-4">{error}</p>;
  }
  // If we have no details, or the active contact isn't the driver, hide the card
  if (!details || details.driverId !== activeContactId) return null;

  return (
    <div className="mb-4 p-4 rounded-lg bg-card border border-border max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">Ride Details</h4>
        <Button variant="outline" size="sm">View Ride</Button>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(details.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{details.time}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <div>From: {details.pickupName || details.pickup}</div>
            <div className="mt-1">To: {details.dropoffName || details.dropoff}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>
            {details.seats} seat{details.seats !== 1 ? "s" : ""} reserved
          </span>
        </div>
      </div>
    </div>
  );
}
