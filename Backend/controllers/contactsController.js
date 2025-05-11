const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');

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

    // If no contacts, return an empty array
    if (validContacts.length === 0) {
      // For debugging - find all users
      const allUsers = await User.find({ _id: { $ne: currentUserId } })
        .select('fullName email gender department')
        .limit(5);
        
      // Create sample contacts with mock data for testing
      const sampleContacts = allUsers.map(user => ({
        id: `sample-${user._id}`,
        name: user.fullName,
        email: user.email,
        department: user.department,
        gender: user.gender,
        userId: user._id.toString(),
        isOnline: false,
        lastMessage: "No messages yet",
        lastSeen: "New",
        unreadCount: 0
      }));
      
      return res.json(sampleContacts);
    }

    return res.json(validContacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
};