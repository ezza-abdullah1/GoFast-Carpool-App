import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSocket } from '../contexts/socket';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import ContactsSidebar from "../Components/Messaging/ContactsSidebar";
import ChatArea from "../Components/Messaging/ChatArea";
import EmptyChatState from "../Components/Messaging/EmptyChatState";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = API_URL;
axios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default function Messages() {
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate
  const { socket, isConnected, connectError, reconnect } = useSocket();
  const user = useSelector(state => state.user.userDetails);
  const [contacts, setContacts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [pendingMessages, setPendingMessages] = useState({});
  const [processedMessageIds, setProcessedMessageIds] = useState(new Set());

  // Check for activeConversation or userId in location state (from navigation)
  useEffect(() => {
    if (location.state?.activeConversation) {
      setActiveId(location.state.activeConversation);
    } else if (location.state?.userIdToOpenChat) {
      // Try to find the contact ID based on the userId passed in state
      const contactToOpen = contacts.find(contact => contact.id === location.state.userIdToOpenChat);
      if (contactToOpen) {
        setActiveId(contactToOpen.id);
      }
    }
  }, [location.state, contacts]); // Added contacts to dependency array

  // Load contacts once
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    console.log('Fetching contacts from:', `${API_URL}/api/messages/contacts`);
    axios.get('/api/messages/contacts')
      .then(res => {
        console.log('Contacts response:', res.data);
        const contactsArray = Array.isArray(res.data) ? res.data : (res.data.contacts || []);
        setContacts(contactsArray);

        // If we have an activeId from navigation, it will be set in the other useEffect
        // Otherwise, set the first contact as active if no activeId yet
        if (!activeId && location.state?.userIdToOpenChat) {
          const contactToOpen = contactsArray.find(c => c.id === location.state.userIdToOpenChat);
          if (contactToOpen) {
            setActiveId(contactToOpen.id);
          } else if (contactsArray.length > 0) {
            setActiveId(contactsArray[0].id);
          }
        } else if (!activeId && contactsArray.length > 0) {
          setActiveId(contactsArray[0].id);
        }

        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading contacts:', err);
        setError('Failed to load contacts: ' + (err.message || 'Unknown error'));
        setLoading(false);
      });
  }, [user, location.state]); // Added location.state to dependency array

  // Join room effect
  useEffect(() => {
    if (!activeId || !isConnected || !socket) return;
    console.log('Joining room for conversation:', activeId);
    socket.emit('join', {
      conversationId: activeId,
      userId: user?.id
    });

    const handleJoined = (data) => {
      console.log('Joined room:', data);
      setJoinedRoom(true);
    };

    socket.on('joined', handleJoined);

    return () => {
      socket.off('joined', handleJoined);
      setJoinedRoom(false);
    };
  }, [activeId, isConnected, socket, user]);

  // Load messages when active contact changes
  useEffect(() => {
    if (!activeId) return;
    setProcessedMessageIds(new Set());
    setLoading(true);
    axios.get(`/api/messages/${activeId}`)
      .then(res => {
        console.log('Messages loaded:', res.data);
        const loadedMessages = res.data || [];
        const newProcessedIds = new Set(processedMessageIds);
        loadedMessages.forEach(msg => {
          if (msg.id && !msg.id.startsWith('temp-')) {
            newProcessedIds.add(msg.id);
          }
        });
        setProcessedMessageIds(newProcessedIds);
        setMessages(loadedMessages);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading messages:', err);
        setError('Failed to load messages: ' + (err.message || 'Unknown error'));
        setLoading(false);
      });
  }, [activeId]);

  // Listen for new messages
  useEffect(() => {
    if (!isConnected || !activeId || !socket) return;
    const handleNewMessage = (msg) => {
      console.log('New message received:', msg);
      if (msg.conversationId !== activeId) {
        return;
      }
      if (msg.id && processedMessageIds.has(msg.id)) {
        console.log('Skipping duplicate message:', msg.id);
        return;
      }
      if (msg.id) {
        setProcessedMessageIds(prev => new Set(prev).add(msg.id));
      }
      if (msg.senderId !== user?.id) {
        setMessages(prev => [...prev, msg]);
      }
    };
    socket.on('newMessage', handleNewMessage);
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [isConnected, activeId, socket, processedMessageIds, messages, user]);

  const handleSend = (e, messageText) => {
    e.preventDefault();
    if (!messageText.trim() || !activeId || !isConnected) return;
    console.log('Sending message to conversation:', activeId);
    const tempId = `temp-${Date.now()}`;
    const newMessage = {
      id: tempId,
      conversationId: activeId,
      senderId: user?.id || 'me',
      text: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pending: true
    };
    setMessages(prev => [...prev, newMessage]);
    axios.post('/api/messages', {
      conversationId: activeId,
      text: messageText.trim(),
      senderId: user?.id
    })
      .then(response => {
        console.log('Message sent successfully:', response.data);
        if (response.data.id) {
          setProcessedMessageIds(prev => new Set(prev).add(response.data.id));
        }
        setPendingMessages(prev => ({
          ...prev,
          [response.data.id]: tempId
        }));
        setMessages(prev => prev.map(msg =>
          msg.id === tempId
            ? { ...response.data, pending: false }
            : msg
        ));
      })
      .catch(err => {
        console.error('Error sending message:', err);
        setError('Failed to send message: ' + (err.message || 'Unknown error'));
        setMessages(prev => prev.map(msg =>
          msg.id === tempId
            ? { ...msg, failed: true, pending: false }
            : msg
        ));
      });
  };

  const activeContact = contacts.find(c => c.id === activeId);

  // Function to handle contact click from the sidebar
  const handleContactClick = (contactId) => {
    setActiveId(contactId);
    // No need to navigate again if already on the messages page
  };

  if (loading && contacts.length === 0) {
    return <div>Loading contacts...</div>;
  }
  if (error && contacts.length === 0) {
    return (
      <div>
        Error: {error}
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {!isConnected && (
        <div className="bg-yellow-200 p-2 text-yellow-800">
          Connection to messaging service lost.
          <button onClick={reconnect} className="ml-2 text-blue-500 hover:underline">
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
            setActiveId={handleContactClick} // Use the local handler
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
              currentUserId={user?.id}
              rideId={location.state?.rideId}
            />
          ) : (
            <EmptyChatState />
          )}
        </div>
      </main>
    </div>
  );
}