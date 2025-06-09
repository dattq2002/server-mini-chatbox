import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'

export const ChatMiddleware = validate(
  checkSchema(
    {
      senderId: {
        isString: {
          errorMessage: 'Sender ID must be a string'
        },
        notEmpty: {
          errorMessage: 'Sender ID is required'
        }
      },
      receiverId: {
        isString: {
          errorMessage: 'Receiver ID must be a string'
        },
        notEmpty: {
          errorMessage: 'Receiver ID is required'
        }
      },
      content: {
        isString: {
          errorMessage: 'Content must be a string'
        },
        notEmpty: {
          errorMessage: 'Content is required'
        }
      }
    },
    ['body']
  )
)

export const FindChatMiddleware = validate(
  checkSchema(
    {
      senderId: {
        isString: {
          errorMessage: 'Sender ID must be a string'
        },
        notEmpty: {
          errorMessage: 'Sender ID is required'
        }
      },
      receiverId: {
        isString: {
          errorMessage: 'Receiver ID must be a string'
        },
        notEmpty: {
          errorMessage: 'Receiver ID is required'
        }
      }
    },
    ['body']
  )
)
