const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

/**
 * Get messages for a specific conversation
 */
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Get current user ID from token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUserId = decoded.userId;

    // Validate conversation exists and user is part of it
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === currentUserId.toString()
    );
    
    if (!isParticipant) {
      return res.status(403).json({ error: 'Not authorized to access this conversation' });
    }

    // Get messages
    const messages = await Message.find({ conversationId })
      .sort({ timestamp: 1 })
      .limit(100); // Limit to last 100 messages
    
    // Mark messages as read
    await Message.updateMany(
      { 
        conversationId,
        receiverId: currentUserId,
        read: false
      },
      { $set: { read: true } }
    );

    // Format messages for the front end
    const formattedMessages = messages.map(msg => ({
      id: msg._id.toString(),
      conversationId: msg.conversationId,
      senderId: msg.senderId.toString() === currentUserId.toString() ? 'me' : msg.senderId.toString(),
      text: msg.text,
      timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: msg.read
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

/**
 * Create a new message
 */
exports.postMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    // Get current user ID from token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUserId = decoded.userId;

    // Find conversation
    let conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Ensure user is part of the conversation
    const isParticipant = conversation.participants.some(
      p => p.toString() === currentUserId.toString()
    );
    
    if (!isParticipant) {
      return res.status(403).json({ error: 'Not authorized to message in this conversation' });
    }

    // Get the other participant
    const receiverId = conversation.participants.find(
      p => p.toString() !== currentUserId.toString()
    );

    // Create new message
    const newMessage = new Message({
      conversationId,
      senderId: currentUserId,
      receiverId,
      text,
      timestamp: new Date()
    });

    await newMessage.save();

    // Update conversation's last message
    conversation.lastMessage = text;
    conversation.lastMessageTimestamp = new Date();
    await conversation.save();

    // Format message for socket.io and response
    const formattedMessage = {
      id: newMessage._id.toString(),
      conversationId,
      senderId: 'me', // For the sender's UI
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    // Emit message via socket.io
    if (req.io) {
      // For other users, senderId should be the actual ID
      const socketMessage = {
        ...formattedMessage,
        senderId: currentUserId.toString()
      };
      
      req.io.to(conversationId).emit('newMessage', socketMessage);
    }

    res.status(201).json(formattedMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
};

/**
 * Create or get a conversation between two users
 */
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.params; // Target user to chat with
    
    // Get current user ID from token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUserId = decoded.userId;

    // Check if users exist
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, userId] }
    });

    // If no conversation exists, create one
    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUserId, userId],
        lastMessage: "",
        lastMessageTimestamp: new Date()
      });
      
      await conversation.save();
    }

    res.json({ conversationId: conversation._id });
  } catch (error) {
    console.error('Error creating/getting conversation:', error);
    res.status(500).json({ error: 'Failed to create/get conversation' });
  }
};