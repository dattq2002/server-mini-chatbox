import { Router } from 'express'
import {
  ChattingUserController,
  GetAllChattingUsersController,
  getAllUsersController,
  GetUserByUserNameController
} from '~/controllers/user.controller'
import { accessTokenValidator } from '~/middlewares/auth.middleware'
import { ChatMiddleware, FindChatMiddleware } from '~/middlewares/user.middleware'
import { wrapAsync } from '~/utils/handlers'

const userRouter = Router()

userRouter.post('/chatting/all', accessTokenValidator, FindChatMiddleware, wrapAsync(GetAllChattingUsersController))

userRouter.get('/:username', accessTokenValidator, wrapAsync(GetUserByUserNameController))

userRouter.post('/chatting', accessTokenValidator, ChatMiddleware, wrapAsync(ChattingUserController))

userRouter.get('/', getAllUsersController)

export default userRouter
