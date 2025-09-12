# Hawir

Hawir is a **mobile and web platform** that connects Ethiopian people with travel agencies, enabling them to **book and hold tickets from anywhere**. The system is designed with **Clean Architecture**, follows a **microservices-inspired subsystem decomposition**, and uses **NoSQL databases**.

---

## 🚀 Features

* Book and hold tickets through partnered travel agencies
* Real-time bus tracking with map integration
* Multi-language and multi-calendar support
* Fingerprint login (biometric authentication)
* Event and advertisement management
* Rating, feedback, and reporting modules
* Notifications for booking updates, travel reminders, and reschedules

---

## 🏗️ System Subsystems

Hawir has **Main functionalities**:

1. **Authentication Subsystem**

   * Registration, login (email, phone, OAuth2)
   * Token management (JWT with access & refresh tokens)
   * Email & SMS verification
   * Password encryption
     
2. **Destination Lookup**
   
    * Information about locations
    * Weather API integration
    * User-generated content (travel experiences)
      
4. **User Profile Management**

   * Profile picture management
   * Name, email, phone, and password updates
   * Preference setups

5. **Event Management**

   * Posting, editing, removing, and searching events

6. **Advertisement Management**

   * Posting, removing, accessing, and scheduling advertisements

7. **Travel Management**

   * Posting, editing, canceling, and retrieving travel info
   * Search and filtering of travels

8. **Booking Management**

   * Seat availability & selection
   * Booking & payment integration
   * Travel cancelation (traveler side)
   * Ticket release for unpaid bookings
   * Booking history retrieval

9. **Notification**

   * Booking updates, travel reminders, cancelations, and reschedules

10. **Bus Tracking**

   * Real-time GPS location tracking
   * Map integration with moving bus icon

11. **Rating & Feedback**

    * Traveler ratings & feedback for agencies
    * Commenting system
    * Average and overall rating calculation

12. **Report Generation**

    * Analytical reports for agencies and admins

---

## 🛠️ Tech Stack

* **Backend:** Go (Gin Framework)
* **Frontend:** React (Web)
* **Database:** NoSQL (MongoDB)
* **Authentication:** JWT (Access & Refresh tokens)
* **Deployment:** Render

---

## 📂 Repository Structure

```
Hawir/
│-- backend/          # Go backend (Gin APIs)
│-- frontend/         # React web app
│-- README.md         # Project overview
```

---

## 📌 Getting Started

### Prerequisites

* Go 1.20+
* MongoDB

### Setup

1. Clone the repo:

   ```bash
   git clone https://github.com/yigebis/Hawir.git
   cd Hawir
   ```
2. Setup backend:

   ```bash
   cd backend
   go run Delivery/main.go
   ```
3. Setup frontend:

   ```bash
   cd frontend
   npm install
   npm start
   ```
---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

---

## 👨‍💻 Authors

* **Yigerem Bisrat** – Backend Developer
* **Yohannes Belay** - Backend Developer
* **Yodahe Gosa** - Web Application Developer
* **Newal Yimam** - Web Application Developer
