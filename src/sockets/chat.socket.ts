import { Server, Socket } from 'socket.io'
import databaseService from '~/database/config.database'

interface MessageData {
  roomId: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
}

export const setupSocket = (io: Server) => {
  console.log('📡 Socket.IO đang khởi tạo...')
  const onlineUsers = new Map()
  io.on('connection', (socket: Socket) => {
    console.log('🔌 Client connected: ' + socket.id)
    console.log('📊 Tổng số kết nối hiện tại:', io.engine.clientsCount)
    const userId = socket.handshake.auth.userId
    if (userId) {
      onlineUsers.set(userId, socket.id)
      io.emit('updateOnlineUsers', Array.from(onlineUsers.keys()))
    }
    // Khi người dùng join phòng chat
    socket.on('joinRoom', (data: { roomId: string; userId: string }) => {
      try {
        const { roomId, userId } = data
        socket.join(roomId)
        console.log(`✅ User ${userId} (${socket.id}) joined room ${roomId}`)
        console.log(`👥 Số người trong phòng ${roomId}:`, io.sockets.adapter.rooms.get(roomId)?.size)

        // Thông báo cho các thành viên khác trong phòng
        socket.to(roomId).emit('userJoined', {
          userId: userId,
          socketId: socket.id,
          timestamp: new Date()
        })
      } catch (error) {
        console.error('❌ Error joining room:', error)
        socket.emit('error', 'Failed to join room')
      }
    })

    // Khi người dùng gửi tin nhắn
    socket.on('sendMessage', async (data: MessageData) => {
      try {
        const { roomId, senderId, receiverId, content, timestamp } = data
        console.log(`📨 Tin nhắn mới từ ${senderId} đến ${receiverId} trong phòng ${roomId}`)

        // Kiểm tra dữ liệu đầu vào
        if (!senderId || !receiverId || !content || !roomId) {
          throw new Error('Missing required message data')
        }

        // Lưu tin nhắn vào database
        const message = await databaseService.messages.insertOne({
          senderId: senderId,
          receiverId: receiverId,
          content: content,
          createdAt: new Date(timestamp)
        })

        // Tạo object tin nhắn để gửi
        const messageToSend = {
          _id: message.insertedId.toString(),
          senderId: senderId,
          receiverId: receiverId,
          content: content,
          roomId: roomId,
          timestamp: timestamp
        }

        // Gửi tin nhắn đến tất cả trong phòng
        io.to(roomId).emit('receiveMessage', messageToSend)

        console.log(`✅ Tin nhắn đã được gửi và lưu vào database`)
      } catch (error) {
        console.error('❌ Error sending message:', error)
        socket.emit('error', 'Failed to send message')
      }
    })

    // Xử lý trạng thái đang nhập
    socket.on('typing', (data: { roomId: string; userId: string }) => {
      console.log(`⌨️ User ${data.userId} đang nhập tin nhắn trong phòng ${data.roomId}`)
      socket.to(data.roomId).emit('userTyping', data)
    })

    socket.on('stopTyping', (data: { roomId: string; userId: string }) => {
      console.log(`✋ User ${data.userId} đã dừng nhập tin nhắn trong phòng ${data.roomId}`)
      socket.to(data.roomId).emit('userStopTyping', data)
    })

    // Khi người dùng disconnect
    socket.on('disconnect', () => {
      onlineUsers.forEach((value, key) => {
        if (value === socket.id) {
          onlineUsers.delete(key)
        }
      })
      io.emit('updateOnlineUsers', Array.from(onlineUsers.keys()))
      console.log('❌ Client disconnected: ' + socket.id)
      console.log('📊 Số kết nối còn lại:', io.engine.clientsCount)
    })
  })

  console.log('✅ Socket.IO đã sẵn sàng xử lý kết nối')
}
