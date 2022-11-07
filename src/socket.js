import io from 'socket.io-client';

export const connection = {
  socket: null,
  hash: null,
};

function createSocketConnection(listeners) {
  const socketConnection = io(window.location.origin);
  connection.socket = socketConnection;
  listeners.forEach(listener => {
    const { name, cb } = listener;
    connection.socket.on(name, cb);
  });
  connection.socket.on('error', (error) => {
    console.log(`ERROR: ${error}`);
  });
  return socketConnection;
}

export default function socket(listeners) {
  return createSocketConnection(listeners);
}
