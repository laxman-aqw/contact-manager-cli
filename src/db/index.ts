import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()
export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
})

export async function connectDB() {
  try {
    await pool.query(`  SELECT  NOW()`)
    console.log('Connected to PostgreSQL via Pool')
  } catch (err) {
    console.error('Database connection error', err)
  }
}
