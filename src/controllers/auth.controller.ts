import { Request, Response } from 'express'
import authService from '~/services/auth.service'

export const registerAuthController = async (req: Request, res: Response) => {
  const { username, password } = req.body
  const result = await authService.register(username, password)
  res.json({
    message: 'User registered successfully',
    result
  })
}

export const loginAuthController = async (req: Request, res: Response) => {
  const { username, password } = req.body
  const result = await authService.login(username, password)
  res.json({
    message: 'User logged in successfully',
    result
  })
}

export const logOutAuthController = async (req: Request, res: Response) => {
  const { user_id } = req.body
  if (!user_id) {
    return void res.status(400).json({ message: 'User ID is required' })
  }
  await authService.logout(user_id)
  res.json({
    message: 'User logged out successfully'
  })
}
