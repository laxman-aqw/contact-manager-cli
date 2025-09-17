import z, { maxLength } from 'zod'
export const zodValidate = (schema: z.ZodTypeAny) => (input: string) => {
  const result = schema.safeParse(input)
  return result.success ? true : result.error.issues[0]!.message
}

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must not exceed 20 characters')
  .regex(
    /^[a-zA-Z0-9_]+$/,
    'Username can only contain letters, numbers, and underscores (no spaces)',
  )

export const contactSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .regex(/^[A-Za-z]+$/, 'First name should not contain spaces or numbers'),

  last_name: z
    .string()
    .min(1, 'Last name is required')
    .regex(/^[A-Za-z\s]+$/, 'Last name should only contain letters'),

  email: z.string().email('Invalid email address'),

  contact_number: z
    .string()
    .regex(
      /^9\d{9}$/,
      'Contact number must start with 9 and be exactly 10 digits',
    ),

  address: z
    .string()
    .min(4, 'Address must be at least 4 characters')
    .max(50, 'Address must not exceed 50 characters'),
})
