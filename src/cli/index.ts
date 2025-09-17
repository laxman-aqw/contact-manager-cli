import inquirer from 'inquirer'

import { pool } from '../db/index.js'
import type { IContact, IUser } from '../models/types.js'
import { ContactManager } from '../models/ContactManager.js'
import { User } from '../models/User.js'
import { validateUsername } from '../utils/userValidators.js'
import {
  valiateContactEmail,
  valiateContactNumber,
  validateFirstName,
} from '../utils/contactValidators.js'
import { findByUsername } from '../utils/helper.js'
import { ContactService } from '../service/ContactService.js'
export async function getUser(): Promise<IUser> {
  console.clear()
  const { username } = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Enter your username:',
      validate: validateUsername,
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
  console.log(user)
  const user_id = user.user_id
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
          { name: 'Delete Account', value: 'delete-account' },
          { name: 'Exit', value: 'exit' },
        ],
      },
    ])

    if (action === 'exit') {
      console.log('Goodbye 👋')
      process.exit(0)
    }

    if (action === 'add') {
      console.clear()
      const answers: Omit<IContact, 'user_id'> = await inquirer.prompt([
        {
          type: 'input',
          name: 'first_name',
          message: 'First Name:',
          validate: validateFirstName,
        },
        {
          type: 'input',
          name: 'last_name',
          message: 'Last Name:',
        },
        {
          type: 'input',
          name: 'contact_number',
          message: 'Contact Number:',
          validate: valiateContactNumber,
        },
        {
          type: 'input',
          name: 'email',
          message: 'Email address:',
          validate: valiateContactEmail,
        },
        { type: 'input', name: 'address', message: 'Address:' },
        { type: 'input', name: 'user_id', message: 'User_id:' },
      ])

      const finalAnswer: IContact = { ...answers, user_id }

      const result = await ContactService.addContact(finalAnswer)
    }

    if (action === 'list') {
      console.clear()
      const contacts = await ContactManager.list(user.user_id!)
      if (contacts.length === 0) {
        console.log('No contacts found.')
      } else {
        console.table(contacts, [
          'first_name',
          'last_name',
          'contact_number',
          'email',
          'address',
        ])
      }
    }

    if (action === 'update') {
      console.clear()

      await ContactManager.updateCLI(user.user_id!)
    }
    if (action === 'delete') {
      console.clear()
      await ContactManager.deleteCLI(user.user_id!)
    }
    if (action === 'delete-account') {
      console.clear()
      await User.deleteUserCLI(user.username!)
      // console.log('the delete response is', delete_response)
    }
  }
}

// import inquirer from 'inquirer'
// import { ContactService } from '../services/contactService.js'

// export async function main(user_id: string) {
//   while (true) {
//     const { action } = await inquirer.prompt([
//       {
//         type: 'list',
//         name: 'action',
//         message: 'What do you want to do?',
//         choices: ['Add Contact', 'List Contacts', 'Exit'],
//       },
//     ])

//     if (action === 'Exit') {
//       console.log('Goodbye 👋')
//       process.exit(0)
//     }

//     if (action === 'Add Contact') {
//       const answers = await inquirer.prompt([
//         { type: 'input', name: 'first_name', message: 'First Name:' },
//         { type: 'input', name: 'last_name', message: 'Last Name:' },
//         { type: 'input', name: 'contact_number', message: 'Contact Number:' },
//         { type: 'input', name: 'email', message: 'Email Address:' },
//         { type: 'input', name: 'address', message: 'Address:' },
//       ])

//       const result = await ContactService.addContact({ ...answers, user_id })
//       if (result) console.log('Contact Added!')
//     }

//     if (action === 'List Contacts') {
//       const contacts = await ContactService.listContacts(user_id)
//       console.table(contacts)
//     }
//   }
// }
