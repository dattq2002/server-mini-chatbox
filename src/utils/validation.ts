import { NextFunction, Request, Response } from 'express'
import { body, validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import { EntityError, ErrorWithStatus } from '~/models/errors'

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req)

    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }
    const errorObject = errors.mapped()
    const entityError = new EntityError({ errors: {} })
    for (const key in errorObject) {
      //lấy msg từ lỗi ra
      const { msg } = errorObject[key]
      if (msg instanceof ErrorWithStatus && msg.status !== 422) {
        return next(msg)
      }
      //nếu xuống đc đây thì lỗi là lỗi 422
      entityError.errors[key] = msg
    }
    //xử lý lỗi luôn
    next(entityError)
  }
}

//---------------------note ---------------------
//sanitizing dùng để dọn rác
//Validation chain là 1 cách viết của tk express-validator
//checkSchema là 1 hàm của tk express-validator để thay thế cách viết dễ hiểu hơn
//signToken bản chất là ký xong rồi gửi cho người dùng
//nếu ko dùng promise thì token chưa ký xong thì đã gửi cho người dùng rồi
//nên phải dùng promise để đảm bảo ký xong rồi mới gửi cho người dùng
