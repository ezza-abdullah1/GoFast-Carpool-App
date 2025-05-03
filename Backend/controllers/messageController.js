// backend/controllers/messageController.js
// Create this file to match the import in your routes

const messages = [
  {
    conversationId: '1',
    history: [
      { id: '1', senderId: '1', text: 'Hi! I saw your carpool post for tomorrow morning.', timestamp: '10:30 AM' },
      { id: '2', senderId: 'me', text: 'Yes, I\'m going to FAST at 8:30 AM. Do you need a ride?', timestamp: '10:32 AM' },
      { id: '3', senderId: '1', text: 'That would be perfect! I have a class at 9:00 AM.', timestamp: '10:35 AM' },
      { id: '4', senderId: 'me', text: 'Great! Where should I pick you up?', timestamp: '10:38 AM' },
      { id: '5', senderId: '1', text: 'Morning Brew Cafe, North Nazimabad. See you there!', timestamp: '10:40 AM' },
      { id: '6', senderId: 'me', text: 'See you then!', timestamp: '10:45 AM' },
      { id: '7', senderId: '1', text: 'Can you wait 2 more mins? Stuck in traffic.', timestamp: 'Just now' },
    ],
  },
  {
    conversationId: '2',
    history: [
      { id: '1', senderId: '2', text: 'Hey, need a seat for tomorrow?', timestamp: 'Yesterday, 5:15 PM' },
      { id: '2', senderId: 'me', text: 'Yes, one seat left. Pickup at your place?', timestamp: 'Yesterday, 5:17 PM' },
      { id: '3', senderId: '2', text: 'Perfect, see you at 8!', timestamp: 'Yesterday, 5:20 PM' },
    ],
  },
  {
    conversationId: '6',
    history: [
      { id: '1', senderId: '6', text: 'Can I bring a friend along?', timestamp: 'Today, 9:00 AM' },
      { id: '2', senderId: 'me', text: 'Sure, there\'s one extra seat.', timestamp: 'Today, 9:05 AM' },
    ],
  },
];

exports.getMessages = (req, res) => {
  const { conversationId } = req.params;
  const convo = messages.find(c => c.conversationId === conversationId);
  res.json(convo ? convo.history : []);
};

exports.postMessage = (req, res) => {
  const { conversationId, senderId, text } = req.body;
  const newMsg = {
    id: Date.now().toString(),
    senderId,
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  
  let convo = messages.find(c => c.conversationId === conversationId);
  if (!convo) {
    convo = { conversationId, history: [] };
    messages.push(convo);
  }
  
  convo.history.push(newMsg);
  
  // Check if io is available before emitting
  if (req.io) {
    req.io.to(conversationId).emit('newMessage', { ...newMsg, conversationId });
  }
  
  res.status(201).json(newMsg);
};