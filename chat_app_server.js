const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const multer = require('multer');

// Initialize the app and server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Configure Multer for file uploads
const upload = multer({ dest: 'public/uploads/' });

// Active users
const activeUsers = {};

// Serve pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/chat.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'chat.html')));
app.get('/private-chat.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'private-chat.html')));

// Handle file uploads
app.post('/upload-photo', upload.single('photo'), (req, res) => {
  const photoPath = `/uploads/${req.file.filename}`;
  res.json({ photoPath });

  console.log('File uploaded:', req.file);
  
  
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Store username when user joins
  socket.on('join', (username) => {
    activeUsers[socket.id] = username;
    console.log(`${username} joined the chat`);
    io.emit('user-joined', username);
  });

  // Broadcast messages
  socket.on('send-message', (data) => {
    const { sender, message, photo } = data;

    if (photo) {
      console.log(`${sender} sent a photo: ${photo}`);
    } else {
      console.log(`${sender} sent a message: ${message}`);
    }

    io.emit('receive-message', { sender, message, photo });
  });

  // Private chat
  socket.on('start-private-chat', ({ sender, recipient }) => {
    const recipientSocketId = Object.keys(activeUsers).find(
      (id) => activeUsers[id] === recipient
    );

    if (recipientSocketId) {
      io.to(recipientSocketId).emit('private-chat-request', { sender });
    } else {
      socket.emit('private-chat-error', 'User not found or not online.');
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const username = activeUsers[socket.id];
    delete activeUsers[socket.id];
    console.log(`${username} disconnected`);
    io.emit('user-left', username);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;  // Use Railway's assigned PORT
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
