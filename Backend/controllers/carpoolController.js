const Ride = require("../models/Ride");
const Stop = require("../models/Stops");
delete require.cache[require.resolve("../models/User")];
const User = require("../models/User")

// Get all carpools
exports.getAllCarpools = async (req, res) => {
  try {
    // Find all active rides and populate the user details
    const carpools = await Ride.find({ status: "active",numberOfSeats: { $gt: 0 } })
      .populate(
        "userId",
        "fullName department email gender rating rides_taken rides_offered"
      )
      .lean();
      

    // Format the response to match the structure of the previous hardcoded data
    const formattedCarpools = carpools.map((carpool) => ({
      id: carpool._id.toString(),
      driver: {
        id: carpool.userId._id.toString(),
        name: carpool.userId.fullName,
        gender: carpool.userId.gender,
        rating: carpool.userId.rating,
        department: carpool.userId.department,
      },
      route: {
         pickup: {
          name: carpool.pickup.name,
          latitude: carpool.pickup.latitude,
          longitude: carpool.pickup.longitude,
        },
        dropoff: {
          name: carpool.dropoff.name,
          latitude: carpool.dropoff.latitude,
          longitude: carpool.dropoff.longitude,
        },
      },
      schedule: {
        date: carpool.date.toISOString().split("T")[0], // Format as YYYY-MM-DD
        time: carpool.time,
        recurring: [], // Your DB doesn't store recurring info, so we'll leave it empty
      },
      seats: {
        total: carpool.numberOfSeats,
        available: carpool.numberOfSeats - (carpool.seatsTaken || 0),
      },
      preferences: carpool.preferences,
      // Store the original data in a _raw property for reference if needed
      _raw: carpool,
    }));

    res.status(200).json(formattedCarpools);
  } catch (error) {
    console.error("Error fetching carpools:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get a single carpool
exports.getCarpoolById = async (req, res) => {
  try {
    const carpool = await Ride.findById(req.params.id)
      .populate(
        "userId",
        "fullName department email gender rating rides_taken rides_offered"
      )
      .lean();

    if (!carpool) {
      return res.status(404).json({ message: "Carpool not found" });
    }

    // Format the carpool data
    const formattedCarpool = {
      id: carpool._id.toString(),
      driver: {
        id: carpool.userId._id.toString(),
        name: carpool.userId.fullName,
        gender: carpool.userId.gender,
        rating: carpool.userId.rating,
        department: carpool.userId.department,
      },
      route: {
        pickup: carpool.pickup.name,
        dropoff: carpool.dropoff.name,
      },
      schedule: {
        date: carpool.date.toISOString().split("T")[0],
        time: carpool.time,
        recurring: [],
      },
      seats: {
        total: carpool.numberOfSeats,
        available: carpool.numberOfSeats - (carpool.seatsTaken || 0),
      },
      preferences: carpool.preferences,
      _raw: carpool,
    };

    res.status(200).json(formattedCarpool);
  } catch (error) {
    console.error("Error fetching carpool:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new carpool
exports.createCarpool = async (req, res) => {
  try {
    const { userId, pickup, dropoff, numberOfSeats, date, time, preferences } =
      req.body;

    // Create a new ride entry
    const newRide = new Ride({
      userId,
      pickup,
      dropoff,
      numberOfSeats,
      date,
      time,
      preferences,
      status: "active",
    });

    // Save the ride
    const savedRide = await newRide.save();

    // Update the user's rides_offered count
    await User.findByIdAndUpdate(userId, { $inc: { rides_offered: 1 } });

    // Fetch the saved ride with user details
    const populatedRide = await Ride.findById(savedRide._id)
      .populate(
        "userId",
        "fullName department email gender rating rides_taken rides_offered"
      )
      .lean();

    // Format the response
    const formattedCarpool = {
      id: populatedRide._id.toString(),
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
      schedule: {
        date: populatedRide.date.toISOString().split("T")[0],
        time: populatedRide.time,
        recurring: [],
      },
      seats: {
        total: populatedRide.numberOfSeats,
        available:
          populatedRide.numberOfSeats - (populatedRide.seatsTaken || 0),
      },
      preferences: populatedRide.preferences,
      _raw: populatedRide,
    };

    res.status(201).json(formattedCarpool);
  } catch (error) {
    console.error("Error creating carpool:", error);
    res.status(400).json({ message: error.message });
  }
};

// Update a carpool
exports.updateCarpool = async (req, res) => {
  try {
    const updates = req.body;

    // Find and update the ride
    const updatedRide = await Ride.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    )
      .populate(
        "userId",
        "fullName department email gender rating rides_taken rides_offered"
      )
      .lean();

    if (!updatedRide) {
      return res.status(404).json({ message: "Carpool not found" });
    }

    // Format the response
    const formattedCarpool = {
      id: updatedRide._id.toString(),
      driver: {
        name: updatedRide.userId.fullName,
        gender: updatedRide.userId.gender,
        rating: updatedRide.userId.rating,
        department: updatedRide.userId.department,
      },
      route: {
         pickup: {
          name: updatedRide.pickup.name,
          latitude: updatedRide.pickup.latitude,
          longitude: updatedRide.pickup.longitude,
        },
        dropoff: {
          name: updatedRide.dropoff.name,
          latitude: updatedRide.dropoff.latitude,
          longitude: updatedRide.dropoff.longitude,
        },
      },
      schedule: {
        date: updatedRide.date.toISOString().split("T")[0],
        time: updatedRide.time,
        recurring: [],
      },
      seats: {
        total: updatedRide.numberOfSeats,
        available: updatedRide.numberOfSeats - (updatedRide.seatsTaken || 0),
      },
      preferences: updatedRide.preferences,
      _raw: updatedRide,
    };

    res.status(200).json(formattedCarpool);
  } catch (error) {
    console.error("Error updating carpool:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCarpool = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate(
        "userId",
        "fullName department email gender rating rides_taken rides_offered"
      )
      .lean();

    if (!ride) {
      return res.status(404).json({ message: "Carpool not found" });
    }
   
    await Ride.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(ride.userId._id, {
      $inc: { rides_offered: -1 },
    });
    const formattedCarpool = {
      id: ride._id.toString(),
      driver: {
        name: ride.userId.fullName,
        gender: ride.userId.gender,
        rating: ride.userId.rating,
        department: ride.userId.department,
      },
      route: {
        pickup: ride.pickup.name,
        dropoff: ride.dropoff.name,
      },
      schedule: {
        date: ride.date.toISOString().split("T")[0],
        time: ride.time,
        recurring: [],
      },
      seats: {
        total: ride.numberOfSeats,
        available: ride.numberOfSeats - (ride.seatsTaken || 0),
      },
      preferences: ride.preferences,
      _raw: ride,
    };

    res.status(200).json(formattedCarpool);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchCarpools = async (req, res) => {
  try {
    const { pickup, dropoff, date, time, minSeats, filters } = req.body;

    const query = { status: "active" };

    if (pickup) {
      query["pickup.name"] = new RegExp(pickup, "i");
    }

    if (dropoff) {
      query["dropoff.name"] = new RegExp(dropoff, "i");
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      query.date = { $gte: startDate, $lte: endDate };
    }

    let rides = await Ride.find(query)
      .populate(
        "userId",
        "fullName department email gender rating rides_taken rides_offered"
      )
      .lean();

    function convert12HourToMinutes(time12h) {
      const [time, modifier] = time12h.toLowerCase().split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (modifier === "pm" && hours !== 12) hours += 12;
      if (modifier === "am" && hours === 12) hours = 0;
      return hours * 60 + minutes;
    }

    // Helper to convert "HH:mm" (like 08:30) to minutes since midnight
    function convert24HourToMinutes(time24h) {
      const [hours, minutes] = time24h.split(":").map(Number);
      return hours * 60 + minutes;
    }

    // Filter by time (±30 minutes range) in JavaScript (since MongoDB doesn't handle time strings well)
    if (time) {
      const targetMinutes = convert24HourToMinutes(time);
      rides = rides.filter((ride) => {
        const rideMinutes = convert12HourToMinutes(ride.time);
        return Math.abs(rideMinutes - targetMinutes) <= 30;
      });
    }

    // Filter by minimum available seats
    if (minSeats) {
      rides = rides.filter((ride) => {
        const availableSeats = ride.numberOfSeats - (ride.seatsTaken || 0);
        return availableSeats >= minSeats;
      });
    }

    // Apply additional filters
    if (filters && filters.length > 0) {
      rides = rides.filter((ride) => {
        // Female drivers only filter
        if (
          filters.includes("Female drivers only") &&
          ride.userId.gender !== "female"
        ) {
          return false;
        }

        // Male drivers only filter
        if (
          filters.includes("Male drivers only") &&
          ride.userId.gender !== "male"
        ) {
          return false;
        }

        // No smoking filter
        if (
          filters.includes("No smoking") &&
          (!ride.preferences || !ride.preferences.includes("No smoking"))
        ) {
          return false;
        }

        return true;
      });
    }

    // Format the response
    const formattedCarpools = rides.map((ride) => ({
      id: ride._id.toString(),
      driver: {
        name: ride.userId.fullName,
        gender: ride.userId.gender,
        rating: ride.userId.rating,
        department: ride.userId.department,
      },
      route: {
        pickup: {
          name: ride.pickup.name,
          latitude: ride.pickup.latitude,
          longitude: ride.pickup.longitude,
        },
        dropoff: {
          name: ride.pickup.name,
          latitude: ride.pickup.latitude,
          longitude: ride.pickup.longitude,
        },
      },
      schedule: {
        date: ride.date.toISOString().split("T")[0],
        time: ride.time,
        recurring: [],
      },
      seats: {
        total: ride.numberOfSeats,
        available: ride.numberOfSeats - (ride.seatsTaken || 0),
      },
      preferences: ride.preferences,
      _raw: ride,
    }));

    res.status(200).json(formattedCarpools);
  } catch (error) {
    console.error("Error searching carpools:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getUpcomingRides = async (req, res) => {
  const userId = req.params.id;
  try {
    const ridesAsDriver = await Ride.find({ userId,status:"active" }).lean();

   const stopsAsPassenger = await Stop.find({ userId, status: "accept" }).lean();

    const rideIdsFromStops = stopsAsPassenger.map(stop => stop.rideId.toString());

    const ridesAsPassenger = await Ride.find({
      _id: { $in: rideIdsFromStops, $nin: ridesAsDriver.map(r => r._id.toString()) }
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