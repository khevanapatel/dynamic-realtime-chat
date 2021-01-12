const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const {
  formatMessage, 
  saveMessage,
  getMessages
} = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  setUser
} = require('./utils/users');
require('./database/connection');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord Bot';
setUser();
// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);
 
    // Welcome current user
    socket.emit('message', 
      {
        message:formatMessage(botName, 'Welcome to ChatCord!'),
        user: user
      });

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        {
        message:formatMessage(botName, `${user.username} has joined the chat`),
        user: user
      });
    var data = getRoomUsers(user.room);
    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });

    // var message = getMessages(user.room);
    // console.log("messages",message);
    io.to(user.room).emit('roomMessages', {
      user: user,
      room: user.room,
      messages: getMessages(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    var msgobj = formatMessage(user.username, msg);
    //store to database
    saveMessage(user,msgobj);
    io.to(user.room).emit('message',{message: msgobj, user:user});

  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        'message',
        {
        message: formatMessage(botName, `${user.username} has left the chat`),
        user: user
      });
     
      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
