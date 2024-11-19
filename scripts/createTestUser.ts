import { query } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      ['test@example.com']
    );

    if (existingUser.rows.length > 0) {
      console.log('Test user already exists');
      return;
    }

    // Create test user
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      ['Test User', 'test@example.com', hashedPassword]
    );

    console.log('Test user created with ID:', result.rows[0].id);
    console.log('Email: test@example.com');
    console.log('Password: password123');
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 