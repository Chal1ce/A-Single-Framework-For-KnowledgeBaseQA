const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcrypt');

async function initDb() {
  const db = await open({
    filename: './user.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT,
      reset_token TEXT
    )
  `);

  await db.close();
  console.log('数据库初始化完成');
}

initDb().catch(console.error);
