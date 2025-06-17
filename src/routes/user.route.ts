import { Router } from 'express'
import {
  ChattingUserController,
  GetAllChattingUsersController,
  getAllUsersController,
  GetUserByUserNameController,
  uploadVoiceController
} from '~/controllers/user.controller'
import { accessTokenValidator } from '~/middlewares/auth.middleware'
import { ChatMiddleware, FindChatMiddleware } from '~/middlewares/user.middleware'
import { wrapAsync } from '~/utils/handlers'
import { upload } from '~/utils/upload'

const userRouter = Router()

userRouter.post('/chatting/all', FindChatMiddleware, wrapAsync(GetAllChattingUsersController))

userRouter.get('/:username', wrapAsync(GetUserByUserNameController))

userRouter.post('/chatting', ChatMiddleware, wrapAsync(ChattingUserController))

userRouter.get('/', getAllUsersController)

userRouter.post('/uploadVoice', upload.single('file'), wrapAsync(uploadVoiceController))

export default userRouter
