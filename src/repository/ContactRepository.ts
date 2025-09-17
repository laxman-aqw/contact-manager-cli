import { pool } from '../db/index.js'
import type { IContact } from '../models/types.js'

export class ContactRepository {
  static async findByEmail(email: string) {
    const result = await pool.query('SELECT * FROM contacts WHERE email=$1', [
      email,
    ])
    if (result.rows.length > 0) {
      // console.clear()
      console.log('Account with this email already exists')
      return true
    }
    return false
  }

  static async findByContactNumber(contact_number: string) {
    const result = await pool.query(
      'SELECT * FROM contacts WHERE contact_number = $1',
      [contact_number],
    )
    if (result.rows.length > 0) {
      console.log('Account with this contact number already exists')

      return true
    }
    return false
  }

  static async findByEmailForUpdate(email: string) {
    const result = await pool.query('SELECT * FROM contacts WHERE email=$1', [
      email,
    ])
    if (result.rows.length > 0) {
      console.clear()
      console.log('Account with this email already exists')
      return true
    }
    return false
  }
  static async updateValidateEmail(email: string, selectedContactId: string) {
    try {
      const result = await pool.query(
        `SELECT * FROM contacts WHERE email =$1`,
        [email],
      )
      if (result.rows.length > 0) {
        if (result.rows[0].contact_id == selectedContactId) {
          return false
        }
      }
      return true
    } catch (error) {
      console.log(error)
    }
  }
  static async updateValidateNumber(number: string, selectedContactId: string) {
    try {
      const result = await pool.query(
        `SELECT * FROM contacts WHERE contact_number =$1`,
        [number],
      )
      if (result.rows.length > 0) {
        if (result.rows[0].contact_id == selectedContactId) {
          return false
        }
      }
      return true
    } catch (error) {
      console.log(error)
    }
  }

  static async create(contact: IContact) {
    try {
      const result = await pool.query(
        'INSERT INTO contacts (first_name, last_name, contact_number,email, address,user_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
        [
          contact.first_name,
          contact.last_name,
          contact.contact_number,
          contact.email,
          contact.address,
          contact.user_id,
        ],
      )
      console.log('Contact created')
      return result.rows[0]
    } catch (error) {
      console.error('contact not created', error)
    }
  }

  static async findUsers(user_id: string) {
    try {
      const result = await pool.query(
        'SELECT * FROM contacts WHERE user_id=$1 ORDER BY first_name',
        [user_id],
      )
      return result.rows
    } catch (error) {
      console.error('Error fetching contacts', error)
      return []
    }
  }

  static async update(
    contact_id: string,
    updates: Partial<IContact>,
    user_id: string,
  ) {
    try {
      const fields = Object.keys(updates)
      const values = Object.values(updates)
      if (fields.length === 0) return null

      const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ')
      const query = `
        UPDATE contacts 
        SET ${setClause} 
        WHERE contact_id = $${fields.length + 1} AND user_id = $${fields.length + 2} 
        RETURNING *
      `

      const result = await pool.query(query, [...values, contact_id, user_id])
      if (result.rows.length === 0) {
        console.log('Contact not found or does not belong to this user.')
      }
      console.clear()
      console.log('Contact Updated!')
      return result.rows[0]
    } catch (error) {
      console.error(error)
    }
  }

  static async delete(contact_id: string, user_id: string) {
    try {
      const result = await pool.query(
        'DELETE FROM contacts WHERE contact_id = $1 and user_id = $2 returning *',
        [contact_id, user_id],
      )
      if (result.rows.length === 0) {
        console.log('Contact not found!')
      } else {
        console.log('Contact deleted succesfully')
        return result.rows[0]
      }
    } catch (error) {
      console.error('Error deleting contact', error)
      return null
    }
  }
}
