import { useEffect } from "react";

const FooterActions = ({ buttonFlag, confirmEnabled, activeTab }) => {
    const handleAcceptRide = () => console.log("Ride accepted");
    const handleDeclineRide = () => console.log("Ride declined");

    return (
        <div className="w-full flex justify-center mt-4">
            {buttonFlag && (
                <button
                    className={`px-4 py-2 ${
                        confirmEnabled
                            ? "bg-primary hover:bg-primary/90"
                            : "bg-gray-400 cursor-not-allowed"
                    } dark:bg-primary-900/20 dark:text-white dark:hover:bg-button-hover/60 transition-colors text-white rounded shadow`}
                    disabled={!confirmEnabled}
                    
                >
                    Confirm Location
                </button>
            )}

            {activeTab === "offers" && (
                <div className="flex space-x-4 ml-4">
                    <button
                        className="px-4 py-2 bg-primary dark:bg-primary-900/20 dark:text-white dark:hover:bg-button-hover/60 transition-colors text-white rounded shadow hover:bg-primary/90"
                        onClick={handleAcceptRide}
                    >
                        Accept
                    </button>
                    <button
                        className="px-4 py-2 bg-red-600 dark:text-white dark:bg-button-dark dark:hover:bg-button-hover text-white rounded shadow hover:bg-red-700"
                        onClick={handleDeclineRide}
                    >
                        Decline
                    </button>
                </div>
            )}
        </div>
    );
};

export default FooterActions;
