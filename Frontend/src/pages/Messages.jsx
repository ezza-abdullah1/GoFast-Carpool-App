import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSocket } from '../contexts/socket';

import ContactsSidebar from "../Components/Messaging/ContactsSidebar";
import ChatArea from "../Components/Messaging/ChatArea";
import EmptyChatState from "../Components/Messaging/EmptyChatState";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

axios.defaults.baseURL = API_URL;

export default function Messages() {
  const { socket, isConnected, connectError, reconnect } = useSocket();
  const [contacts, setContacts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [pendingMessages, setPendingMessages] = useState({});

  useEffect(() => {
    setLoading(true);
    console.log('Fetching contacts from:', `${API_URL}/api/contacts`);
    
    axios.get('/api/messages/contacts')
      .then(res => {
        console.log('Contacts response:', res.data);
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
  useEffect(() => {
    if (!activeId || !isConnected) return;
    
    console.log('Joining room for conversation:', activeId);
    socket.emit('join', activeId);
    
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
  
  useEffect(() => {
    if (!isConnected || !activeId) return;
    
    const handleNewMessage = (msg) => {
      console.log('New message received:', msg);
      
      const pendingKey = `${msg.id}`;
      
      if (msg.conversationId === activeId) {
        if (pendingMessages[pendingKey]) {
          console.log('Confirmed message delivery:', pendingKey);
          setPendingMessages(prev => {
            const updated = {...prev};
            delete updated[pendingKey];
            return updated;
          });
        } else {
          setMessages(prev => [...prev, msg]);
        }
      }
    };
    
    socket.on('newMessage', handleNewMessage);
    
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [isConnected, activeId, socket, pendingMessages]);

  const handleSend = (e, messageText) => {
    e.preventDefault();
    if (!messageText.trim() || !activeId || !isConnected) return;
    
    console.log('Sending message to conversation:', activeId);
    
    const tempId = `temp-${Date.now()}`;
    
    const newMessage = {
      id: tempId,
      conversationId: activeId,
      senderId: 'me',
      text: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pending: true 
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    axios.post('/api/messages', {
      conversationId: activeId,
      senderId: 'me',
      text: messageText.trim()
    })
    .then(response => {
      console.log('Message sent successfully:', response.data);
      
      setPendingMessages(prev => ({
        ...prev,
        [response.data.id]: tempId
      }));
      
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? {...response.data, pending: false} 
          : msg
      ));
    })
    .catch(err => {
      console.error('Error sending message:', err);
      setError('Failed to send message: ' + (err.message || 'Unknown error'));
      
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
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded">
          Try Again
        </button>
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
          <ContactsSidebar 
            contacts={contacts} 
            activeId={activeId} 
            setActiveId={setActiveId} 
          />

          {/* Chat Area or Empty State */}
          {activeContact ? (
            <ChatArea 
              activeContact={activeContact}
              messages={messages}
              loading={loading}
              isConnected={isConnected}
              connectError={connectError}
              handleSend={handleSend}
            />
          ) : (
            <EmptyChatState />
          )}
        </div>
      </main>
    </div>
  );
}