const Ride = require('../models/Ride');
const User = require('../models/User');  
const mongoose = require('mongoose');
exports.createRideOffer = async (req, res) => {
  try {
    const { 
      userId, 
      pickup, 
      dropoff, 
      seatsTaken, 
      date, 
      time, 
      preferences 
    } = req.body;

    const newRide = new Ride({
      userId: new mongoose.Types.ObjectId(userId),
      pickup,
      dropoff,
      seatsTaken,
      date,
      time,
      preferences,
      status: 'active'  
    });

    const savedRide = await newRide.save();

    await User.findByIdAndUpdate(userId, { $inc: { rides_offered: 1 } });

    const populatedRide = await Ride.findById(savedRide._id)
      .populate('userId', 'fullName department email gender rating rides_taken rides_offered')
      .lean();

    const formattedRideOffer = {
      id: populatedRide.id,
      driver: {
        name: populatedRide.userId.fullName,
        gender: populatedRide.userId.gender,
        rating: populatedRide.userId.rating,
        department: populatedRide.userId.department,
      },
      route: {
        pickup: populatedRide.pickup.name,
        dropoff: populatedRide.dropoff.name,
      },
      seatsTaken: populatedRide.userId.seatsTaken,

      schedule: {
        date: populatedRide.date.toISOString().split('T')[0],  
        time: populatedRide.time,
        recurring: [],  
      },
      preferences: populatedRide.preferences,
      _raw: populatedRide  
    };

    res.status(201).json(formattedRideOffer); 
  } catch (error) {
    console.error('Error creating ride offer:', error);
    res.status(400).json({ message: error.message });
  }
};
