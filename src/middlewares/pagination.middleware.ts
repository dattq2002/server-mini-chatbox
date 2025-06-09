import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'

export const PaginationValidator = validate(
  checkSchema(
    {
      page: {
        optional: true,
        isNumeric: {
          errorMessage: 'Page must be a number'
        },
        isInt: {
          errorMessage: 'Page must be an integer'
        }
      },
      size: {
        optional: true,
        isNumeric: {
          errorMessage: 'Size must be a number'
        },
        isInt: {
          errorMessage: 'Size must be an integer'
        }
      }
    },
    ['query']
  )
)
