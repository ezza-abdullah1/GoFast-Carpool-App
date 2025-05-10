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
import axiosInstance from "../Authentication/redux/axiosInstance"; 
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


}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [buttonText, setButtonText] = useState("");
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const location = useLocation();
  const handleClick = () => {
    if (activeTab === "history") {
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
      onCarpoolCancelled(id); // Only dispatch the Redux action
    }
  }
};
  const toggleExpand = () => {
    if (variant === "default") setIsExpanded(!isExpanded);
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
          onClick={() => setProfileModalOpen(true)}
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
                onClick={() => setProfileModalOpen(true)}
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

            {variant === "default" && (
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
                  <span className="text-muted-foreground">{route.pickup.name?route.pickup.name:route.pickup}</span>
                </div>
                <div className="font-medium mt-1">
                  To:{" "}
                  <span className="text-muted-foreground">{route.dropoff.name?route.dropoff.name:route.dropoff}</span>
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

          {/* Actions */}
          {variant === "default" && (
            <div className="mt-4 flex flex-wrap items-center justify-around gap-2">
              {activeTab === "upcoming" && (
              <button
              onClick={handleCancel}
              className="flex-grow sm:flex-grow-0 h-[44px] w-[44px] px-4 text-sm bg-red-600 text-white rounded-xl flex items-center justify-center transition-colors duration-200 hover:bg-red-700 relative group"
            >
              <X className="h-4 w-4" />
            
              {/* Hover text */}
              <span className="absolute bottom-[50px] left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-white text-black text-sm text-center px-2 py-1 rounded-md">
                Cancel Ride
              </span>
            </button>
            
              )}
              <button
                onClick={handleRequestSeat}
                className="flex-grow sm:flex-grow-0 h-[44px] px-4 text-sm bg-blue-500 text-white rounded-xl flex items-center justify-center transition-colors duration-200 hover:bg-blue-600 dark:bg-button-dark dark:hover:bg-button-hover dark:text-white"
              >
                {buttonText !== "Request Seat" && <MapPin className="h-4 w-4" />}
                {buttonText}
              </button>

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
                    <Star className="h-4 w-4" />
                    Rate Ride
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

          {/* Compact Variant */}
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
              <button
                style={{
                  height: "32px",
                  fontSize: "14px",
                  padding: "0 12px",
                }}
              >
                Details
              </button>
            </div>
          )}
        </div>
      </div>
      <RatingModal
        open={ratingModalOpen}
        onOpenChange={setRatingModalOpen}
        onSubmit={(stars) => {
          console.log(`Rated with ${stars} stars`);
          // Add API call or state update here
        }}
      />
      {profileModalOpen &&
        <ProfileCard
          profileId={driver.id}
          open={profileModalOpen}
          onOpenChange={setProfileModalOpen}
        />
      }
    </div>
  );
};

export default CarpoolPost;
