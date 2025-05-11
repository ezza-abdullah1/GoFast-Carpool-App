// controllers/rideDetailsController.js
const Ride = require('../models/Ride');
const Stop = require('../models/Stops');
const User = require('../models/User');

exports.getRideDetails = async (req, res) => {
  const { rideId } = req.params;

  try {
    const ride = await Ride.findById(rideId)
      .populate('userId', 'fullName') // Populate the driver's name
      .select('pickup dropoff date time userId');

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    const stops = await Stop.find({ rideId: rideId, status: 'accept' })
      .populate('userId', 'fullName') // Populate the requester's name
      .select('location userId');

    const formattedStops = stops.map(stop => ({
      id: stop._id,
      locationName: stop.location.name,
      requesterName: stop.userId.fullName,
    }));

    res.json({
      id: ride._id,
      pickupName: ride.pickup.name,
      dropoffName: ride.dropoff.name,
      date: ride.date,
      time: ride.time,
      driverName: ride.userId.fullName,
      stops: formattedStops,
    });

  } catch (error) {
    console.error('Error fetching ride details:', error);
    res.status(500).json({ message: 'Failed to fetch ride details' });
  }
};