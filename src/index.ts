import express from 'express'
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io' // ✅ Import Socket.IO server
import databaseService from '~/database/config.database'
import { defaultErrorHandler } from '~/middlewares/error.middleware'
import authRouter from '~/routes/auth.route'
import { setupSocket } from '~/sockets/chat.socket'
import userRouter from '~/routes/user.route'

const app = express()
const server = http.createServer(app) // ✅ Tạo HTTP server riêng để dùng cho Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
})

const port = 4000

// Middlewares
app.use(
  express.json(),
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

// DB
databaseService.connect()

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Server Chatbox !' })
})
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use(defaultErrorHandler)

// ✅ Khởi tạo socket
setupSocket(io)

// ✅ Khởi động server qua `server.listen`
server.listen(port, () => {
  console.log(`🚀 Server đang chạy trên port ${port}`)
})
