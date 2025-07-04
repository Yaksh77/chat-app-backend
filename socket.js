const socketIo = (io) => {
  // Store Connected users with their rooms and socket ids
  const connectedUsers = new Map();

  io.on("connection", (socket) => {
    const user = socket.handshake.auth.user;
    console.log("User Connected", user?.username);

    // Join room handler
    socket.on("join room", (groupId) => {
      socket.join(groupId);
      connectedUsers.set(socket.id, {
        user,
        room: groupId,
      });
      const usersInRoom = Array.from(connectedUsers.values())
        .filter((u) => {
          u.room === groupId;
        })
        .map((u) => u.user);
      io.in(groupId).emit("users in room", usersInRoom);
      socket.to(groupId).emit("notification", {
        type: "USER_JOINED",
        message: `${user?.username} has joined the group`,
        user: user,
      });
    });

    // Leave room handler
    socket.on("leave group", (groupId) => {
      console.log(`${user?.username} has left the group`);
      socket.leave(groupId);
      if (connectedUsers.has(socket.id)) {
        connectedUsers.delete(socket.id);
        socket.to(groupId).emit("user left", user?._id);
      }
    });

    // Sending a new message
    socket.on("new message", (message) => {
      socket.to(message.groupId).emit("message received", message);
    });

    // Disconnect handler
    socket.on("disconnect", () => {
      console.log(`${user?.username} is disconnected`);
      if (connectedUsers.has(socket.id)) {
        const userData = connectedUsers.get(socket.id);
        socket.to(userData.room).emit("user left", user?._id);
        connectedUsers.delete(socket.id);
      }
    });

    // Typing Indicator
    socket.on("typing", ({ groupId, username }) => {
      socket.to(groupId).emit("user typing", { username });
    });

    // Stop typing Indicator
    socket.on("stop typing", ({ groupId, username }) => {
      socket
        .to(groupId)
        .emit("user stopped typing", { username: user?.username });
    });
  });
};

module.exports = socketIo;
