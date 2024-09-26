const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:4000', // Point to your Next.js app
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`New client connected with ID: ${socket.id}`);
  
  // Handle room creation and joining
  socket.on('create-room', (fileId) => {
    socket.join(fileId);
    console.log(`Client ${socket.id} has joined/created room: ${fileId}`);
  });

  // Broadcast changes to other clients in the room
  socket.on('send-changes', (deltas, fileId) => {
    console.log(`Received changes from client ${socket.id}`);
    console.log(deltas);
    socket.to(fileId).emit('receive-changes', deltas, fileId);
  });

  // Broadcast cursor movements to other clients in the room
  socket.on('send-cursor-move', (range, fileId, cursorId) => {
    console.log(`Cursor move from client ${socket.id} in room ${fileId}`);
    socket.to(fileId).emit('receive-cursor-move', range, fileId, cursorId);
  });

  // Handle leaving the room
  socket.on('leave-room', (fileId) => {
    socket.leave(fileId);
    console.log(`Client ${socket.id} has left room: ${fileId}`);
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log(`Client ${socket.id} disconnected`);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});
