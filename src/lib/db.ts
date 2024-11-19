import { Pool, QueryResult } from 'pg'

// Option 1: Use direct configuration first to test
const pool = new Pool({
  user: 'bana',
  password: 'superuser',
  host: 'localhost',
  port: 5432,
  database: 'sociolite'
})

// Option 2: Or if you prefer using env vars, add console.log to debug them
// console.log('DB Config:', {
//   user: process.env.POSTGRES_USER,
//   password: process.env.POSTGRES_PASSWORD ? '***' : undefined,
//   host: process.env.POSTGRES_HOST,
//   port: process.env.POSTGRES_PORT,
//   database: process.env.POSTGRES_DB
// })

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err)
    return
  }
  if (!client) {
    console.error('Client undefined')
    return
  }
  client.query('SELECT NOW()', (err) => {
    release()
    if (err) {
      console.error('Error executing query:', err)
      return
    }
    console.log('Database connected successfully')
  })
})

export async function query(text: string, params?: unknown[]): Promise<QueryResult> {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export default pool 