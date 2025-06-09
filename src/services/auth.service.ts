import { ObjectId } from 'mongodb'
import { TokenType } from '~/constants/enums'
import databaseService from '~/database/config.database'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'

class AuthService {
  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: 'chatbox'
    })
  }
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, type: TokenType.AccessToken },
      options: { expiresIn: '15m' },
      privateKey: 'chatbox'
    })
  }
  private signRefreshToken({ user_id, exp }: { user_id: string; exp?: number }) {
    if (exp) {
      return signToken({
        payload: { user_id, type: TokenType.RefeshToken, exp },
        privateKey: 'chatbox'
      })
    } else {
      return signToken({
        payload: { user_id, type: TokenType.RefeshToken },
        options: { expiresIn: '7d' },
        privateKey: 'chatbox'
      })
    }
  }
  private signAccessTokenAndRefreshToken(user_id: string, exp?: number) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken({ user_id })])
  }
  async register(username: string, password: string) {
    const _id = new ObjectId()
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(_id.toString())
    const savedRefreshToken = await databaseService.refreshTokens.insertOne({
      user_id: _id,
      token: refresh_token
    })
    const hashedPassword = hashPassword(password)
    const rep = await databaseService.users.insertOne({
      _id,
      username,
      password: hashedPassword
    })
    if (rep.insertedId) {
      return {
        user_id: rep.insertedId.toString(),
        name: username,
        access_token,
        refresh_token
      }
    }
    throw new Error('Failed to register user')
  }
  async login(username: string, password: string) {
    const user = await databaseService.users.findOne({ username })
    if (!user) {
      throw new Error('User not found')
    }
    if (user.password !== hashPassword(password)) {
      throw new Error('Invalid password')
    }
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user._id.toString())
    if (await databaseService.refreshTokens.findOne({ user_id: user._id })) {
      const updatedRefreshToken = await databaseService.refreshTokens.findOneAndUpdate(
        { user_id: user._id },
        { $set: { token: refresh_token } },
        { upsert: true, returnDocument: 'after' }
      )
    } else {
      const savedRefreshToken = await databaseService.refreshTokens.insertOne({
        user_id: user._id,
        token: refresh_token
      })
    }

    return {
      user_id: user._id.toString(),
      name: user.username,
      access_token,
      refresh_token
    }
  }
  async logout(user_id: string) {
    const result = await databaseService.refreshTokens.deleteOne({ user_id: new ObjectId(user_id) })
    if (result.deletedCount === 0) {
      throw new Error('No refresh token found for this user')
    }
    return true
  }
}

const authService = new AuthService()
export default authService
