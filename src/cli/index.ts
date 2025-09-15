import inquirer from 'inquirer'

import { pool } from '../db/index.js'
import type { IUser } from '../models/types.js'
import { ContactManager } from '../models/ContactManager.js'
import { User } from '../models/User.js'
async function getUser(): Promise<IUser> {
  const { username } = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Enter your username:',
    },
  ])

  const result = await User.findByUsername(username)

  if (result) {
    console.log(`[INFO] Welcome back, ${username}!`)
    return result
  }

  const insert = await User.addUser(username)
  if (!insert) throw new Error('Failed to create user')
  console.log('New user created!')
  return insert
}

export async function main() {
  const user = await getUser()

  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What do you want to do?',
        choices: [
          { name: 'Add Contact', value: 'add' },
          { name: 'List Contacts', value: 'list' },
          { name: 'Update Contact', value: 'update' },
          { name: 'Delete Contact', value: 'delete' },
          { name: 'Exit', value: 'exit' },
        ],
      },
    ])

    if (action === 'exit') {
      console.log('Goodbye 👋')
      process.exit(0)
    }

    if (action === 'add') {
      const answers = await inquirer.prompt([
        { type: 'input', name: 'first_name', message: 'First Name:' },
        { type: 'input', name: 'last_name', message: 'Last Name:' },
        { type: 'input', name: 'contact_number', message: 'Contact Number:' },
        { type: 'input', name: 'address', message: 'Address:' },
      ])

      const contact = new ContactManager(
        answers.first_name,
        answers.last_name,
        answers.contact_number,
        answers.address,
        user.user_id!,
      )
      await contact.add()
    }

    if (action === 'list') {
      const contacts = await ContactManager.list(user.user_id!)
      if (contacts.length === 0) {
        console.log('No contacts found.')
      } else {
        console.table(contacts, [
          'first_name',
          'last_name',
          'contact_number',
          'address',
        ])
      }
    }

    if (action === 'update') {
      await ContactManager.updateCLI(user.user_id!)
    }
    if (action === 'delete') {
      await ContactManager.deleteCLI(user.user_id!)
    }
  }
}
