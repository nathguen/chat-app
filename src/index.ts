import http from "http";
import express from "express";
import path from "path";
import { Server } from "socket.io";
import Filter from "bad-words";
import { generateLocationMessage, generateMessage } from "./utils/messages";

const filter = new Filter();


const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3001;

const publicDirectory = path.join(__dirname, "../public");
app.use(express.static(publicDirectory));


io.on('connection', (socket) => {
  socket.emit('message', generateMessage('Admin', 'Welcome!'));
  socket.broadcast.emit('message', generateMessage('Admin', 'A new user has joined!'));

  socket.on('sendMessage', (message, callback) => {
    if(filter.isProfane(message)) {
      return callback('Profanity is not allowed!');
    }

    io.emit('message', generateMessage('Admin', message));
    callback('Acknowledged!');
  });

  socket.on('sendLocation', (coords, callback) => {
    io.emit('locationMessage', generateLocationMessage('Admin', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
    callback();
  });

  socket.on('disconnect', () => {
    io.emit('message', generateMessage('Admin', 'A user has left!'));
  });
});



server.listen(port, () => console.log(`Example app listening on port ${port}!`));