import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  MessageCircle,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils";
import MapModal from "../MapModal/MapModel";
import ProfileCard from "./ProfileCard";
import { useLocation } from "react-router-dom";
import RatingModal from "./RatingModal";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import axiosInstance from "../Authentication/redux/axiosInstance";
import RideDetailsModal from "./RideDetailsModal";

const CarpoolPost = ({
  id,
  driver,
  route,
  schedule,
  seats,
  preferences = [],
  variant = "default",
  className,
  activeTab,
  stops,
  onCarpoolCancelled,
  requesterName, // Prop to receive the requester's name
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [buttonText, setButtonText] = useState("");
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [rideDetailsOpen, setRideDetailsOpen] = useState(false);
  const { userDetails } = useSelector((state) => state.user || {});
  const [errorMessage, setErrorMessage] = useState('');
  const location = useLocation();

  const handleProfileClick = () => {
    if (userDetails.id === driver.driverId) {
      toast.error("This is your Profile");
    }
    else {

      setProfileModalOpen(true)
    }
  }

  const handleClick = () => {
    if (activeTab === "history") {

      if (userDetails.id === driver.driverId) {
        (toast.error("You cannot rate your own ride"))
      } else
        setRatingModalOpen(true);
    } else {
      // handle message functionality
    }
  };

  useEffect(() => {
    setButtonText(location.pathname === "/carpools" ? "Request Seat" : "Show Route");
  }, [location.pathname]);

  const handleRequestSeat = () => {
    setMapModalOpen(true);
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel this ride?")) {
      console.log("Attempting to cancel carpool with ID (via Redux):", id);
      if (onCarpoolCancelled) {
        onCarpoolCancelled(id);
      }
    }


  };

  const toggleExpand = () => {
    if (variant === "default") setIsExpanded(!isExpanded);
  };

  const handleDetailsClick = () => {
    setRideDetailsOpen(true);
  };

  return (
    <div
      className={cn(
        "bg-card dark:bg-primary-900/5 border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md",
        variant === "compact" ? "p-4" : "p-5",
        className
      )}
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div
          onClick={handleProfileClick}
          className="cursor-pointer flex-shrink-0"
        >
          <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/40 overflow-hidden flex items-center justify-center">
            {driver?.image ? (
              <img
                src={driver.image}
                alt={driver?.name || "Driver"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold text-primary-600 dark:text-primary-300">
                {driver?.name?.charAt(0) || "?"}
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3
                className="text-lg font-semibold truncate cursor-pointer"
                onClick={handleProfileClick}
              >
                {driver.name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Star
                    className="h-3.5 w-3.5 text-yellow-500 mr-1"
                    fill="currentColor"
                  />
                  {driver.rating.toFixed(1)}
                </span>
                <span className="mx-1.5">•</span>
                <span>{driver.department}</span>
              </div>
            </div>

            {variant === "default" && activeTab !== "history" && (
              <div className="flex items-center text-sm">
                <span
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
                    seats.available > 0
                      ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  )}
                >
                  <Users className="h-3 w-3" />
                  {seats.available} seat{seats.available !== 1 ? "s" : ""}{" "}
                  available
                </span>
              </div>
            )}
          </div>

          {/* Route */}
          <div className={cn("mt-3", variant === "compact" && "text-sm")}>
            <div className="flex items-start gap-2">
              <MapPin className={cn("h-5 w-5 text-primary mt-0.5", variant === "compact" && "h-4 w-4")} />
              <div className="flex-1">
                <div className="font-medium">
                  From:{" "}
                  <span className="text-muted-foreground">{route.pickup?.name || route.pickup || 'Unknown'}</span>
                </div>
                <div className="font-medium mt-1">
                  To:{" "}
                  <span className="text-muted-foreground">{route.dropoff?.name || route.dropoff || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className={cn("mt-3 grid", variant === "default" ? "grid-cols-2" : "grid-cols-1 text-sm")}>
            <div className="flex items-center gap-2">
              <Calendar className={cn("h-5 w-5 text-primary", variant === "compact" && "h-4 w-4")} />
              <span>{schedule.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className={cn("h-5 w-5 text-primary", variant === "compact" && "h-4 w-4")} />
              <span>{schedule.time}</span>
            </div>
          </div>

          {/* Recurring Days */}
          {schedule.recurring?.length > 0 && isExpanded && (
            <div className="mt-3 flex flex-wrap gap-2">
              {schedule.recurring.map((day, idx) => (
                <span
                  key={idx}
                  className="bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-secondary-300 px-2.5 py-0.5 rounded-full text-xs font-medium"
                >
                  {day}
                </span>
              ))}
            </div>
          )}

          {/* Preferences */}
          {preferences.length > 0 && (isExpanded || variant === "compact") && (
            <div className="mt-3">
              <div className="text-sm font-medium mb-1">Preferences:</div>
              <div className="flex flex-wrap gap-2">
                {preferences.map((pref, idx) => (
                  <span
                    key={idx}
                    className="bg-accent text-accent-foreground px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    {pref}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions (for default variant) */}
          {variant === "default" && (
            <div className="mt-4 flex flex-wrap items-center justify-around gap-2">
              {activeTab === "upcoming" && (
                <button
                  onClick={handleCancel}
                  className="flex-grow sm:flex-grow-0 h-[44px] w-[44px] px-4 text-sm bg-red-600 text-white rounded-xl flex items-center justify-center transition-colors duration-200 hover:bg-red-700 relative group"
                >
                  <X className="h-4 w-4" />
                  <span className="absolute bottom-[50px] left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-white text-black text-sm text-center px-2 py-1 rounded-md">
                    Cancel Ride
                  </span>
                </button>
              )}
              {activeTab !== "history" && (
                <button
                  onClick={handleRequestSeat}
                  className="flex-grow sm:flex-grow-0 h-[44px] px-4 text-sm bg-blue-500 text-white rounded-xl flex items-center justify-center transition-colors duration-200 hover:bg-blue-600 dark:bg-button-dark dark:hover:bg-button-hover dark:text-white"
                >
                  {buttonText !== "Request Seat" && <MapPin className="h-4 w-4" />}
                  {buttonText}
                </button>
              )}
              {activeTab === "history" && (
                <button
                  className="flex-grow sm:flex-grow-0 h-[44px] px-4 text-sm bg-blue-500 text-white rounded-xl flex items-center justify-center transition-colors duration-200 hover:bg-blue-600 dark:bg-button-dark dark:hover:bg-button-hover dark:text-white"                 onClick={handleDetailsClick} // Add the action listener
                >
                  Ride Details
                </button>
              )}
              <button
                className="flex-grow sm:flex-grow-0 h-[44px] px-4 text-sm bg-blue-500 text-white rounded-xl flex items-center justify-center transition-colors duration-200 hover:bg-blue-600 dark:bg-button-dark dark:hover:bg-button-hover dark:text-white"
                onClick={handleClick}
              >
                {activeTab !== "history" ? (
                  <>
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-1" />
                    <span className="pl-1">Rate Ride</span>
                  </>
                )}
              </button>


              {(schedule.recurring || preferences.length > 0) && (
                <button
                  onClick={toggleExpand}
                  aria-label={isExpanded ? "Show less" : "Show more"}
                  className="border-none h-[44px] px-2 text-sm bg-inherit text-black dark:text-white rounded-xl dark:hover:bg-button-hover/60 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={cn("h-5 w-5 transition-transform duration-200", isExpanded && "rotate-180")}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              )}

              <MapModal open={mapModalOpen} rideId={id} route={route} stop={stops} onOpenChange={setMapModalOpen} activeTab={activeTab} />
            </div>
          )}

          {/* Compact Variant Actions */}
          {variant === "compact" && (
            <div className="mt-3 flex items-center justify-between">
              <div
                className={cn(
                  "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
                  seats.available > 0
                    ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                )}
              >
                <Users className="h-3 w-3" />
                {seats.available} seat{seats.available !== 1 ? "s" : ""}{" "}
                available
              </div>
              {activeTab === "history" ? (
                <button
                  style={{
                    height: "32px",
                    fontSize: "14px",
                    padding: "0 12px",
                  }}
                  onClick={handleDetailsClick} // Add the action listener
                >
                  Details
                </button>
              ) : (
                <button
                  style={{
                    height: "32px",
                    fontSize: "14px",
                    padding: "0 12px",
                  }}
                >
                  Show Route
                </button>
              )}
            </div>
          )}

          {activeTab === "offers" && requesterName && (
            <div className={cn(
  "mt-3 text-sm flex",
  variant === "compact" && "mt-2",
  "justify-center" // Moved justify-center to the outer div
)}>
  <span className="text-red-600 font-bold">Requested by:</span>
  <span className="font-medium text-red-600 font-bold ml-1">{requesterName}</span>
</div>
          )}
        </div>
      </div>

      <RatingModal
        open={ratingModalOpen}
        onOpenChange={setRatingModalOpen}
        rideId={id}
      />
      {profileModalOpen && ( 
        <ProfileCard
          profileId={driver.id? driver.id : driver.driverId}
          open={profileModalOpen}
          onOpenChange={setProfileModalOpen}
        />
      )}
      <RideDetailsModal
        open={rideDetailsOpen}
        onOpenChange={setRideDetailsOpen}
        rideId={id}
      />
    </div>
  );
};

export default CarpoolPost;