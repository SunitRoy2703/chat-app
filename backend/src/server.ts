import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV}` });
import Logger from './core/Logger';
import { corsUrl, port } from './config';
import app from './app';
import http from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { RedisClient } from './services/redis';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: corsUrl,
  },
  adapter: createAdapter(RedisClient.publisher, RedisClient.subscriber),
});

// Add a test endpoint to show which instance is handling the request
app.get('/', (req, res) => {
  res.json({
    message: 'Hello from chat server',
    port: port,
    instance: process.pid
  });
});

io.on('connection', async (socket) => {
  console.log(
    'PRODUCTION SERVER: user connected, online user count:',
    await RedisClient.getOnlineUsersCount(),
  );

  socket.on('join', async (data) => {
    const { socketId, name = socketId } = data;
    await RedisClient.addOnlineUser(socketId, name);
  });

  socket.on('broadcast', (broadcast, callback) => {
    console.log('PRODUCTION SERVER: Broadcast ', broadcast);
    io.emit('broadcast', broadcast);
    if (callback) {
      callback({
        ok: true,
      });
    }
  });

  socket.on('private_message', (message, callback) => {
    console.log('PRODUCTION SERVER: ', message);
    const { from: sourceSocketId, to: targetSocketId } = message;
    io.to(targetSocketId).emit('private_message', message);
    io.to(sourceSocketId).emit('private_message', message);
    if (callback) {
      callback({
        ok: true,
      });
    }
  });

  socket.on('disconnect', async () => {
    await RedisClient.removeOnlineUser(socket.id);
    console.log(
      'PRODUCTION SERVER: user disconnected, online user count:',
      await RedisClient.getOnlineUsersCount(),
    );
  });
});

// Emit online users every 5 seconds
setInterval(async () => {
  const onlineUsers = await RedisClient.getAllOnlineUsers();
  io.emit('online_user', onlineUsers);
}, 5000);

server
  .listen(port, () => {
    console.log(`server running on port : ${port}`);
    Logger.info(`server running on port : ${port}`);
  })
  .on('error', (e) => {
    console.log(e);
    Logger.error(e);
  });
