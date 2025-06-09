import { ObjectId } from 'mongodb'

interface IUser {
  _id?: ObjectId
  username: string
  password: string
  flag?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export class User {
  _id?: ObjectId
  username: string
  password: string
  flag?: boolean
  createdAt?: Date
  updatedAt?: Date

  constructor({ _id, username, password, flag, createdAt = new Date(), updatedAt = new Date() }: IUser) {
    this._id = _id
    this.username = username
    this.password = password
    this.flag = flag || false // Default to false if not provided
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }
}
