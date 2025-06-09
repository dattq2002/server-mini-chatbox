import { Request, Response } from 'express'
import { USERS_MESSAGES } from '~/constants/messages'
import userService from '~/services/user.service'

export const GetAllChattingUsersController = async (req: Request, res: Response) => {
  const { senderId, receiverId } = req.body
  // Assuming a userService exists to fetch all chatting users
  const users = await userService.getAllChattingUsers(senderId, receiverId)
  if (!users || users.length === 0) {
    return void res.status(404).json({ message: 'No chatting users found' })
  }
  res.json({
    message: 'Find all chatting users successfully',
    users: users
  })
}

export const GetUserByUserNameController = async (req: Request, res: Response) => {
  const { username } = req.params
  if (!username) {
    return void res.status(400).json({ message: 'Username is required' })
  }
  // Assuming a userService exists to fetch user by username
  const user = await userService.getUserByUsername(username)
  if (!user) {
    return void res.status(404).json({ message: 'User not found' })
  }
  res.json({
    message: 'Find user successfully',
    user: user
  })
}

export const ChattingUserController = async (req: Request, res: Response) => {
  const { senderId, receiverId, content } = req.body
  // Assuming a userService exists to fetch user by username
  const userData = await userService.chattingUser(senderId, receiverId, content)
  if (!userData) {
    return void res.status(404).json({ message: 'User not found' })
  }
  res.json({
    message: 'User chatting successfully',
    user: userData
  })
}

export const getAllUsersController = async (req: Request, res: Response) => {
  const { page, size } = req.query
  // console.log(page, size)
  const result = await userService.getAllUsers(Number(page), Number(size))
  return void res.json({
    status: res.statusCode,
    message: USERS_MESSAGES.GET_ALL_USERS_SUCCESS,
    data: result
  })
}
