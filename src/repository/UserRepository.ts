import { pool } from '../db/index.js'

export class UserRepository {
  static async create(username: string) {
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

  static async find(username: string) {
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

  static async delete(user_id: string) {
    try {
      const result = await pool.query(
        'DELETE FROM users WHERE username = $1 returning *',
        [user_id],
      )
      if (result.rows.length === 0) {
        console.log('User not found')
        return null
      } else {
        console.log('User deleted succesfully')
        return result.rows[0]
      }
    } catch (error) {
      console.error('Error deleting user', error)
      return null
    }
  }
}
