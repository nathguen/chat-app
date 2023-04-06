import http from "http";
import express from "express";
import path from "path";
import { Server } from "socket.io";
import Filter from "bad-words";
import { generateLocationMessage, generateMessage } from "./utils/messages";
import { addUser, removeUser, getUser, getUsersInRoom } from "./utils/users";

const filter = new Filter();


const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3001;

const publicDirectory = path.join(__dirname, "../public");
app.use(express.static(publicDirectory));


io.on('connection', (socket) => {
  socket.on('join', (data, callback) => {
    // using "data" to ensure that it's in a consistent format after joining
    const { error, user } = addUser({ id: socket.id, ...data });

    if (error) {
      return callback && callback(error);
    }

    if (!user) {
      return callback && callback('User not found');
    }

    socket.join(user.room);

    socket.emit('message', generateMessage('Admin', 'Welcome!'));
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`));
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    if (callback) {
      return callback && callback();
    }
  })

  socket.on('sendMessage', (message, callback) => {
    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!');
    }

    const user = getUser(socket.id);
    if (user) {
      io.to(user.room).emit('message', generateMessage(user.username, message));
    }

    if (callback) {
      callback('Acknowledged!');
    }
  });

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id);

    if (!user) {
      return callback && callback('User not found');
    }

    io.emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));

    if (callback) {
      callback();
    }
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`));
    }
  });
});



server.listen(port, () => console.log(`Example app listening on port ${port}!`));