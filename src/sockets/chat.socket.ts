import { Server, Socket } from 'socket.io'
import databaseService from '~/database/config.database'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

interface MessageData {
  roomId: string
  senderId: string
  receiverId: string
  content?: string
  timestamp: string
  messageType: 'text' | 'voice'
  audioUrl?: string
}

interface AudioChunkData {
  chunk: ArrayBuffer // Change to ArrayBuffer for consistency
  roomId: string
  senderId: string
  receiverId: string
  timestamp: string
  isFinal?: boolean
  audioId: string
}

export const setupSocket = (io: Server) => {
  console.log('📡 Socket.IO đang khởi tạo...')
  const onlineUsers = new Map()
  const audioStreams = new Map<string, Buffer[]>()

  io.on('connection', (socket: Socket) => {
    console.log('🔌 Client connected: ' + socket.id)
    console.log('📊 Tổng số kết nối hiện tại:', io.engine.clientsCount)

    const userId = socket.handshake.auth.userId
    if (userId) {
      onlineUsers.set(userId, socket.id)
      io.emit('updateOnlineUsers', Array.from(onlineUsers.keys()))
    }

    socket.on('joinRoom', (data: { roomId: string; userId: string }) => {
      try {
        const { roomId, userId } = data
        socket.join(roomId)
        console.log(`✅ User ${userId} (${socket.id}) joined room ${roomId}`)
        console.log(`👥 Số người trong phòng ${roomId}:`, io.sockets.adapter.rooms.get(roomId)?.size)

        socket.to(roomId).emit('userJoined', {
          userId,
          socketId: socket.id,
          timestamp: new Date()
        })
      } catch (error) {
        console.error('❌ Error joining room:', error)
        socket.emit('error', 'Failed to join room')
      }
    })

    socket.on('sendMessage', async (data: MessageData) => {
      try {
        const { roomId, senderId, receiverId, content, timestamp, messageType, audioUrl } = data
        console.log(`📨 Tin nhắn mới (${messageType}) từ ${senderId} đến ${receiverId} trong phòng ${roomId}`)

        if (!senderId || !receiverId || !roomId || !timestamp || !messageType) {
          throw new Error('Thiếu dữ liệu bắt buộc cho tin nhắn')
        }

        if (messageType === 'text' && !content) {
          throw new Error('Thiếu nội dung văn bản')
        }

        if (messageType === 'voice' && !audioUrl) {
          throw new Error('Thiếu đường dẫn audio cho voice message')
        }

        const messagePayload = {
          senderId,
          receiverId,
          messageType,
          roomId,
          content: messageType === 'text' ? content : null,
          audioUrl: messageType === 'voice' ? audioUrl : null,
          createdAt: new Date(timestamp)
        }

        const message = await databaseService.messages.insertOne({
          senderId,
          receiverId,
          content: messageType === 'text' ? (content ?? '') : '',
          type: messageType,
          audioUrl: messageType === 'voice' ? (audioUrl ?? '') : '',
          createdAt: new Date(timestamp)
        })

        const messageToSend = {
          _id: message.insertedId.toString(),
          ...messagePayload,
          timestamp
        }

        io.to(roomId).emit('receiveMessage', messageToSend)
        console.log(`✅ ${messageType === 'voice' ? 'Voice' : 'Text'} message đã gửi và lưu DB`)
      } catch (error) {
        console.error('❌ Lỗi khi gửi tin nhắn:', error)
        socket.emit('error', 'Gửi tin nhắn thất bại')
      }
    })

    // Improved audio chunk handling
    socket.on('sendAudioChunk', async (data: AudioChunkData) => {
      try {
        const { chunk, roomId, senderId, receiverId, timestamp, isFinal = false, audioId } = data

        if (!roomId || !senderId || !receiverId || !timestamp || !chunk || !audioId) {
          throw new Error('Thiếu dữ liệu bắt buộc cho audio chunk')
        }

        // Convert ArrayBuffer to Buffer
        const buffer = Buffer.from(chunk)
        console.log(`🎙️ Nhận audio chunk từ ${senderId}, kích thước: ${buffer.length} bytes, isFinal: ${isFinal}`)

        // Store chunk temporarily
        if (!audioStreams.has(audioId)) {
          audioStreams.set(audioId, [])
        }
        audioStreams.get(audioId)!.push(buffer)

        // Broadcast chunk to other clients in the room (excluding sender)
        socket.to(roomId).emit('receiveAudioChunk', {
          chunk: chunk, // Send as ArrayBuffer to frontend
          senderId,
          roomId,
          timestamp,
          audioId,
          isFinal
        })

        // If this is the final chunk, save the complete audio file
        if (isFinal) {
          const chunks = audioStreams.get(audioId)
          if (chunks && chunks.length > 0) {
            try {
              // Ensure upload directory exists
              const uploadDir = join(process.cwd(), 'uploads', 'audio')
              if (!existsSync(uploadDir)) {
                await mkdir(uploadDir, { recursive: true })
              }

              // Combine all chunks
              const audioBuffer = Buffer.concat(chunks)
              const audioFileName = `audio_${audioId}_${Date.now()}.webm`
              const audioPath = join(uploadDir, audioFileName)

              await writeFile(audioPath, audioBuffer)

              const audioUrl = `/uploads/audio/${audioFileName}`

              // Save message to database
              const message = await databaseService.messages.insertOne({
                senderId,
                receiverId,
                content: '',
                type: 'voice',
                audioUrl,
                createdAt: new Date(timestamp)
              })

              const messageToSend = {
                _id: message.insertedId.toString(),
                senderId,
                receiverId,
                messageType: 'voice' as const,
                roomId,
                content: null,
                audioUrl,
                createdAt: new Date(timestamp),
                timestamp
              }

              // Send complete message to all clients in room
              io.to(roomId).emit('receiveMessage', messageToSend)
              console.log(`✅ Audio message saved to ${audioPath} and sent to room ${roomId}`)

              // Clean up temporary storage
              audioStreams.delete(audioId)
            } catch (saveError) {
              console.error('❌ Error saving audio file:', saveError)
              socket.emit('error', 'Lỗi lưu file audio')
            }
          }
        }
      } catch (error) {
        console.error('❌ Lỗi khi xử lý audio chunk:', error)
        socket.emit('error', 'Gửi audio chunk thất bại')
      }
    })

    socket.on('typing', (data: { roomId: string; userId: string }) => {
      console.log(`⌨️ User ${data.userId} đang nhập tin nhắn trong phòng ${data.roomId}`)
      socket.to(data.roomId).emit('userTyping', data)
    })

    socket.on('stopTyping', (data: { roomId: string; userId: string }) => {
      console.log(`✋ User ${data.userId} đã dừng nhập tin nhắn trong phòng ${data.roomId}`)
      socket.to(data.roomId).emit('userStopTyping', data)
    })

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
