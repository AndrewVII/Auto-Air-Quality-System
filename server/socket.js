import { setIO } from './socket.helper';
import db from './db/models';

let socketio = null;

export const socket = (io) => {
  setIO(io);
  socketio = io;
  io.on('connection', async (sock) => {
    try {
      const user = await db.User.model.findById(sock.user._id);
      user.socketId = sock.id;
      user.save();
    } catch (err) {
      console.log(err);
      io.to(sock.id).emit('error', err.message);
    }
  });
};

export const getIO = () => socketio;
