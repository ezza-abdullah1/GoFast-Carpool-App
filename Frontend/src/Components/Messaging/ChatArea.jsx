// src/components/Messaging/ChatArea.jsx

import React, { useState } from "react";
import { Send } from "lucide-react";
import { cn } from "../../lib/utils";
import ChatHeader from "./ChatHeader";
import RideDetailsCard from "./RideDetailsCard";
import MessageList from "./MessageList";

export default function ChatArea({
  activeContact,
  messages,
  loading,
  isConnected,
  connectError,
  handleSend,
  currentUserId,
  rideId,              // now correctly received
}) {
  const [messageText, setMessageText] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    handleSend(e, messageText);
    setMessageText("");
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat header */}
      <ChatHeader activeContact={activeContact} />

      {/* Ride details + message list */}
      <div className="flex-1 p-4 overflow-y-auto bg-muted/20 dark:bg-muted/5">
        {/* Only render the ride card if rideId is truthy */}
        {rideId && <RideDetailsCard rideId={rideId} />}

        {/* The rest of the conversation */}
        <MessageList
          messages={messages}
          loading={loading}
          currentUserId={currentUserId}
        />
      </div>

      {/* Input box */}
      <div className="p-4 border-t border-border bg-card">
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder={isConnected ? "Type a message…" : "Reconnecting…"}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="input-base flex-1"
            disabled={!isConnected}
          />
          <button
            type="submit"
            className={cn(
              "p-2 rounded-md hover:bg-primary/90",
              isConnected
                ? "bg-primary text-white"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            )}
            disabled={!isConnected || !messageText.trim()}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        {!isConnected && (
          <p className="mt-2 text-xs text-red-500">
            Disconnected. Reconnecting…
          </p>
        )}
        {connectError && (
          <p className="mt-1 text-xs text-red-500">Error: {connectError}</p>
        )}
      </div>
    </div>
  );
}
