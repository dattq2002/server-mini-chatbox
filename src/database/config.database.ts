import { Collection, Db, MongoClient } from 'mongodb'
// import RefreshToken from '~/models/schemas/refreshToken.schema'
// import User from '~/models/schemas/user.schema'

const uri = `mongodb+srv://dattq2002:dat45022@shopcard.9c8qc.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db('ChatBox')
  }
  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log(`Pinged your deployment. You successfully connected to ChatBox in MongoDB!`)
      return true
    } catch (err) {
      console.log('lỗi trong quá trình kết nối', err)
      throw err
    }
  }

  // get users(): Collection<User> {
  //   return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  // }
  // get refreshTokens(): Collection<RefreshToken> {
  //   return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  // }
}
const databaseService = new DatabaseService()
export default databaseService
