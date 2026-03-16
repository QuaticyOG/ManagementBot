const db = require('./db');

async function initDatabase() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      department TEXT NOT NULL,
      assigned_user_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'todo',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMP NULL
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS bot_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

module.exports = { initDatabase };
