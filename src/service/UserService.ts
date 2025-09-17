import type { IUser } from '../models/types.js'
import { UserRepository } from '../repository/UserRepository.js'

export class UserService {
  static async addUser(username: string): Promise<IUser | null> {
    return await UserRepository.create(username)
  }

  static async findUser(username: string): Promise<IUser | null> {
    return await UserRepository.find(username)
  }

  static async deleteUser(user_id: string) {
    return await UserRepository.delete(user_id)
  }
}
