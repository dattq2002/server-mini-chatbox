import databaseService from '~/database/config.database'

class UserService {
  async getUserByUsername(username: string) {
    const user = await databaseService.users.findOne({ username })
    if (!user) {
      throw new Error('User not found')
    }
    return user
  }
  async chattingUser(senderId: string, receiverId: string, content: string) {
    const roomId = [senderId, receiverId].sort().join('_')
    const message = await databaseService.messages.insertOne({
      senderId,
      receiverId,
      content
    })
    const messageData = await databaseService.messages.findOne({ _id: message.insertedId })
    return {
      roomId,
      messageData
    }
  }
  async getAllChattingUsers(senderId: string, receiverId: string) {
    const roomId = [senderId, receiverId].sort().join('_')
    const messages = await databaseService.messages.find({ senderId, receiverId }).toArray()
    if (!messages || messages.length === 0) {
      throw new Error('No chatting users found')
    }
    return messages
  }
  async getAllUsers(page: number, size: number) {
    const skip = (page - 1) * size
    const total = await databaseService.users.countDocuments()
    const users = await databaseService.users.find().skip(skip).limit(size).toArray()
    return {
      size,
      page,
      total,
      users
    }
  }
}

const userService = new UserService()
export default userService
