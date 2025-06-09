import { Server, Socket } from 'socket.io'
import databaseService from '~/database/config.database'

export const setupSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('🔌 Client connected: ' + socket.id)

    // Khi người dùng join phòng chat
    socket.on('join', (roomId: string) => {
      socket.join(roomId)
      console.log(`✅ ${socket.id} joined room ${roomId}`)
    })

    // Khi người dùng gửi tin nhắn
    socket.on('sendMessage', async (data) => {
      const { sender, receiver, text } = data
      const roomId = [sender, receiver].sort().join('_')

      const message = await databaseService.messages.insertOne({
        senderId: sender,
        receiverId: receiver,
        content: text
      })

      io.to(roomId).emit('receiveMessage', message)
    })

    // Khi người dùng disconnect
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected: ' + socket.id)
    })
  })
}
