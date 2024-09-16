import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  try {
    const db = await open({
      filename: './user.db',
      driver: sqlite3.Database
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

    await db.close();

    res.status(201).json({ message: '用户注册成功' });
  } catch (error) {
    console.error(error);
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ message: '用户名或邮箱已经存在' });
    } else {
      res.status(500).json({ message: '网络服务错误' });
    }
  }
}
