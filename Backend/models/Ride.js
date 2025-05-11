const mongoose = require("mongoose");


const rideSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  pickup: {
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  dropoff: {
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  numberOfSeats: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true, // store as string like '4:30 pm'
  },
  preferences: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  Rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  RatingCount: {
    type: Number,
    default: 0,
    min: 0,
  },
});

module.exports = mongoose.models.Ride || mongoose.model("Ride", rideSchema);
