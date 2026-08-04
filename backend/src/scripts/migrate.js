import { migrate } from '../config/schema.js';
import { db, closeDb } from '../config/database.js';

async function run() {
  await migrate();
  await closeDb();
  console.log('✅ Migrations applied');
  process.exit(0);
}

run().catch(e => {
  console.error('Migration failed:', e);
  process.exit(1);
});
