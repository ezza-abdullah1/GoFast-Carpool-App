const Ride = require("../models/Ride");
const Stop = require("../models/Stops");
delete require.cache[require.resolve("../models/User")];
const User = require("../models/User")

exports.getAllCarpools = async (req, res) => {
  try {
    const carpools = await Ride.find({ status: "active",numberOfSeats: { $gt: 0 } })
      .populate(
        "userId",
        "fullName department email gender rating rides_taken rides_offered"
      )
      .lean();
      

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
    }));

    res.status(200).json(formattedCarpools);
  } catch (error) {
    console.error("Error fetching carpools:", error);
    res.status(500).json({ message: error.message });
  }
};

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

exports.createCarpool = async (req, res) => {
  try {
    const { userId, pickup, dropoff, numberOfSeats, date, time, preferences } =
      req.body;

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

    const savedRide = await newRide.save();

    await User.findByIdAndUpdate(userId, { $inc: { rides_offered: 1 } });

    const populatedRide = await Ride.findById(savedRide._id)
      .populate(
        "userId",
        "fullName department email gender rating rides_taken rides_offered"
      )
      .lean();

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

exports.updateCarpool = async (req, res) => {
  try {
    const rideId = req.params.id;
    const updates = req.body;

    const existingRide = await Ride.findById(rideId).populate('userId');

    if (!existingRide) {
      return res.status(404).json({ message: "Carpool not found" });
    }

    if (updates.status === "inactive" && existingRide.status === "active") {
      const acceptedStops = await Stop.find({ rideId: rideId, status: "accept" }).populate('userId');

      for (const stop of acceptedStops) {
        if (stop.userId) {
          await User.findByIdAndUpdate(stop.userId._id, { $inc: { rides_taken: 1 } });
        }
      }
    }

    const updatedRide = await Ride.findByIdAndUpdate(
      rideId,
      { $set: updates },
      { new: true }
    )
      .populate(
        "userId",
        "fullName department email gender rating rides_taken rides_offered"
      )
      .lean();

    if (!updatedRide) {
      return res.status(404).json({ message: "Carpool not found after update" });
    }

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

    function convert24HourToMinutes(time24h) {
      const [hours, minutes] = time24h.split(":").map(Number);
      return hours * 60 + minutes;
    }

    if (time) {
      const targetMinutes = convert24HourToMinutes(time);
      rides = rides.filter((ride) => {
        const rideMinutes = convert12HourToMinutes(ride.time);
        return Math.abs(rideMinutes - targetMinutes) <= 30;
      });
    }

    if (minSeats) {
      rides = rides.filter((ride) => {
        const availableSeats = ride.numberOfSeats - (ride.seatsTaken || 0);
        return availableSeats >= minSeats;
      });
    }

    if (filters && filters.length > 0) {
      rides = rides.filter((ride) => {
        if (
          filters.includes("Female drivers only") &&
          ride.userId.gender !== "female"
        ) {
          return false;
        }

        if (
          filters.includes("Male drivers only") &&
          ride.userId.gender !== "male"
        ) {
          return false;
        }

        if (
          filters.includes("No smoking") &&
          (!ride.preferences || !ride.preferences.includes("No smoking"))
        ) {
          return false;
        }

        return true;
      });
    }

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
    const ridesAsDriver = await Ride.find({ userId, status: "active" }).lean();
    const stopsAsPassenger = await Stop.find({ userId, status: "accept" }).lean();
    const rideIdsFromStops = stopsAsPassenger.map(stop => stop.rideId.toString());
    const ridesAsPassenger = await Ride.find({
      _id: { $in: rideIdsFromStops, $nin: ridesAsDriver.map(r => r._id.toString()) }
    }).lean();

    const allRides = [...ridesAsDriver, ...ridesAsPassenger];
    const currentDate = new Date();

    const upcomingRides = [];
    for (const ride of allRides) {
      const rideDate = new Date(ride.date);
      rideDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);

      if (rideDate >= currentDate) {
        upcomingRides.push(ride);
      } else if (ride.status === "active") {
        await Ride.findByIdAndUpdate(ride._id, { status: "inactive" });
      }
    }

    const ridesWithStops = await Promise.all(
      upcomingRides.map(async (ride) => {
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