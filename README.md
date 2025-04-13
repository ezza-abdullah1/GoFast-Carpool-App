# GoFAST – Carpooling App for FAST NUCES Students 🚗

## 📌 Project Overview

The purpose of this project is to create a web application that connects FAST NUCES students for carpooling. This platform helps reduce transportation costs, promotes eco-friendly travel, and builds a stronger student community. Access is restricted to verified university emails to ensure safety and trust.

---

## 🎯 Introduction and Background

Carpooling is a smart way to reduce transportation costs, traffic, and pollution. While popular ride-sharing apps like InDrive and Yango exist, they don't address the specific needs of university students. GoFAST aims to fill this gap by offering a campus-specific, feature-rich carpooling experience.

---

## ❗ Problem Statement

FAST NUCES students face high travel costs and inefficient commuting due to a lack of centralized ride-sharing options. This app solves the issue by providing a trusted platform to coordinate carpools within the student body.

---

## 🚀 Core Features

### 🔐 1. User Authentication (Login/Signup)

- Sign up using a valid FAST university email (@nu.edu.pk)
- Secure login with JWT (JSON Web Token)
- Profile includes:
  - Name
  - Department
  - Batch
  - Contact info

---

### 📢 2. Carpool Post System

- Create ride posts with:
  - Pickup/Drop-off location
  - Departure time
  - Number of available seats
  - Ride preferences (e.g., female-only)
- Posts are visible to relevant students

---

### 🔎 3. Search & Filter System

- Filter by:
  - Route
  - Departure time
  - Gender preferences
  - Department & batch
- Optional map-based view for visual route selection

---

### 📩 4. Booking & Requests

- Send ride requests to post creators
- Accept/Decline ride requests
- Confirmation alerts both parties

---

### 🌟 5. Ride Reviews & Ratings

- Rate your ride (1-5 stars)
- Leave reviews for other users
- Filter rides based on rating

---

## 🧰 Tech Stack (MERN)

### Frontend:

- React.js
- React Router
- Tailwind CSS

### Backend:

- Node.js + Express.js
- JWT for authentication
- WebSockets for real-time features

### Database:

- MongoDB

---

## ➕ Additional Features

### 💬 1. Direct Messaging System

- Real-time chat using WebSockets
- Message notifications

### 🔁 2. Saved Routes & Ride History

- Save frequent routes
- View past rides and feedback

### 📍 3. Live Location Sharing

- Optional real-time location during rides for safety

### 🌙 4. Dark Mode & UI Customization

- Dark mode toggle
- Theme customization options

---

## ✅ Completeness Criteria

- Verified sign-up and profile creation
- Carpool post creation and filtering
- Booking and messaging working smoothly
- Review system in place
- Real-time location sharing
- App deployed and usable by students

---

## 🏁 Conclusion

GoFAST is designed to improve the daily commute for FAST NUCES students by making it easier to share rides. With a focus on trust, convenience, and sustainability, it creates a connected and eco-conscious student community.

---
