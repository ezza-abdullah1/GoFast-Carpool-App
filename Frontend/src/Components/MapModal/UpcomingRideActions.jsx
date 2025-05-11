import React from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../Authentication/redux/axiosInstance"; // Import your axios instance

const UpcomingRideActions = ({ activeTab, rideId }) => {
  const handleFinishRide = async () => {
    try {
      const response = await axiosInstance.put(`/carpools/${rideId}`, {
        status: "inactive",
      });

      if (response.status === 200) {
        toast.success("Ride finished successfully!");
      } else {
        toast.error("Failed to finish ride.");
      }
    } catch (error) {
      console.error("Error finishing ride:", error);
      toast.error("An error occurred while finishing the ride.");
    }
  };

  return (
    <div className="w-full flex justify-center mt-4">
      {activeTab === "upcoming" && rideId && ( // Ensure rideId is available
        <div className="w-full flex justify-center mt-4">
          <button
            className="px-4 py-2 bg-primary dark:bg-primary-900/20 dark:text-white dark:hover:bg-button-hover/60 transition-colors text-white rounded shadow hover:bg-primary/90"
            onClick={handleFinishRide}
          >
            Finish Ride
          </button>
        </div>
      )}
    </div>
  );
};

export default UpcomingRideActions;