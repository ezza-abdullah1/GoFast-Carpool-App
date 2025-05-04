const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ride", 
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true
  },
  location: {
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  status: {
    type: String,
    enum: ['pending', 'accept', 'decline'],
    default: 'pending'
  }
});

module.exports = mongoose.model("Stop", stopSchema);
