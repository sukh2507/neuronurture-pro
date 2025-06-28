const Message = require('../models/Message');

function registerMessageHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`📡 Socket connected: ${socket.id}`);

    // 👉 Join room
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`👥 Joined room: ${roomId}`);
    });

    // 👉 Leave room
    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId);
      console.log(`🚪 Left room: ${roomId}`);
    });

    // 📤 Handle sending a message
    socket.on('sendMessage', async (data) => {
      const {
        senderId,
        receiverId,
        senderModel,
        receiverModel,
        content,
      } = data;

      try {
        const message = new Message({
          senderId,
          receiverId,
          senderModel,
          receiverModel,
          content,
          sentAt: new Date(),
        });

        const savedMessage = await message.save();

        const room1 = `${receiverId}_${senderId}`;
        const room2 = `${senderId}_${receiverId}`;

        // Broadcast to both possible room combinations (to be safe)
        io.to(room1).emit('receiveMessage', savedMessage);
        io.to(room2).emit('receiveMessage', savedMessage);

        console.log(`💬 Message from ${senderId} to ${receiverId} sent`);
      } catch (err) {
        console.error('❌ Error saving or broadcasting message:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
}

module.exports = registerMessageHandlers;
