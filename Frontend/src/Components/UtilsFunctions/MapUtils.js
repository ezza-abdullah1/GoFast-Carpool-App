import axios from "axios";

export const decodePolyline = (polyline) => {
    let index = 0, lat = 0, lng = 0, coordinates = [];
    while (index < polyline.length) {
        let b, shift = 0, result = 0;
        do {
            b = polyline.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = polyline.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
        lng += dlng;

        coordinates.push([lat / 1e5, lng / 1e5]);
    }
    return coordinates;
};

export const fetchRouteFromORS = async (coordinates) => {
    const response = await axios.post("http://localhost:5000/api/map/directions", { coordinates });
    return response.data;
};

export const drawRoute = async (map, coordinates, setError, setErrorMsg, setConfirmEnabled, setSelectedLatLng) => {
    try {
        const response = await fetchRouteFromORS(coordinates);
        const geometry = response.routes[0].geometry;
        const decoded = decodePolyline(geometry);
        const routeLine = window.L.polyline(decoded, { color: "blue" }).addTo(map);
        map.fitBounds(routeLine.getBounds());
        setError(false);
        return routeLine;
    } catch (error) {
        console.error("API call failed:", error);
        setError(true);
        setErrorMsg("Unable to load route. Please try again later.");
        setConfirmEnabled(false);
        setSelectedLatLng(null);
        return null;
    }
};

export const getUpdatedRoute = (customStop, baseRoute) => {
    if (!customStop) return baseRoute;
    const newStop = [customStop[1], customStop[0]];
    const updatedRoute = [...baseRoute];
    updatedRoute.splice(-1, 0, newStop);
    return updatedRoute;
};
