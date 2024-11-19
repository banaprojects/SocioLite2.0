import { query } from './db';
import bcrypt from 'bcryptjs';

export async function createTestUser() {
  const email = 'test@example.com';
  const password = 'password123';
  const name = 'Test User';

  try {
    // First, ensure the database connection is working
    await query('SELECT NOW()');
    console.log('Database connection successful');

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      console.log('Test user already exists');
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const result = await query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [name, email, passwordHash]
    );

    console.log('Test user created successfully with ID:', result.rows[0].id);
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}

// Run this function if you want to create a test user
// createTestUser(); 