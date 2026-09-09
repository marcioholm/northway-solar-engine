const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: __dirname + '/.env' });

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const file = process.argv[2];
  if (!file) {
    console.error("Please provide a file to run.");
    process.exit(1);
  }
  const sql = fs.readFileSync(file, 'utf8');
  try {
    await client.query(sql);
    console.log("Migration executed successfully!");
  } catch(e) {
    console.error("Error:", e.message);
  } finally {
    await client.end();
  }
}
run();
