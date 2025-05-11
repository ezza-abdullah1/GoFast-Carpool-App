const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: String,
    default: ""
  },
  lastMessageTimestamp: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure participants are unique in each conversation
conversationSchema.index({ participants: 1 }, { unique: true });

module.exports = mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);