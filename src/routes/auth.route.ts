import { Router } from 'express'
import { loginAuthController, logOutAuthController, registerAuthController } from '~/controllers/auth.controller'
import { loginAuthMiddleware, registerAuthMiddleware } from '~/middlewares/auth.middleware'
import { wrapAsync } from '~/utils/handlers'

const authRouter = Router()

authRouter.post('/register', registerAuthMiddleware, wrapAsync(registerAuthController))

authRouter.post('/login', loginAuthMiddleware, wrapAsync(loginAuthController))

authRouter.post('/logout', wrapAsync(logOutAuthController))

export default authRouter
