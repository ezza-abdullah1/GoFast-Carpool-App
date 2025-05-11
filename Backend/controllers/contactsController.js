

const contacts = [
  { id: '1', name: 'Sara Malik', lastMessage: 'Sure, I can pick you up at 8:15 AM.', lastSeen: 'Online',   isOnline: true,  unreadCount: 2 },
  { id: '2', name: 'Ahmed Khan', lastMessage: 'Are you still offering the ride tomorrow?', lastSeen: '2 hours ago', isOnline: false, unreadCount: 0 },
  { id: '3', name: 'Bilal Ahmed', lastMessage: 'Thanks for the ride today!', lastSeen: '1 day ago',    isOnline: false, unreadCount: 0 },
  { id: '4', name: 'Ayesha Tariq', lastMessage: 'I\'m running 5 minutes late. Sorry!', lastSeen: '3 days ago', isOnline: false, unreadCount: 0 },
  { id: '5', name: 'Usman Ali', lastMessage: 'Where should we meet exactly?', lastSeen: '1 week ago', isOnline: false, unreadCount: 0 },
  { id: '6', name: 'Maria Baloch', lastMessage: 'Can I bring a friend?', lastSeen: '5 minutes ago', isOnline: true, unreadCount: 1 },
  { id: '7', name: 'Omar Farooq', lastMessage: 'I need to change pickup to DHA.', lastSeen: 'Yesterday', isOnline: false, unreadCount: 0 },
];

exports.getContacts = (req, res) => {
  
  res.json(contacts);
};
