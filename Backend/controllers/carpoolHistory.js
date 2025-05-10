const Ride = require("../models/Ride");
const Stop = require("../models/Stops");
const User = require("../models/User");
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
exports.rateRideAndUpdateDriverRating = async (req, res) => {
  const { rideId } = req.params;
  const { rating } = req.body;

  if (!rating || rating < 0 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 0 and 5" });
  }

  try {
    // Fetch the ride
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    // Calculate new average ride rating
    const newRideRatingCount = ride.RatingCount + 1;
    const newRideRating =
      (ride.Rating * ride.RatingCount + rating) / newRideRatingCount;

    // Update the ride document
    ride.Rating = newRideRating;
    ride.RatingCount = newRideRatingCount;
    await ride.save();

    // Fetch all rides by this driver that have been rated
    const allRatedRides = await Ride.find({
      userId: ride.userId,
      RatingCount: { $gt: 0 }
    });

    // Calculate overall average rating for the driver
    let totalRatingSum = 0;
    let totalRatingCount = 0;

    for (const r of allRatedRides) {
      totalRatingSum += r.Rating * r.RatingCount;
      totalRatingCount += r.RatingCount;
    }

    const overallDriverRating = totalRatingCount
      ? totalRatingSum / totalRatingCount
      : 0;

    // Update user (driver) rating
    await User.findByIdAndUpdate(ride.userId, {
      rating: overallDriverRating.toFixed(2)
    });

    return res.status(200).json({
      message: "Ride rated and driver's rating updated",
      rideRating: ride.Rating,
      driverRating: overallDriverRating
    });
  } catch (error) {
    console.error("Error rating ride:", error);
    return res.status(500).json({ error: "Server error while rating ride" });
  }
};