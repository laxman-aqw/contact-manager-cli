import { pool } from '../db/index.js'
import type { IContact } from './types.js'
import inquirer from 'inquirer'

export class ContactManager implements IContact {
  contact_id?: string | undefined
  first_name: string
  last_name: string
  contact_number: string
  email: string
  address: string
  user_id: string

  constructor(
    first_name: string,
    last_name: string,
    contact_number: string,
    email: string,
    address: string,
    user_id: string,
    contact_id?: string,
  ) {
    this.first_name = first_name
    this.last_name = last_name
    this.contact_number = contact_number
    this.email = email
    this.address = address
    this.user_id = user_id
    this.contact_id = contact_id
  }

  static async checkExistingEmailUser(email: string): Promise<boolean> {
    const existingEmail = await pool.query(
      'SELECT * FROM contacts WHERE email=$1',
      [email],
    )
    if (existingEmail.rows.length > 0) {
      console.log('Contact with this email already exist')
      return true
    }
    return false
  }
  static async checkExistingContactUser(
    contact_number: string,
  ): Promise<boolean> {
    const existingContact = await pool.query(
      'SELECT * FROM contacts WHERE contact_number=$1',
      [contact_number],
    )
    if (existingContact.rows.length > 0) {
      console.log('Contact with this contact number already exist')
      return true
    }
    return false
  }

  async add(): Promise<IContact | null> {
    try {
      const contactExists = await ContactManager.checkExistingContactUser(
        this.contact_number,
      )
      const emailExists = await ContactManager.checkExistingEmailUser(
        this.email,
      )
      if (emailExists || contactExists) {
        return null
      }

      const result = await pool.query(
        'INSERT INTO contacts (first_name, last_name, contact_number,email, address,user_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
        [
          this.first_name,
          this.last_name,
          this.contact_number,
          this.email,
          this.address,
          this.user_id,
        ],
      )
      console.log('Contact Added!')
      return result.rows[0]
    } catch (error) {
      console.error('Error adding contact', error)
      return null
    }
  }

  static async list(user_id: string) {
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

  static async delete(
    contact_id: string,
    user_id: string,
  ): Promise<IContact | null> {
    try {
      const result = await pool.query(
        'DELETE FROM contacts WHERE contact_id = $1 and user_id = $2 returning *',
        [contact_id, user_id],
      )
      if (result.rows.length === 0) {
        console.log('Contact not found!')
        return null
      } else {
        console.log('Contact deleted succesfully')
        return result.rows[0]
      }
    } catch (error) {
      console.error('Error deleting contact', error)
      return null
    }
  }

  static async deleteCLI(user_id: string): Promise<IContact | null> {
    try {
      const contacts = await ContactManager.list(user_id)
      if (contacts.length === 0) {
        console.log('No contacts found')
        return null
      }

      const choices = contacts.map((c) => ({
        name: `${c.first_name} ${c.last_name} (${c.contact_number})`,
        value: c.contact_id,
      }))
      choices.push({ name: 'cancel', value: 'cancel' })
      const { selectedContactId } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedContactId',
          message: 'Select contact to update',
          choices,
        },
      ])
      if (selectedContactId === 'cancel') return null
      const contactToDelete = contacts.find(
        (c) => c.contact_id === selectedContactId,
      )

      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Are you sure you want to delete ${contactToDelete?.first_name} ${contactToDelete?.last_name}`,
          default: true,
        },
      ])

      if (!confirm) {
        console.log('Delettion cancelled')
        return null
      }

      const result = await ContactManager.delete(selectedContactId!, user_id)
      return result
    } catch (error) {
      console.error('Error deleting contact', error)
      return null
    }
  }

  static async update(
    contact_id: string,
    updates: Partial<IContact>,
    user_id: string,
  ): Promise<IContact | null> {
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
        return null
      }
      console.log('Contact Updated!')
      return result.rows[0]
    } catch (error) {
      console.error('Error updating contact:', error)
      return null
    }
  }

  static async updateCLI(user_id: string): Promise<IContact | null> {
    const contacts = await ContactManager.list(user_id)
    if (contacts.length === 0) {
      console.log('No contacts found.')
      return null
    }

    const choices = contacts.map((c) => ({
      name: `${c.first_name} ${c.last_name} (${c.contact_number}) (${c.email})`,
      value: c.contact_id,
    }))

    choices.push({ name: 'cancel', value: 'cancel' })
    const { selectedContactId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedContactId',
        message: 'Select contact to update:',
        choices,
      },
    ])

    if (selectedContactId === 'cancel') return null
    const contactToUpdate = contacts.find(
      (c) => c.contact_id === selectedContactId,
    )

    const updatedData = await inquirer.prompt([
      {
        type: 'input',
        name: 'first_name',
        message: 'First Name:',
        default: contactToUpdate?.first_name,
      },
      {
        type: 'input',
        name: 'last_name',
        message: 'Last Name:',
        default: contactToUpdate?.last_name,
      },
      {
        type: 'input',
        name: 'contact_number',
        message: 'Contact Number:',
        default: contactToUpdate?.contact_number,
      },
      {
        type: 'input',
        name: 'email',
        message: 'Email Address:',
        default: contactToUpdate?.email,
      },
      {
        type: 'input',
        name: 'address',
        message: 'Address:',
        default: contactToUpdate?.address,
      },
    ])

    const result = await ContactManager.update(
      selectedContactId!,
      updatedData,
      user_id,
    )
    return result
  }
}
