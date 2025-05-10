const Ride = require("../models/Ride");
const Stop = require("../models/Stops");

exports.getPendingRequests = async (req, res) => {
  const userId = req.params.id;

  try {
    const ridesAsDriver = await Ride.find({
      userId,
      numberOfSeats: { $gt: 0 },
    }).lean();

    const results = [];

    for (const ride of ridesAsDriver) {
      const [acceptedStops, pendingStops] = await Promise.all([
        Stop.find({ rideId: ride._id, status: "accepted" }).lean(),
        Stop.find({ rideId: ride._id, status: "pending" }).lean(),
      ]);

      // For each pending stop, create a ride copy with all accepted stops + one pending stop
      for (const pendingStop of pendingStops) {
        results.push({
          ...ride,
          stops: [...acceptedStops, pendingStop],
        });
      }
    }

    return res.json(results);
  } catch (error) {
    console.error("Error getting pending stop requests:", error);
    return res.status(500).json({
      error: "Server error while fetching pending stop requests",
    });
  }
};
exports.updateRideStatus = async (req, res) => {
  const stopId = req.params.id;
  const { status, rideId } = req.body;

  if (!status || !rideId) {
    return res
      .status(400)
      .json({ error: "Status and rideId are required in request body" });
  }

  try {
    const stop = await Stop.findById(stopId);

    if (!stop) {
      return res.status(404).json({ error: "Stop not found" });
    }

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    let seatChange = 0;
    if (status === "accept") {
      seatChange = -1;
    }

    ride.numberOfSeats += seatChange;
    await ride.save();

    stop.status = status;

    const updatedStop = await stop.save();

    return res.status(200).json({
      message: "Stop status updated successfully and ride seat count adjusted",
      stop: updatedStop,
      ride: ride,
    });
  } catch (error) {
    console.error("Error updating ride status:", error);
    return res.status(500).json({
      error: "Server error while updating ride status",
    });
  }
};
