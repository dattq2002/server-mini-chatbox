import { ObjectId } from 'mongodb'

interface IRefreshToken {
  _id?: ObjectId
  user_id: ObjectId
  token: string
  createdAt?: Date
  updatedAt?: Date
}

export class RefreshToken {
  _id?: ObjectId
  user_id: ObjectId
  token: string
  createdAt?: Date
  updatedAt?: Date

  constructor({ _id, user_id, token, createdAt = new Date(), updatedAt = new Date() }: IRefreshToken) {
    this._id = _id || new ObjectId()
    this.user_id = user_id
    this.token = token
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }
}
