const mapService = require("../services/mapServices");

exports.getDirections = async (req, res) => {
    try {
        const data = await mapService.fetchRoute(req.body.coordinates);
        res.json(data);
    } catch (error) {
        console.error("Error in mapController:", error.message);
        res.status(500).json({ error: "Failed to fetch directions" });
    }
};
