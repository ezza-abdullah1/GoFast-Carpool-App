const axios = require("axios");

const API_URL = "https://api.openrouteservice.org/v2/directions/driving-car";
const API_KEY = "5b3ce3597851110001cf624816bc06dddea04b2c81243b68a7ffc44c";

exports.fetchRoute = async (coordinates) => {
    const response = await axios.post(
        API_URL,
        { coordinates },
        {
            headers: {
                Authorization: API_KEY,
                "Content-Type": "application/json",
                Accept: "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
            },
        }
    );
    return response.data;
};
