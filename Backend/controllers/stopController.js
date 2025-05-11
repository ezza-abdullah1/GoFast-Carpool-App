const Stop = require("../models/Stops");
const Ride = require("../models/Ride");  
exports.createStop = async (req, res) => {
  try {
    const { rideId, userId, location, status } = req.body;

    const newStop = new Stop({
      rideId,
      userId,
      location,
      status: status || "pending"
    });

    await newStop.save();
    res.status(201).json({ message: "Stop request saved", stop: newStop });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteStopById = async (req, res) => {
  try {
    const { id } = req.params;

    // First, find the stop to access the rideId
    const stop = await Stop.findById(id);
    if (!stop) {
      return res.status(404).json({ message: "Stop not found" });
    }

    // Delete the stop
    await Stop.findByIdAndDelete(id);

    // Decrease seatsTaken in the associated Ride
    await Ride.findByIdAndUpdate(stop.rideId, {
      $inc: { seatsTaken: -1 }
    });

    res.status(200).json({ message: "Stop deleted and ride seat updated", stop });
  } catch (error) {
    console.error("Error deleting stop:", error);
    res.status(500).json({ message: "Server error" });
  }
};
