const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

/**
 * Get all contacts for the current user with their last messages
 */
exports.getContacts = async (req, res) => {
  try {
    // Get current user ID from token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUserId = decoded.userId;

    // Find all conversations that include the current user
    const conversations = await Conversation.find({
      participants: { $in: [currentUserId] }
    }).populate({
      path: 'participants',
      select: 'fullName email gender department'
    }).sort({ lastMessageTimestamp: -1 });

    // Format conversations into contacts list
    const contacts = await Promise.all(conversations.map(async (conv) => {
      // Find the other participant (not the current user)
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== currentUserId.toString()
      );

      if (!otherParticipant) {
        return null; // Skip if somehow there's no other participant
      }

      // Get unread count
      const unreadCount = await Message.countDocuments({
        conversationId: conv._id.toString(),
        receiverId: currentUserId,
        read: false
      });

      return {
        id: conv._id.toString(),
        socketRoomId: `sample-${conv._id.toString()}`, // Add this for socket.io
        name: otherParticipant.fullName,
        email: otherParticipant.email,
        department: otherParticipant.department,
        gender: otherParticipant.gender,
        userId: otherParticipant._id.toString(),
        isOnline: false, // You can implement online status with socket.io
        lastMessage: conv.lastMessage,
        lastSeen: conv.lastMessageTimestamp 
          ? new Date(conv.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Never',
        unreadCount
      };
    }));

    // Filter out any null values
    const validContacts = contacts.filter(contact => contact !== null);

    // If no contacts, return an empty array or create real conversations
    if (validContacts.length === 0) {
      // Find all users
      const allUsers = await User.find({ _id: { $ne: currentUserId } })
        .select('fullName email gender department')
        .limit(5);
        
      // Create REAL conversations for these users instead of sample ones
      const realContacts = await Promise.all(allUsers.map(async (user) => {
        // Create actual conversation in the database
        let conversation = await Conversation.findOne({
          participants: { $all: [currentUserId, user._id] }
        });

        // If no conversation exists, create one
        if (!conversation) {
          conversation = new Conversation({
            participants: [currentUserId, user._id],
            lastMessage: "No messages yet",
            lastMessageTimestamp: new Date()
          });
          
          await conversation.save();
        }

        return {
          id: conversation._id.toString(),
          socketRoomId: `sample-${conversation._id.toString()}`, // For socket compatibility
          name: user.fullName,
          email: user.email,
          department: user.department,
          gender: user.gender,
          userId: user._id.toString(),
          isOnline: false,
          lastMessage: conversation.lastMessage || "No messages yet",
          lastSeen: conversation.lastMessageTimestamp 
            ? new Date(conversation.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'New',
          unreadCount: 0
        };
      }));
      
      return res.json(realContacts);
    }

    return res.json(validContacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
};