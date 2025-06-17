import multer from 'multer'
import path from 'path'
import fs from 'fs'
// Tạo thư mục nếu chưa có
const audioDir = path.join(__dirname, '../../uploads/audio')
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true })
}

// Cấu hình multer để lưu file vào thư mục uploads/audio/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, audioDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `audio_${Date.now()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // giới hạn 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/webm']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Chỉ chấp nhận file âm thanh (.mp3, .wav, .webm)'))
    }
  }
})
