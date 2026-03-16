const db = require('./db');

async function getState(key) {
  const result = await db.query('SELECT value FROM bot_state WHERE key = $1;', [key]);
  return result.rows[0]?.value ?? null;
}

async function setState(key, value) {
  await db.query(
    `
      INSERT INTO bot_state (key, value)
      VALUES ($1, $2)
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value;
    `,
    [key, value],
  );
}

module.exports = {
  getState,
  setState,
};
