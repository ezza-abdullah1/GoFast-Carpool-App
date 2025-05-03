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

const isMapValid = (map) => {
    try {
        return (
            map &&
            map._container &&
            map._container.isConnected &&
            document.body.contains(map._container) &&
            map._loaded === true
        );
    } catch (e) {
        console.warn("Error checking map validity:", e);
        return false;
    }
};

const ensureSVGContainer = (map) => {
    try {
        const container = map.getContainer();
        let svgContainer = container.querySelector(".leaflet-overlay-pane svg");

        if (!svgContainer) {
            const overlayPane = container.querySelector(".leaflet-overlay-pane");
            if (overlayPane) {
                svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svgContainer.setAttribute("class", "leaflet-zoom-animated");
                overlayPane.appendChild(svgContainer);

                const mapSize = map.getSize();
                svgContainer.setAttribute("width", mapSize.x);
                svgContainer.setAttribute("height", mapSize.y);

                const viewBox = [map.getPixelOrigin().x, map.getPixelOrigin().y, mapSize.x, mapSize.y];
                svgContainer.setAttribute("viewBox", viewBox.join(" "));
            }
        }
        return !!svgContainer;
    } catch (e) {
        console.error("Error ensuring SVG container:", e);
        return false;
    }
};

const addPolylineManually = (map, coordinates, options = { color: "blue" }) => {
    try {
        if (!ensureSVGContainer(map)) return null;

        const polyline = window.L.polyline(coordinates, options);
        if (!map._manualPolylines) map._manualPolylines = [];
        map._manualPolylines.push(polyline);

        const latLngs = polyline.getLatLngs();
        const points = latLngs.map((latlng) => map.latLngToLayerPoint(latlng));

        const pathStr = points.map((point, i) => (i === 0 ? "M" : "L") + point.x + " " + point.y).join(" ");

        const svgContainer = map.getContainer().querySelector(".leaflet-overlay-pane svg");
        if (svgContainer) {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", pathStr);
            path.setAttribute("stroke", options.color || "blue");
            path.setAttribute("stroke-width", options.weight || 3);
            path.setAttribute("fill", "none");
            path.setAttribute("stroke-opacity", options.opacity || 0.5);
            path.setAttribute("stroke-linecap", "round");
            path.setAttribute("stroke-linejoin", "round");

            svgContainer.appendChild(path);
            polyline._path = path;
        }

        return polyline;
    } catch (e) {
        console.error("Error adding polyline manually:", e);
        return null;
    }
};

export const drawRoute = async (map, coordinates, setError, setErrorMsg, setConfirmEnabled, setSelectedLatLng) => {
    try {
        if (!map || !map.getContainer || typeof map.getContainer !== "function") return null;

        if (!map._loaded) {
            await new Promise((resolve) => setTimeout(resolve, 300));
            if (!map._loaded) return null;
        }

        if (!isMapValid(map)) return null;

        const response = await fetchRouteFromORS(coordinates);
        const decoded = decodePolyline(response.routes[0].geometry);

        if (!isMapValid(map)) return null;
        await new Promise((resolve) => setTimeout(resolve, 200));

        if (!isMapValid(map)) return null;

        let routeLine = null;
        let success = false;

        try {
            routeLine = window.L.polyline(decoded, {
                color: "blue",
                weight: 4,
                opacity: 0.7,
                smoothFactor: 1,
            });

            await new Promise((resolve) => setTimeout(resolve, 100));

            if (!isMapValid(map)) throw new Error("Map became invalid before adding polyline");

            map.addLayer(routeLine);
            success = map.hasLayer(routeLine);
        } catch (err) {
            if (routeLine && map.hasLayer(routeLine)) {
                try {
                    map.removeLayer(routeLine);
                } catch (e) {}
            }

            if (!success && isMapValid(map)) {
                try {
                    await new Promise((resolve) => setTimeout(resolve, 150));
                    routeLine = window.L.polyline(decoded, {
                        color: "blue",
                        weight: 4,
                        opacity: 0.7,
                        renderer: new window.L.Canvas({ padding: 0.5 }),
                    });

                    map.addLayer(routeLine);
                    success = map.hasLayer(routeLine);
                } catch (canvasErr) {
                    if (routeLine && map.hasLayer(routeLine)) {
                        try {
                            map.removeLayer(routeLine);
                        } catch (e) {}
                    }
                }
            }

            if (!success && isMapValid(map)) {
                try {
                    await new Promise((resolve) => setTimeout(resolve, 150));
                    routeLine = addPolylineManually(map, decoded);
                    success = !!routeLine;
                } catch (manualErr) {}
            }
        }

        if (success && routeLine) {
            try {
                const bounds = window.L.latLngBounds(decoded);
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15, animate: false });
                }
            } catch (boundsErr) {}

            setError(false);
            return routeLine;
        } else {
            setError(true);
            setErrorMsg("Could not render route on map. Please try again.");
            return null;
        }
    } catch (error) {
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
