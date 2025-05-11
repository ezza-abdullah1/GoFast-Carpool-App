import React from "react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../Authentication/redux/axiosInstance";
import { fetchUpcomingRides } from '../Authentication/redux/upcomingRidesSlice';
import { useDispatch, useSelector } from 'react-redux'; // Import useDispatch and useSelector

const UpcomingRideActions = ({ activeTab, rideId, onRideFinished }) => {
  const dispatch = useDispatch();
  const { userDetails } = useSelector((state) => state.user);
  const [isFinishing, setIsFinishing] = useState(false);

  const handleFinishRide = async () => {
    if (isFinishing) {
      return; // Prevent multiple calls while processing
    }

    if (window.confirm("Are you sure you want to finish this ride?")) {
      setIsFinishing(true);
      try {
        const response = await axiosInstance.put(`/carpools/${rideId}`, {
          status: "inactive",
        });

        if (response.status === 200) {
          toast.success("Ride finished successfully!");
          if (userDetails?.id && activeTab === 'upcoming') {
            dispatch(fetchUpcomingRides(userDetails.id));
          }
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
        setIsFinishing(false); // Re-enable the button
      }
    }
  };

  return (
    <div className="w-full flex justify-center mt-4">
      {activeTab === "upcoming" && rideId && (
        <div className="w-full flex justify-center mt-4">
          <button
            className="px-4 py-2 bg-primary dark:bg-primary-900/20 dark:text-white dark:hover:bg-button-hover/60 transition-colors text-white rounded shadow hover:bg-primary/90"
            onClick={handleFinishRide}
            disabled={isFinishing} // Disable while processing
          >
            {isFinishing ? "Finishing..." : "Finish Ride"}
          </button>
        </div>
      )}
    </div>
  );
};

export default UpcomingRideActions;