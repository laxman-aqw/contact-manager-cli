export function validateFirstName(first_name: string): boolean | string {
  if (first_name.length === 0) return 'First_name cannot be empty!'
  if (first_name.length < 3) return 'First_name must be at least 3 characters.'
  if (first_name.length > 20) return 'First_name cannot exceed 20 characters.'
  if (first_name.includes(' ')) return 'First_name cannot contain white space'
  return true
}

export function valiateContactNumber(contact_number: string): boolean | string {
  if (contact_number.length === 0) return 'Contact number cannot be empty!'
  if (contact_number.includes(' '))
    return 'contact number cannot contain white space'
  if (isNumber(contact_number)) return 'Contact number must be number'
  if (contact_number.length !== 10) return 'Contact number should be 10 digit.'
  return true
}

export function valiateContactEmail(email: string): boolean | string {
  if (email.length === 0) return 'Email address cannot be empty!'
  if (email.includes(' ')) return 'Email address cannot contain white space'
  return true
}

function isNumber(value: any) {
  return isNaN(value)
}
