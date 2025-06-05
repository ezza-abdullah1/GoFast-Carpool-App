// src/components/Messaging/ContactsSidebar.jsx
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ContactsSidebar({ contacts, activeId, setActiveId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Filter contacts
  const filtered = searchTerm
    ? contacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : contacts;

  const selectContact = (id) => {
    setActiveId(id);
    navigate(location.pathname, {
      replace: true,
      state: { ...location.state, activeConversation: id }
    });
  };

  return (
    <aside className="w-80 bg-slate-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search contacts"
            className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700
                      scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
                      scrollbar-track-transparent py-2">
        {filtered.length > 0 ? filtered.map(contact => (
          <button
            key={contact.id}
            onClick={() => selectContact(contact.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 transition-colors",
              activeId === contact.id
                ? "bg-primary-100 dark:bg-primary-900/30"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            <div className="relative flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-lg font-medium text-gray-700 dark:text-gray-200">
                {contact.name.charAt(0).toUpperCase()}
              </div>
              {contact.isOnline && (
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white dark:ring-gray-800 bg-green-400" />
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {contact.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {contact.lastMessage}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className={cn(
                "text-xs truncate",
                contact.lastSeen === 'Online'
                  ? "text-green-500"
                  : "text-gray-500 dark:text-gray-400"
              )}>
                {contact.lastSeen === 'Online' ? '● Online' : contact.lastSeen}
              </span>
              {contact.unreadCount > 0 && (
                <span className="mt-1 inline-flex items-center justify-center h-5 px-2 text-xs font-semibold rounded-full bg-primary text-white">
                  {contact.unreadCount}
                </span>
              )}
            </div>
          </button>
        )) : (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No contacts found
          </div>
        )}
      </div>
    </aside>
  );
}
