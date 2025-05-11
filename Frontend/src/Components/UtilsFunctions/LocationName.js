export const getLocationName = async (lat, lon) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );

        if (!response.ok) throw new Error("Failed to fetch location");

        const data = await response.json();
        const address = data.address;
    
        const shortName = [
            address.road,
            address.neighbourhood||address.suburb,           
            address.district.split(" ")[0],
          
        ].filter(Boolean).join(", ");

        return shortName||address|| "Unknown location";
    } catch (error) {
        console.error("Reverse geocoding failed:", error);
        return "Location not found";
    }
};
