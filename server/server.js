require('dotenv').config()
const mongoose = require("mongoose")
const Document = require("./models/Document")
const User = require("./models/User")
const http = require("http")
const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")

// Redis Scale-out
const { createClient } = require("redis")
const { createAdapter } = require("@socket.io/redis-adapter")

const app = express()
app.use(cors({
    origin: true, // Reflect the request origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
    credentials: true
}))
app.use(express.json())

// Logging Middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

// Connect to Database
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/google-docs-clone";
mongoose.connect(MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/documents'));

const server = http.createServer(app)
const io = require("socket.io")(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
    },
})

// Redis Adapter Setup
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const pubClient = createClient({ url: REDIS_URL });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    console.log("Redis Adapter connected");
}).catch(err => {
    console.warn("Redis connection failed or not provided. Using in-memory adapter instead.");
});


// Authentication Middleware for Socket.io
io.use((socket, next) => {
    if (socket.handshake.auth && socket.handshake.auth.token) {
        jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
            if (err) return next(new Error('Authentication error'));
            socket.user = decoded.user;
            next();
        });
    } else {
        next(new Error('Authentication error'));
    }
});

const defaultValue = { ops: [{ insert: "" }] }
// Map to track connected users per document
// documentId -> Set<socketId>
// Note: With horizontal scaling, this in-memory Map only tracks LOCAL users on this instance.
// For true global presence, you would need to store presence in Redis (e.g. Redis Sets).
const documentUsers = new Map();

io.on("connection", socket => {
    console.log(`User connected: ${socket.user ? socket.user.id : 'Anonymous'} (${socket.id})`);

    // Fetch user details immediately to have their name ready
    User.findById(socket.user.id).select('name').then(user => {
        socket.userInfo = user;
        // If they are already in a document room, update their presence name
        for (const [docId, users] of documentUsers.entries()) {
            if (users.has(socket.id)) {
                users.get(socket.id).name = user.name;
                io.to(docId).emit("active-users", Array.from(users.values()));
            }
        }
    });

    socket.on("get-document", async documentId => {
        console.log(`Getting document: ${documentId} for user: ${socket.user.id}`);
        try {
            const document = await findOrCreateDocument(documentId, socket.user.id);
            if (!document) {
                console.log(`Document ${documentId} could not be found or created.`);
                return;
            }

            socket.join(documentId);
            socket.emit("load-document", {
                data: document.data,
                title: document.title,
                owner: document.owner,
                shareMode: document.shareMode || 'edit',
                currentUser: socket.user.id
            });
            console.log(`Document ${documentId} loaded and emitted to client`);

            // Track user presence (Local only for now)
            if (!documentUsers.has(documentId)) {
                documentUsers.set(documentId, new Map());
            }
            documentUsers.get(documentId).set(socket.id, {
                name: socket.userInfo ? socket.userInfo.name : "Unknown",
                userId: socket.user.id
            });

            // Broadcast updated user list to everyone in the room
            io.to(documentId).emit("active-users", Array.from(documentUsers.get(documentId).values()));

            socket.on("send-changes", async delta => {
                // Check Document Permission
                const doc = await Document.findById(documentId);
                const isOwner = doc.owner && doc.owner.toString() === socket.user.id;

                // If shareMode is 'view' and user is NOT owner, reject edits
                if (doc.shareMode === 'view' && !isOwner) {
                    return;
                }

                socket.broadcast.to(documentId).emit("receive-changes", delta);
            });

            socket.on("permission-change", async (newShareMode) => {
                // Only owner can change permissions
                const doc = await Document.findById(documentId);
                if (doc.owner && doc.owner.toString() === socket.user.id) {
                    doc.shareMode = newShareMode;
                    await doc.save();
                    // Broadcast new permission to everyone so they can update UI immediately
                    io.to(documentId).emit("permission-updated", newShareMode);
                }
            });

            socket.on("save-document", async data => {
                const doc = await Document.findById(documentId);
                const isOwner = doc.owner && doc.owner.toString() === socket.user.id;

                // Only allow saving if owner or if shared for editing
                if (doc.shareMode === 'edit' || isOwner) {
                    await Document.findByIdAndUpdate(documentId, { data });
                }
            });

            // Cursor Tracking
            socket.on("send-cursor-position", (range) => {
                if (!socket.userInfo) return;
                socket.broadcast.to(documentId).emit("receive-cursor-position", {
                    range,
                    user: socket.userInfo.name,
                    socketId: socket.id
                });
            });

            // Typing Indicators
            socket.on("typing-start", () => {
                if (!socket.userInfo) return;
                socket.broadcast.to(documentId).emit("user-typing", { user: socket.userInfo.name, isTyping: true });
            });

            socket.on("typing-end", () => {
                if (!socket.userInfo) return;
                socket.broadcast.to(documentId).emit("user-typing", { user: socket.userInfo.name, isTyping: false });
            });

            // Handle Disconnect specifically for this document room logic
            socket.on('disconnect', () => {
                if (documentUsers.has(documentId)) {
                    documentUsers.get(documentId).delete(socket.id);
                    // Broadcast updated list
                    io.to(documentId).emit("active-users", Array.from(documentUsers.get(documentId).values()));
                }
            });

        } catch (e) {
            console.error(`Error in get-document for ${documentId}:`, e);
            socket.emit("error", "Failed to load document");
        }
    });
});

async function findOrCreateDocument(id, userId) {
    if (id == null) return

    try {
        const document = await Document.findById(id)
        if (document) return document

        console.log(`Creating new document: ${id}`);
        return await Document.create({
            _id: id,
            data: defaultValue,
            owner: userId,
            title: "Untitled Document"
        })
    } catch (err) {
        console.error("Database error in findOrCreateDocument:", err);
        throw err;
    }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
