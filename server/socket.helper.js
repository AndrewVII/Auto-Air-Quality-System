let io = null;

export function setIO(socketio) {
  io = socketio;
}

export async function sendDataToUser(user) {
  const { socketId, indoorData } = user;
  io.to(socketId).emit('air-data-update', indoorData);
}
