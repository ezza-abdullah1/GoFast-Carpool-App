// frontend/src/context/socket.js
import { io } from 'socket.io-client';

// Use import.meta.env.VITE_API_URL (fallback optional)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket  = io(API_URL);

export default socket;
