import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSocket } from '../contexts/socket'; // Import the socket hook

import {
  Search, MoreVertical, PhoneCall, Video, Send,
  MapPin, Calendar, Clock, Users
} from 'lucide-react';
import Button from '../Components/ui/compatibility-button';
import { cn } from '../lib/utils';

// Add API base URL - make sure this matches your backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Configure axios defaults
axios.defaults.baseURL = API_URL;

export default function Messages() {
  const { socket, isConnected, connectError, reconnect } = useSocket();
  const [contacts, setContacts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [pendingMessages, setPendingMessages] = useState({}); // Track pending messages

  const rideDetails = {
    date: 'Tomorrow, May 15, 2023',
    time: '8:15 AM',
    pickup: 'Morning Brew Cafe, North Nazimabad',
    dropoff: 'FAST NUCES Main Campus',
    seats: 1
  };

  // Load contacts once
  useEffect(() => {
    setLoading(true);
    console.log('Fetching contacts from:', `${API_URL}/api/contacts`);
    
    axios.get('/api/contacts')
      .then(res => {
        console.log('Contacts response:', res.data);
        // Handle both array format and object format with contacts property
        const contactsArray = Array.isArray(res.data) ? res.data : (res.data.contacts || []);
        setContacts(contactsArray);
        if (contactsArray.length > 0) {
          setActiveId(contactsArray[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading contacts:', err);
        setError('Failed to load contacts: ' + (err.message || 'Unknown error'));
        setLoading(false);
      });
  }, []);

  // Join room effect - separate from message loading
  useEffect(() => {
    if (!activeId || !isConnected) return;
    
    console.log('Joining room for conversation:', activeId);
    socket.emit('join', activeId);
    
    // Listen for join confirmation
    const handleJoined = (data) => {
      console.log('Joined room:', data);
      setJoinedRoom(true);
    };
    
    socket.on('joined', handleJoined);
    
    return () => {
      socket.off('joined', handleJoined);
      setJoinedRoom(false);
    };
  }, [activeId, isConnected, socket]);

  // Load messages when active contact changes
  useEffect(() => {
    if (!activeId) return;
    
    setLoading(true);
    axios.get(`/api/messages/${activeId}`)
      .then(res => {
        console.log('Messages loaded:', res.data);
        setMessages(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading messages:', err);
        setError('Failed to load messages: ' + (err.message || 'Unknown error'));
        setLoading(false);
      });
  }, [activeId]);
  
  // Listen for new messages - separate effect for socket events
  useEffect(() => {
    if (!isConnected || !activeId) return;
    
    const handleNewMessage = (msg) => {
      console.log('New message received:', msg);
      
      // Check if the message is one we already added optimistically
      const pendingKey = `${msg.id}`;
      
      if (msg.conversationId === activeId) {
        if (pendingMessages[pendingKey]) {
          // This is a message we already added - remove from pending
          console.log('Confirmed message delivery:', pendingKey);
          setPendingMessages(prev => {
            const updated = {...prev};
            delete updated[pendingKey];
            return updated;
          });
        } else {
          // This is truly a new message from someone else
          setMessages(prev => [...prev, msg]);
        }
      }
    };
    
    socket.on('newMessage', handleNewMessage);
    
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [isConnected, activeId, socket, pendingMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeId || !isConnected) return;
    
    console.log('Sending message to conversation:', activeId);
    
    // Create a temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create the message object for optimistic UI update
    const newMessage = {
      id: tempId,
      conversationId: activeId,
      senderId: 'me',
      text: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pending: true // Mark as pending until confirmed
    };
    
    // Add to UI immediately (optimistic update)
    setMessages(prev => [...prev, newMessage]);
    setMessageText('');
    
    axios.post('/api/messages', {
      conversationId: activeId,
      senderId: 'me',
      text: messageText.trim()
    })
    .then(response => {
      console.log('Message sent successfully:', response.data);
      
      // Add the real message ID to our pending messages map
      setPendingMessages(prev => ({
        ...prev,
        [response.data.id]: tempId
      }));
      
      // Update the temporary message with the real message ID and remove pending state
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? {...response.data, pending: false} 
          : msg
      ));
    })
    .catch(err => {
      console.error('Error sending message:', err);
      setError('Failed to send message: ' + (err.message || 'Unknown error'));
      
      // Mark the message as failed
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? {...msg, failed: true, pending: false} 
          : msg
      ));
    });
  };

  const activeContact = contacts.find(c => c.id === activeId);

  if (loading && contacts.length === 0) {
    return <div className="flex items-center justify-center h-screen">Loading contacts...</div>;
  }

  if (error && contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {!isConnected && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-4 py-2 text-center">
          <span>Connection to messaging service lost. </span>
          <button 
            onClick={reconnect}
            className="underline font-medium hover:text-yellow-900 dark:hover:text-yellow-100"
          >
            Reconnect
          </button>
        </div>
      )}
      
      <main className="flex-1 pt-16">
        <div className="h-[calc(100vh-64px)] flex">
          {/* Contacts Sidebar */}
          <div className="w-full max-w-xs border-r border-border bg-card hidden md:flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Messages</h2>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search contacts"
                  className="input-base w-full pl-9 py-1.5 h-9 text-sm"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {contacts.map(contact => (
                <button
                  key={contact.id}
                  className={cn(
                    "w-full text-left p-4 border-b border-border hover:bg-muted/50",
                    activeId === contact.id && "bg-muted"
                  )}
                  onClick={() => setActiveId(contact.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center overflow-hidden">
                        <span className="text-lg font-semibold text-primary-600 dark:text-primary-300">
                          {contact.name.charAt(0)}
                        </span>
                      </div>
                      {contact.isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className="font-medium truncate">{contact.name}</p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {contact.lastSeen === 'Online' ? (
                            <span className="text-green-500">●</span>
                          ) : contact.lastSeen}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {contact.lastMessage}
                      </p>
                    </div>
                    {contact.unreadCount > 0 && (
                      <div className="ml-2 flex-shrink-0 bg-primary text-white rounded-full h-5 min-w-5 flex items-center justify-center text-xs font-medium">
                        {contact.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeContact ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center overflow-hidden">
                        <span className="text-lg font-semibold text-primary-600 dark:text-primary-300">
                          {activeContact.name.charAt(0)}
                        </span>
                      </div>
                      {activeContact.isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{activeContact.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {activeContact.isOnline ? 'Online' : activeContact.lastSeen}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1 rounded-full hover:bg-muted transition-colors">
                      <PhoneCall className="h-5 w-5 text-muted-foreground" />
                    </button>
                    <button className="p-1 rounded-full hover:bg-muted transition-colors">
                      <Video className="h-5 w-5 text-muted-foreground" />
                    </button>
                    <button className="p-1 rounded-full hover:bg-muted transition-colors">
                      <MoreVertical className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto bg-muted/20 dark:bg-muted/5">
                  {/* Ride Details Card */}
                  <div className="mb-4 p-4 rounded-lg bg-card border border-border max-w-md mx-auto">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Ride Details</h4>
                      <Button variant="outline" size="sm">View Ride</Button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{rideDetails.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{rideDetails.time}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <div>From: {rideDetails.pickup}</div>
                          <div className="mt-1">To: {rideDetails.dropoff}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{rideDetails.seats} seat reserved</span>
                      </div>
                    </div>
                  </div>

                  {/* Message Bubbles */}
                  <div className="space-y-4">
                    {messages.length > 0 ? (
                      messages.map(msg => (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex",
                            msg.senderId === 'me' ? "justify-end" : "justify-start"
                          )}
                        >
                          <div className={cn(
                            "max-w-xs sm:max-w-md rounded-2xl px-4 py-2",
                            msg.senderId === 'me'
                              ? "bg-primary text-white rounded-tr-none"
                              : "bg-card border border-border rounded-tl-none"
                          )}>
                            <p>{msg.text}</p>
                            <div className={cn(
                              "text-xs mt-1 flex justify-end",
                              msg.senderId === 'me'
                                ? "text-primary-100"
                                : "text-muted-foreground"
                            )}>
                              {msg.timestamp}
                              {msg.pending && (
                                <span className="ml-2">⏳</span>
                              )}
                              {msg.failed && (
                                <span className="ml-2 text-red-300">❌</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : loading ? (
                      <div className="flex justify-center p-4">Loading messages...</div>
                    ) : (
                      <div className="flex justify-center p-4 text-muted-foreground">
                        No messages yet. Start the conversation!
                      </div>
                    )}
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border bg-card">
                  <form onSubmit={handleSend} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={isConnected ? "Type a message..." : "Reconnecting..."}
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      className="input-base flex-1"
                      disabled={!isConnected}
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={!isConnected || !messageText.trim()}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
                  {!isConnected && (
                    <p className="text-xs text-red-500 mt-2">
                      Disconnected from messaging service. Reconnecting...
                    </p>
                  )}
                  {connectError && (
                    <p className="text-xs text-red-500 mt-2">
                      Error: {connectError}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-muted/20 dark:bg-muted/5">
                <div className="text-center p-4">
                  <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                  <p className="text-muted-foreground">
                    Select a contact to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}