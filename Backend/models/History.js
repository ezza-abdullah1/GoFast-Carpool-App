const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true
  },
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ride", 
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now 
  }
});

module.exports = mongoose.model("History", historySchema);
