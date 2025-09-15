import { pool } from '../db/index.js'
import type { IUser } from './types.js'

export class User implements IUser {
  username: string
  user_id?: string
  constructor(username: string) {
    this.username = username
  }
  static async addUser(username: string): Promise<IUser | null> {
    try {
      const result = await pool.query(
        'INSERT INTO users (username) VALUES ($1) RETURNING *',
        [username],
      )
      console.log('User added!')
      return result.rows[0]
    } catch (error) {
      console.error('Error adding contact', error)
      return null
    }
  }

  static async findByUsername(username: string): Promise<IUser | null> {
    try {
      const result = await pool.query('SELECT * FROM users WHERE username=$1', [
        username,
      ])
      return result.rows[0]
    } catch (error) {
      console.error('Error adding contact', error)
      return null
    }
  }
}
