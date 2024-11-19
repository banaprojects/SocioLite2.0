import { createTestUser } from '../src/lib/createTestUser';

async function main() {
  try {
    await createTestUser();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 