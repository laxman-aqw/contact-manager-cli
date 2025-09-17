import inquirer from 'inquirer'
import { pool } from '../db/index.js'
import type { IUser } from './types.js'
import { findByUsername } from '../utils/helper.js'

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

  static async deleteUser(user_id: string): Promise<IUser | null> {
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
  static async deleteUserCLI(username: string): Promise<IUser | null> {
    try {
      const user = await findByUsername(username)
      if (!user) {
        console.log('User not found')
        return null
      }
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `${user.username}, are you sure you want to delete your contacts and username?`,
          default: true,
        },
      ])

      if (!confirm) {
        console.log('Deletion cancelled')
        return null
      }

      await User.deleteUser(username)
      // console.log('the delete result is: ', result)
      console.log('Goodbye 👋 Sad to see you go')
      process.exit(0)
    } catch (error) {
      console.error('Error deleting user', error)
      return null
    }
  }
}
