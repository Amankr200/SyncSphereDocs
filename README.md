# SyncSphereDocs | Real-Time Collaborative Workspace

![SyncSphereDocs Banner](https://images.unsplash.com/photo-1512486133939-0c44c0ca9ddb?q=80&w=1200&auto=format&fit=crop)

**SyncSphereDocs** is a premium, high-performance real-time collaborative document editing platform. Built with a modern MERN stack and optimized Socket.io communication, it provides a seamless "Google Docs-like" experience with advanced presence tracking and granular permission controls.

---

## ✨ Features that Wow

*   **⚡ Lightning-Fast Collaboration**: Syncing changes across multiple clients in real-time with zero latency using optimized WebSocket communication.
*   **🛡️ Secure Authentication**: Robust JWT-based authentication system with encrypted password hashing and protected API routes.
*   **🎨 Premium Dashboard**: A sleek, modern document management interface with dynamic grid layouts and instant document creation.
*   **👥 Advanced Presence Tracking**:
    *   **Live User Badges**: See exactly who is online in your document.
    *   **Typing Indicators**: Real-time visual feedback ("Aman is typing...") for active collaborators.
    *   **Cursor Tracking**: (Coming Soon) Precision tracking of collaborator focus within the document.
*   **🔒 Intelligent Permissions**: 
    *   **Owner-Only Control**: Toggle between "Anyone can Edit" and "Anyone can View" instantly.
    *   **Dynamic UI Locking**: Non-owners are automatically restricted from editing when view-only mode is active.
*   **💾 Enterprise-Grade Auto-Save**: Background persistence to MongoDB Atlas ensures you never lose a single keystroke.

---

## 🛠️ Modern Tech Stack

*   **Frontend**: 
    *   [React](https://reactjs.org/) - Component-based architecture
    *   [Vite](https://vitejs.dev/) - Ultra-fast build tool
    *   [Quill.js](https://quilljs.com/) - Rich text editor core
    *   [Socket.io-client](https://socket.io/) - Real-time client communication
*   **Backend**: 
    *   [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/) - High-performance server
    *   [Socket.io](https://socket.io/) - Bidirectional event-based communication
    *   [MongoDB Atlas](https://www.mongodb.com/atlas) - Distributed cloud database
    *   [Mongoose](https://mongoosejs.com/) - Elegant data modeling
*   **Security**: 
    *   JSON Web Tokens (JWT) for stateless session management
    *   BcryptJS for secure password hashing
    *   CORS protection with dynamic origin trust

---

## 🚀 Getting Started

### Prerequisites

*   **Node.js** (v18.0.0 or higher)
*   **MongoDB Atlas Account** (or a local MongoDB instance)

### Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Amankr200/SyncSphereDocs.git
    cd SyncSphereDocs
    ```

2.  **Configure Backend**:
    *   Navigate to `/server` and create a `.env` file:
    ```env
    MONGODB_URI=your_mongodb_atlas_connection_string
    JWT_SECRET=your_strong_secret_key
    PORT=3001
    FRONTEND_URL=http://localhost:5173
    ```
    *   Install dependencies: `npm install`

3.  **Configure Frontend**:
    *   Navigate to `/client` and create a `.env` file:
    ```env
    VITE_API_URL=http://localhost:3001/api
    VITE_SOCKET_URL=http://localhost:3001
    ```
    *   Install dependencies: `npm install`

### Running Locally

1.  **Start the Backend Engine**:
    ```bash
    cd server
    npm run dev
    ```

2.  **Launch the Frontend Interface**:
    ```bash
    cd client
    npm run dev
    ```

---

## 📂 Architecture Overview

```text
SyncSphereDocs/
├── client/                 # React UI Layer
│   ├── src/
│   │   ├── api/            # Centralized API Interceptors
│   │   ├── context/        # Global Auth & State Management
│   │   ├── pages/          # Premium Page Components
│   │   └── TextEditor.jsx  # Real-Time Engine Integration
├── server/                 # Node.js Core Backend
│   ├── config/             # DB & Socket configurations
│   ├── models/             # Schema Definitions (User, Doc)
│   ├── routes/             # RESTful API Endpoints
│   └── server.js           # Shared Socket Room Logic
└── README.md
```

---

## 🧩 Troubleshooting & Resilience

**Stuck on "Loading..."?**
We've implemented a **dual-retry mechanism**:
1.  The client now prefers **WebSockets** for better performance.
2.  If the editor stays on "Loading..." for more than 5 seconds, it automatically re-pings the server to fetch the latest document state.
3.  Ensure your backend is running (`node server.js`) and MongoDB Atlas is accessible.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

*Built with ❤️ by [Aman](https://github.com/Amankr200)*
