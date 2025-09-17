import { pool } from '../db/index.js'
import type { IContact, IUser } from '../models/types.js'

export async function findByUsername(username: string): Promise<IUser | null> {
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

// export async function findContactByEmail(email: string) {
//   try {
//     const result = await pool.query('SELECT * FROM contacts WHERE email=$1', [
//       email,
//     ])
//     console.log('the result from findContactByEmail is: ', result)
//     if (result) {
//       return false
//     }
//     return true
//   } catch (error) {
//     console.error('Error adding contact', error)
//     return false
//   }
// }
