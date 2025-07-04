import { ObjectId } from 'mongodb'

interface IMessage {
  _id?: ObjectId
  senderId: string
  receiverId: string
  content: string
  type?: string // 'text', 'image', 'video', 'audio'
  audioUrl?: string
  createdAt?: Date
  updatedAt?: Date
}
export class Message {
  _id?: ObjectId
  senderId: string
  receiverId: string
  content: string
  type?: string // 'text', 'image', 'video', 'audio'
  audioUrl?: string
  createdAt?: Date
  updatedAt?: Date

  constructor({
    _id,
    senderId,
    receiverId,
    content,
    type,
    audioUrl,
    createdAt = new Date(),
    updatedAt = new Date()
  }: IMessage) {
    this._id = _id || new ObjectId()
    this.senderId = senderId
    this.receiverId = receiverId
    this.content = content
    this.type = type || 'text' // Mặc định là 'text'
    this.audioUrl = audioUrl
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }
}
