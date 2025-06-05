// backend/controllers/contactsController.js

const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const jwt = require("jsonwebtoken");

/**
 * GET /api/messages/contacts
 * Returns only real, existing conversations for the authenticated user.
 */
exports.getContacts = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const token = authHeader.split(" ")[1];
    const { userId: currentUserId } = jwt.verify(token, process.env.JWT_SECRET);

    const conversations = await Conversation.find({
      participants: currentUserId
    })
      .sort({ lastMessageTimestamp: -1 })
      .populate("participants", "fullName email gender department isOnline");

    const contacts = await Promise.all(
      conversations.map(async conv => {
        const other = conv.participants.find(
          p => p._id.toString() !== currentUserId
        );
        if (!other) return null;

        const unreadCount = await Message.countDocuments({
          conversationId: conv._id.toString(),
          receiverId: currentUserId,
          read: false
        });

        return {
          id:           conv._id.toString(),
          socketRoomId: conv._id.toString(),
          userId:       other._id.toString(),
          name:         other.fullName,
          email:        other.email,
          department:   other.department,
          gender:       other.gender,
          isOnline:     other.isOnline || false,
          lastMessage:  conv.lastMessage,
          lastSeen:     conv.lastMessageTimestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        }),
          unreadCount
        };
      })
    );

    return res.json(contacts.filter(c => c));
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return res.status(500).json({ error: "Failed to fetch contacts" });
  }
};
