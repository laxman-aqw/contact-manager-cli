import type { IContact } from '../models/types.js'
import { ContactRepository } from '../repository/ContactRepository.js'

export class ContactService {
  static async addContact(contact: IContact): Promise<IContact | null> {
    const emailExists = await ContactRepository.findByEmail(contact.email)
    const numberExists = await ContactRepository.findByContactNumber(
      contact.contact_number,
    )
    if (emailExists || numberExists) {
      return null
    }

    return await ContactRepository.create(contact)
  }

  static async listContacts(user_id: string) {
    return await ContactRepository.findUsers(user_id)
  }

  static async updateContact(
    contact_id: string,
    updates: Partial<IContact>,
    user_id: string,
  ) {
    return await ContactRepository.update(contact_id, updates, user_id)
  }

  static async deleteContact(contact_id: string, user_id: string) {
    return await ContactRepository.delete(contact_id, user_id)
  }
}
