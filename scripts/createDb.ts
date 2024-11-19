import { Client } from 'pg';

async function createDatabase() {
  // Connect to postgres database to create the app database
  const client = new Client({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: 'postgres' // Connect to default postgres database
  });

  try {
    await client.connect();
    
    // Check if database exists
    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.POSTGRES_DB]
    );

    if (res.rows.length === 0) {
      // Database doesn't exist, create it
      await client.query(`CREATE DATABASE ${process.env.POSTGRES_DB}`);
      console.log(`Database ${process.env.POSTGRES_DB} created successfully`);
    } else {
      console.log(`Database ${process.env.POSTGRES_DB} already exists`);
    }
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Check if this file is being run directly
if (require.main === module) {
  createDatabase()
    .then(() => {
      console.log('Database creation complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database creation failed:', error);
      process.exit(1);
    });
} 