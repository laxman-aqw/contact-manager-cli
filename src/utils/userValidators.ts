export function validateUsername(username: string): boolean | string {
  if (username.length === 0) return 'Username cannot be empty!'
  if (username.length < 3) return 'Username must be at least 3 characters.'
  if (username.length > 20) return 'Username cannot exceed 20 characters.'
  if (username.includes(' ')) return 'Username cannot contain white space'
  return true
}
