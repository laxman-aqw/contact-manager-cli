export interface IContact {
  contact_id?: string | undefined
  first_name: string
  last_name: string
  contact_number: string
  email: string
  address: string
  created_at?: Date
  user_id: string
}
export interface IUser {
  user_id?: string
  username: string
}
