import React from "react";

const UpcomingRideActions = ({  activeTab }) => {
    const handleFinishRide = () => console.log("Ride Finished");

    return (
        <div className="w-full flex justify-center mt-4">
        {activeTab === "upcoming" && (
        <div className="w-full flex justify-center mt-4">
            <button
                className="px-4 py-2 bg-primary dark:bg-primary-900/20 dark:text-white dark:hover:bg-button-hover/60 transition-colors text-white rounded shadow hover:bg-primary/90"
                onClick={handleFinishRide}
            >
                Finish Ride
            </button>
        </div>
        )};
        </div>
        
    );
};

export default UpcomingRideActions;
