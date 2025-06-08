import express from 'express'
import cors from 'cors'
import databaseService from '~/database/config.database'
import { defaultErrorHandler } from '~/middlewares/error.middleware'
//add cors
const app = express()
const port = 4000
app.use(
  express.json(),
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

databaseService.connect()
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Server Chatbox !' })
})
// app.use('/api/auth', authRouter)
// app.use('/api/user', userRouter)
// app.use('/api/product', productRouter)
// app.use('/api/category', categoryRouter)
// app.use('/api/order', orderRouter)
// app.post('/callback', zaloPaymentCallback)
app.use(defaultErrorHandler)
app.listen(port, () => {
  console.log(`Server này đang chạy trên post ${port}`)
})
