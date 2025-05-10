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

exports.deleteStopById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStop = await Stop.findByIdAndDelete(id);

    if (!deletedStop) {
      return res.status(404).json({ message: "Stop not found" });
    }

    res.status(200).json({ message: "Stop deleted successfully", stop: deletedStop });
  } catch (error) {
    console.error("Error deleting stop:", error);
    res.status(500).json({ message: "Server error" });
  }
};
