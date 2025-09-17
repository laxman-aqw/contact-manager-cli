import inquirer from 'inquirer'
import type { IContact, IUser } from '../models/types.js'
import { validateUsername } from '../utils/userValidators.js'
import {
  valiateContactEmail,
  valiateContactNumber,
  validateFirstName,
} from '../utils/contactValidators.js'
import { ContactService } from '../service/ContactService.js'
import { UserService } from '../service/UserService.js'
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

  const result = await UserService.findUser(username)

  if (result) {
    console.log(`[INFO] Welcome back, ${username}!`)
    return result
  }

  const insert = await UserService.addUser(username)
  if (!insert) throw new Error('Failed to create user')
  console.log('New user created!')
  return insert
}

export async function main() {
  const user = await getUser()
  // console.log(user)
  const user_id = user.user_id!
  const username = user.username!
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
          { name: 'Logout', value: 'logout' },
          { name: 'Exit', value: 'exit' },
        ],
      },
    ])

    if (action === 'exit') {
      console.log('Goodbye 👋')
      process.exit(0)
    }
    if (action === 'logout') {
      console.clear()
      await getUser()
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
      ])

      const finalAnswer: IContact = { ...answers, user_id }

      const result = await ContactService.addContact(finalAnswer)
      console.clear()
      console.log('New account added!')
    }

    if (action === 'list') {
      console.clear()
      const contacts = await ContactService.listContacts(user_id)
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
      const contacts = await ContactService.listContacts(user_id)
      if (contacts.length === 0) {
        console.log('No contacts found.')
      } else {
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

        const updates = await inquirer.prompt([
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
        const contact = await ContactService.updateContact(
          selectedContactId,
          updates,
          user_id,
        )
      }
    }
    if (action === 'delete') {
      console.clear()
      try {
        const contacts = await ContactService.listContacts(user_id)
        if (contacts.length === 0) {
          console.log('No contacts found')
        } else {
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
          if (selectedContactId === 'cancel') return
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

          const result = await ContactService.deleteContact(
            selectedContactId!,
            user_id,
          )
        }
      } catch (error) {
        console.error('Error deleting contact', error)
        return null
      }
    }
    if (action === 'delete-account') {
      console.clear()
      try {
        const user = await UserService.findUser(username)
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

        await UserService.deleteUser(username)
        console.log('Goodbye 👋 Sad to see you go')
        process.exit(0)
      } catch (error) {
        console.error('Error deleting user', error)
        return null
      }
    }
  }
}
