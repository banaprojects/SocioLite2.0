import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { query } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

type Session = {
  user: {
    id: string
    name: string
    email: string
  }
} | null

export async function auth(): Promise<Session> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')
    
    if (!token) {
      return null
    }
    
    // Verify the JWT token
    const { payload } = await jwtVerify(
      token.value,
      new TextEncoder().encode(JWT_SECRET)
    )
    
    // Get user from database
    const result = await query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [payload.userId]
    )
    
    if (result.rows.length === 0) {
      return null
    }
    
    const user = result.rows[0]
    
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    }
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
} 