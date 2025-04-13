import React, { useState } from 'react';
import { Search, MoreVertical, PhoneCall, Video, Send, MapPin, Calendar, Clock, Users } from 'lucide-react';
import Button from '../Components/ui/compatibility-button';
import Header from '../Components/layout/Header';
import Footer from '../Components/layout/Footer';
import { cn } from '../lib/utils'; // Fixed import path to match Dashboard component

const Messages = () => {
  const [activeContactId, setActiveContactId] = useState('1');
  const [messageText, setMessageText] = useState('');
  
  // Sample contacts data
  const contacts = [
    {
      id: '1',
      name: 'Sara Malik',
      lastMessage: 'Sure, I can pick you up at 8:15 AM.',
      lastSeen: 'Online',
      isOnline: true,
      unreadCount: 2,
    },
    {
      id: '2',
      name: 'Ahmed Khan',
      lastMessage: 'Are you still offering the ride tomorrow?',
      lastSeen: '2 hours ago',
      isOnline: false,
      unreadCount: 0,
    },
    {
      id: '3',
      name: 'Bilal Ahmed',
      lastMessage: 'Thanks for the ride today!',
      lastSeen: '1 day ago',
      isOnline: false,
      unreadCount: 0,
    },
    {
      id: '4',
      name: 'Ayesha Tariq',
      lastMessage: 'I\'m running 5 minutes late. Sorry!',
      lastSeen: '3 days ago',
      isOnline: false,
      unreadCount: 0,
    },
    {
      id: '5',
      name: 'Usman Ali',
      lastMessage: 'Where should we meet exactly?',
      lastSeen: '1 week ago',
      isOnline: false,
      unreadCount: 0,
    }
  ];
  
  // Find active contact
  const activeContact = contacts.find(contact => contact.id === activeContactId);
  
  // Sample messages data for Sara Malik (id: '1')
  const messages = [
    {
      id: '1',
      senderId: '1',
      text: 'Hi! I saw your carpool post for tomorrow morning.',
      timestamp: '10:30 AM',
      isRead: true,
    },
    {
      id: '2',
      senderId: 'me',
      text: 'Yes, I\'m going to FAST at 8:30 AM. Do you need a ride?',
      timestamp: '10:32 AM',
      isRead: true,
    },
    {
      id: '3',
      senderId: '1',
      text: 'That would be perfect! I have a class at 9:00 AM.',
      timestamp: '10:35 AM',
      isRead: true,
    },
    {
      id: '4',
      senderId: 'me',
      text: 'Great! Where should I pick you up?',
      timestamp: '10:38 AM',
      isRead: true,
    },
    {
      id: '5',
      senderId: '1',
      text: 'I live in North Nazimabad, Block A. There\'s a cafe called "Morning Brew" at the corner. Would that work as a meeting point?',
      timestamp: '10:40 AM',
      isRead: true,
    },
    {
      id: '6',
      senderId: 'me',
      text: 'Yes, I know that cafe. I can be there at 8:15 AM. Does that work for you?',
      timestamp: '10:45 AM',
      isRead: true,
    },
    {
      id: '7',
      senderId: '1',
      text: 'Sure, I can pick you up at 8:15 AM.',
      timestamp: 'Just now',
      isRead: false,
    },
  ];
  
  // Sample ride details
  const rideDetails = {
    date: 'Tomorrow, May 15, 2023',
    time: '8:15 AM',
    pickup: 'Morning Brew Cafe, North Nazimabad',
    dropoff: 'FAST NUCES Main Campus',
    seats: 1,
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim()) {
      // In a real app, this would send the message to the backend
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 pt-16">
        <div className="h-[calc(100vh-64px)] flex">
          {/* Contacts Sidebar */}
          <div className="w-full max-w-xs border-r border-border bg-card hidden md:flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Messages</h2>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
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
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  className={cn(
                    "w-full text-left p-4 border-b border-border transition-colors hover:bg-muted/50",
                    activeContactId === contact.id && "bg-muted"
                  )}
                  onClick={() => setActiveContactId(contact.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center overflow-hidden">
                        {contact.image ? (
                          <img
                            src={contact.image}
                            alt={contact.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-primary-600 dark:text-primary-300">
                            {contact.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      {contact.isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card"></span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className="font-medium truncate">{contact.name}</p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {contact.lastSeen === 'Online' ? (
                            <span className="text-green-500">●</span>
                          ) : (
                            contact.lastSeen
                          )}
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
                        {activeContact.image ? (
                          <img
                            src={activeContact.image}
                            alt={activeContact.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-primary-600 dark:text-primary-300">
                            {activeContact.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      {activeContact.isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card"></span>
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
                    <button className="p-2 rounded-full hover:bg-muted transition-colors">
                      <PhoneCall className="h-5 w-5 text-muted-foreground" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-muted transition-colors">
                      <Video className="h-5 w-5 text-muted-foreground" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-muted transition-colors">
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
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          message.senderId === 'me' ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-xs sm:max-w-md rounded-2xl px-4 py-2",
                            message.senderId === 'me'
                              ? "bg-primary text-white rounded-tr-none"
                              : "bg-card border border-border rounded-tl-none"
                          )}
                        >
                          <p>{message.text}</p>
                          <div
                            className={cn(
                              "text-xs mt-1 flex justify-end",
                              message.senderId === 'me' ? "text-primary-100" : "text-muted-foreground"
                            )}
                          >
                            {message.timestamp}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Message Input */}
                <div className="p-4 border-t border-border bg-card">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="input-base flex-1"
                    />
                    <Button type="submit" size="icon">
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-muted/20 dark:bg-muted/5">
                <div className="text-center p-8">
                  <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary-600 dark:text-primary-300"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Select a contact from the list to start a conversation or coordinate your carpool.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Messages;