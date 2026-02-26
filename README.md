# Real-Time Collaboration App (Google Docs Clone)

A scalable, real-time collaborative document editing system built with the MERN stack and Socket.io. This application allows multiple users to edit documents simultaneously with distinct user presence, typing indicators, and granular permission controls.

## 🚀 Key Features

*   **Real-Time Collaboration**: Multiple users can edit the same document concurrently with changes syncing instantly.
*   **User Authentication**: Secure JWT-based sign-up and login system.
*   **Document Dashboard**: Manage all your documents in one place with a clean grid view.
*   **Live User Presence**: See who is currently viewing the document with real-time "Online" badges.
*   **Typing Indicators**: Visual feedback when other users are typing (e.g., *"Aman is typing..."*).
*   **Link Sharing & Permissions**:
    *   **Edit Mode**: Anyone with the link can edit the document.
    *   **View Only Mode**: Owners can lock the document to "View Only" for all other users.
*   **Auto-Save**: All changes are automatically persisted to MongoDB in real-time.

## 🛠️ Tech Stack

*   **Frontend**: React, Vite, Quill.js, Socket.io Client
*   **Backend**: Node.js, Express, Socket.io, MongoDB, Mongoose
*   **Authentication**: JSON Web Tokens (JWT), Bcrypt
*   **Styling**: Vanilla CSS (Clean and responsive design)

## 📦 Getting Started

### Prerequisites

*   Node.js (v14+)
*   MongoDB (running locally on default port `27017`)

### Installation

1.  **Clone the repository** (if applicable)
2.  **Install Backend Dependencies**:
    ```bash
    cd server
    npm install
    ```
3.  **Install Frontend Dependencies**:
    ```bash
    cd client
    npm install
    ```

### Running the Application

1.  **Start MongoDB**: Ensure your local MongoDB instance is running (`mongod`).
2.  **Start Backend Server**:
    ```bash
    cd server
    npm run dev
    # Server runs on http://localhost:3001
    ```
3.  **Start Frontend Client**:
    ```bash
    cd client
    npm run dev
    # Client runs on http://localhost:5173
    ```

## 📖 Usage Guide

1.  **Registration**: Open `http://localhost:5173` and create an account.
2.  **Dashboard**: After login, you will see your document dashboard. Click **+ New Document** to start.
3.  **Editing**: Type in the editor. Your changes are saved automatically.
4.  **Collaboration**:
    *   Copy the URL and share it with a friend (or open in an Incognito window).
    *   Log in as a different user to see the real-time presence and typing indicators.
5.  **Sharing Permissions**:
    *   As the **Owner**, use the dropdown in the top-right to switch between **Anyone can Edit** and **Anyone can View**.
    *   Notice how other users' editors become disabled instantly when "View" mode is selected.

## 📂 Project Structure

```
/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── api/            # Axios setup & Interceptors
│   │   ├── components/     # Reusable components (PrivateRoute)
│   │   ├── context/        # Auth Context Provider
│   │   ├── pages/          # Login, Register, Dashboard
│   │   ├── TextEditor.jsx  # Main Editor with Socket logic
│   │   └── style.css       # Global styles
│   └── ...
└── server/                 # Node.js Backend
    ├── config/             # Configuration files
    ├── controllers/        # (Optional) Route controllers
    ├── middleware/         # Auth & Logging middleware
    ├── models/             # Mongoose Models (User, Document)
    ├── routes/             # API Routes (Auth, Documents)
    └── server.js           # Main Entry Point & Socket.io Logic
```
