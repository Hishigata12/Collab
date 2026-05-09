require("dotenv").config();

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const { Pool } = require("pg");

async function main() {
  const sqliteDb = await open({
    filename: "./users.db",
    driver: sqlite3.Database,
  });

  const pg = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  });

  try {
    // Change this schema to match your actual users table.
    await pg.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const users = await sqliteDb.all(`SELECT * FROM users`);

    console.log(`Found ${users.length} users in SQLite.`);

    for (const user of users) {
      await pg.query(
        `
        INSERT INTO users (id, username, password, email, created_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING;
        `,
        [
          user.id,
          user.username,
          user.password,
          user.email ?? null,
          user.created_at ?? new Date(),
        ]
      );
    }

    // Keep Postgres SERIAL id in sync after manually inserting ids.
    await pg.query(`
      SELECT setval(
        pg_get_serial_sequence('users', 'id'),
        COALESCE((SELECT MAX(id) FROM users), 1)
      );
    `);

    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await sqliteDb.close();
    await pg.end();
  }
}

main();