import React from "react";
import { useState,useEffect } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../Authentication/redux/axiosInstance";
import { fetchUpcomingRides } from '../Authentication/redux/upcomingRidesSlice';
import { useDispatch, useSelector } from 'react-redux';
import ConfirmModal from '../ui/comfirmModal';
import { incrementRidesOffered } from "../Authentication/redux/userSlice";
const UpcomingRideActions = ({ activeTab, rideId, onRideFinished, driver_id,stops }) => {
  const dispatch = useDispatch();
  const { userDetails } = useSelector((state) => state.user);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleFinishRideConfirmation = () => {
    if (userDetails.id !== driver_id) {
      toast.error("You can finish your own ride only");
      return; 
    }
    setShowConfirmModal(true);
  };

  const handleFinishRide = async () => {
    if (isFinishing) {
      return;
    }

    setIsFinishing(true);
    setShowConfirmModal(false);
    try {
      const response = await axiosInstance.put(`/carpools/${rideId}`, {
        status: "inactive",
      });

      if (response.status === 200) {
        toast.success("Ride finished successfully!");
        if (userDetails?.id && activeTab === 'upcoming') {
          dispatch(fetchUpcomingRides(userDetails.id));

        }
        dispatch(incrementRidesOffered(userDetails.id));
        
        if (onRideFinished) {
          onRideFinished(rideId);
        }
      } else {
        toast.error("Failed to finish ride.");
      }
    } catch (error) {
      console.error("Error finishing ride:", error);
      toast.error("An error occurred while finishing the ride.");
    } finally {
      setIsFinishing(false); 
    }
  };

  const handleCancelFinish = () => {
    setShowConfirmModal(false);
  };
useEffect(() => {
  console.log("Stops:", stops);
},[])
  return (
    <div className="w-full flex justify-center mt-4">
      {activeTab === "upcoming" && rideId && (
        <div className="w-full flex justify-center mt-4">
          <button
            className="px-4 py-2 bg-primary dark:bg-primary-900/20 dark:text-white dark:hover:bg-button-hover/60 transition-colors text-white rounded shadow hover:bg-primary/90"
            onClick={handleFinishRideConfirmation}
            disabled={isFinishing} 
          >
            {isFinishing ? "Finishing..." : "Finish Ride"}
          </button>
        </div>
      )}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelFinish}
        onConfirm={handleFinishRide}
        message="Are you sure you want to finish this ride?"
      />
    </div>
  );
};

export default UpcomingRideActions;