import React, { useEffect, useState } from 'react'; 
import { Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ChatHeader from './ChatHeader';
import RideDetailsCard from './RideDetailsCard';
import MessageList from './MessageList';

export default function ChatArea({ 
  activeContact, 
  messages, 
  loading, 
  isConnected, 
  connectError,
  handleSend 
}) {
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (connectError) {
      toast.error(`Connection error: ${connectError}`);
    } else if (!isConnected) {
      toast.error("Disconnected. Attempting to reconnect...");
    }
  }, [connectError, isConnected]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error("You are disconnected. Message not sent.");
      return;
    }

    const trimmed = messageText.trim();

    if (!trimmed) {
      toast.error("Message cannot be empty.");
      return;
    }

    if (trimmed.length > 500) {
      toast.error("Message is too long (max 500 characters).");
      return;
    }

    try {
      await handleSend(e, trimmed);
      setMessageText('');
    } catch (err) {
      toast.error("Failed to send message. Please try again.");
      console.error("Send error:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <ChatHeader activeContact={activeContact} />

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-muted/20 dark:bg-muted/5">
        <RideDetailsCard />
        <MessageList messages={messages} loading={loading} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder={isConnected ? "Type a message..." : "Reconnecting..."}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="input-base flex-1"
            disabled={!isConnected}
          />
          <button
            type="submit"
            className="p-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isConnected || !messageText.trim()}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        {!isConnected && (
          <p className="text-xs text-red-500 mt-2">
            Disconnected from messaging service. Reconnecting...
          </p>
        )}
        {connectError && (
          <p className="text-xs text-red-500 mt-1">
            Error: {connectError}
          </p>
        )}
      </div>
    </div>
  );
}
