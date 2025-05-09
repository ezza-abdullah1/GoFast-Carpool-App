const Stop = require("../models/Stops");

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
