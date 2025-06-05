// src/components/CarpoolPost/CarpoolPost.jsx

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
import { useLocation, useNavigate } from "react-router-dom";
import RatingModal from "./RatingModal";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import axiosInstance from "../Authentication/redux/axiosInstance";
import RideDetailsModal from "./RideDetailsModal";
import ConfirmModal from "../ui/comfirmModal";

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
  requesterName,
}) => {
  const D_ID = driver.id || driver.driverId;

  const [isExpanded, setIsExpanded] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [buttonText, setButtonText] = useState("");
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [rideDetailsOpen, setRideDetailsOpen] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);

  const { userDetails } = useSelector((state) => state.user || {});
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setButtonText(
      location.pathname === "/carpools" ? "Request Seat" : "Show Route"
    );
  }, [location.pathname]);

  const handleProfileClick = () => {
    if (!userDetails?.id) {
      return toast.error("Please log in to view profiles.");
    }
    if (userDetails.id === D_ID) {
      toast.error("This is your Profile");
    } else {
      setProfileModalOpen(true);
    }
  };

  const handleClick = async () => {
    if (activeTab === "history") {
      if (userDetails.id === D_ID) {
        toast.error("You cannot rate your own ride");
      } else {
        setRatingModalOpen(true);
      }
      return;
    }

    if (!userDetails?.id) {
      return toast.error("Please log in to perform this action.");
    }
    if (userDetails.id === D_ID) {
      return toast.error("You cannot message yourself");
    }

    setMessageLoading(true);
    let conversationId;
    try {
      const { data } = await axiosInstance.get(
        `/messages/conversation/${D_ID}`
      );
      conversationId = data.conversationId;
    } catch (err) {
      if ([400, 404].includes(err.response?.status)) {
        const { data: postData } = await axiosInstance.post(
          `/messages/conversation`,
          { participants: [userDetails.id, D_ID] }
        );
        conversationId = postData.conversationId;
      } else {
        console.error(err);
        toast.error("Failed to open chat. Please try again.");
        setMessageLoading(false);
        return;
      }
    }

    navigate("/messages", {
      state: { activeConversation: conversationId, rideId: id },
    });
    setMessageLoading(false);
  };

  const handleRequestSeat = () => setMapModalOpen(true);
  const handleCancelConfirmation = () => {
    if (!userDetails?.id) return toast.error("Please log in to cancel rides.");
    if (userDetails.id !== D_ID) return toast.error("You can only cancel your own ride");
    setShowCancelConfirmModal(true);
  };
  const handleCancel = () => {
    setShowCancelConfirmModal(false);
    onCarpoolCancelled?.(id);
    toast.success("Ride cancelled successfully");
  };
  const toggleExpand = () => {
    if (variant === "default") setIsExpanded((v) => !v);
  };
  const handleDetailsClick = () => setRideDetailsOpen(true);

  return (
    <div
      className={cn(
        "bg-card w-300 dark:bg-primary-900/5 border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md",
        variant === "compact" ? "p-4" : "p-5 pb-4",
        className
      )}
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div onClick={handleProfileClick} className="cursor-pointer flex-shrink-0">
          <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/40 overflow-hidden flex items-center justify-center">
            {driver?.image ? (
              <img src={driver.image} alt={driver?.name || "Driver"} className="h-full w-full object-cover"/>
            ) : (
              <span className="text-lg font-semibold text-primary-600 dark:text-primary-300">
                {driver?.name?.charAt(0) || "?"}
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
            <div>
              <h3 onClick={handleProfileClick} className="text-lg font-semibold truncate cursor-pointer">
                {driver.name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Star className="h-3.5 w-3.5 text-yellow-500 mr-1" fill="currentColor"/>
                  {driver.rating.toFixed(1)}
                </span>
                <span className="mx-1.5">•</span>
                <span>{driver.department}</span>
              </div>
            </div>
            {variant === "default" && activeTab !== "history" && (
              <span
                className={cn(
                  "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
                  seats.available > 0
                    ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                )}
              >
                <Users className="h-3 w-3"/>
                {seats.available} seat{seats.available !== 1 ? "s" : ""} available
              </span>
            )}
          </div>

          {/* Route */}
          <div className={cn("mt-3", variant === "compact" && "text-sm")}>
            <div className="flex items-start gap-2">
              <MapPin className={cn("h-5 w-5 text-primary mt-0.5", variant === "compact" && "h-4 w-4")}/>
              <div className="flex-1">
                <div className="font-medium">
                  From: <span className="text-muted-foreground">{route.pickup?.name || route.pickup || "Unknown"}</span>
                </div>
                <div className="font-medium mt-1">
                  To: <span className="text-muted-foreground">{route.dropoff?.name || route.dropoff || "Unknown"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className={cn("mt-3 grid", variant === "default" ? "grid-cols-2" : "grid-cols-1 text-sm")}>
            <div className="flex items-center gap-2">
              <Calendar className={cn("h-5 w-5 text-primary", variant === "compact" && "h-4 w-4")}/>
              <span>{schedule.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className={cn("h-5 w-5 text-primary", variant === "compact" && "h-4 w-4")}/>
              <span>{schedule.time}</span>
            </div>
          </div>

          {/* Recurring Days */}
          {schedule.recurring?.length > 0 && isExpanded && (
            <div className="mt-3 flex flex-wrap gap-2">
              {schedule.recurring.map((day, idx) => (
                <span key={idx} className="bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-secondary-300 px-2.5 py-0.5 rounded-full text-xs font-medium">
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
                  <span key={idx} className="bg-accent text-accent-foreground px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {pref}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {variant === "default" && (
            <div className="mt-4 flex items-center justify-around gap-2">
              {activeTab === "upcoming" && (
                <button onClick={handleCancelConfirmation} className="h-[44px] w-[44px] bg-red-600 text-white rounded-xl flex items-center justify-center">
                  <X className="h-4 w-4"/>
                </button>
              )}
              {activeTab !== "history" && (
                <button onClick={handleRequestSeat} className="flex-1 h-[44px] bg-blue-500 text-white rounded-xl">
                  {buttonText}
                </button>
              )}

              {activeTab === "history" && (
                <>
                  <button onClick={handleClick} className="flex-1 h-[44px] bg-yellow-500 text-white rounded-xl flex items-center justify-center">
                    <Star className="h-4 w-4 mr-1" fill="currentColor"/>Rate Ride
                  </button>
                  <button onClick={handleDetailsClick} className="flex-1 h-[44px] bg-blue-500 text-white rounded-xl flex items-center justify-center">
                    Ride Details
                  </button>
                </>
              )}

              {activeTab !== "history" && (
                <button
                  onClick={handleClick}
                  disabled={messageLoading}
                  className={cn(
                    "flex-1 h-[44px] rounded-xl flex items-center justify-center",
                    messageLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 text-white"
                  )}
                >
                  <MessageCircle className="h-4 w-4 mr-1"/>
                  {messageLoading ? "Opening…" : "Message"}
                </button>
              )}

              {(schedule.recurring?.length > 0 || preferences.length > 0) && (
                <button onClick={toggleExpand} className="h-[44px] px-2 rounded-xl" aria-label={isExpanded ? "Show less" : "Show more"}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={cn("h-5 w-5", isExpanded && "rotate-180")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
              )}

              <MapModal
                open={mapModalOpen}
                rideId={id}
                route={route}
                stop={stops}
                onOpenChange={setMapModalOpen}
                activeTab={activeTab}
                driverid={D_ID}
              />
            </div>
          )}

          {/* Compact Variant */}
          {variant === "compact" && (
            <div className="mt-3 flex items-center justify-between">
              <span className={cn(
                "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
                seats.available > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              )}>
                <Users className="h-3 w-3"/> {seats.available} seat{seats.available !== 1 ? "s" : ""}
              </span>
              {activeTab === "history" ? (
                <button onClick={handleDetailsClick}>Details</button>
              ) : (
                <button onClick={handleRequestSeat}>Show Route</button>
              )}
            </div>
          )}

          {activeTab === "offers" && requesterName && (
            <div className="mt-3 text-sm justify-center flex">
              <span className="text-red-600 font-bold">Requested by:</span>
              <span className="ml-1 font-bold text-red-600">{requesterName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <RatingModal open={ratingModalOpen} onOpenChange={setRatingModalOpen} rideId={id}/>
      {profileModalOpen && (
        <ProfileCard profileId={D_ID} open={profileModalOpen} onOpenChange={setProfileModalOpen}/>
      )}
      <RideDetailsModal open={rideDetailsOpen} onOpenChange={setRideDetailsOpen} rideId={id}/>
      <ConfirmModal
        isOpen={showCancelConfirmModal}
        onClose={() => setShowCancelConfirmModal(false)}
        onConfirm={handleCancel}
        message="Are you sure you want to cancel this ride?"
      />
    </div>
  );
};

export default CarpoolPost;
