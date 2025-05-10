const Ride = require("../models/Ride");
const Stop = require("../models/Stops");

exports.getCarpoolHistory = async (req, res) => {
  const userId = req.params.id;
  try {
    const ridesAsDriver = await Ride.find({ userId, status: "inactive" }).lean();
    const stopsAsPassenger = await Stop.find({ userId, status: "accept" }).lean();
    const rideIdsFromStops = stopsAsPassenger.map(stop => stop.rideId.toString());
    const ridesAsPassenger = await Ride.find({
      _id: { $in: rideIdsFromStops, $nin: ridesAsDriver.map(r => r._id.toString()) },
      status: "inactive"
    }).lean();
    const allRides = [...ridesAsDriver, ...ridesAsPassenger];
    const ridesWithStops = await Promise.all(
      allRides.map(async (ride) => {
        const stops = await Stop.find({ rideId: ride._id, status: "accept" }).lean();
        return { ...ride, stops };
      })
    );
    return res.json(ridesWithStops);
  } catch (error) {
    console.error("Error getting user rides:", error);
    return res.status(500).json({ error: "Server error while fetching rides" });
  }
};
