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

    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const match = await bcrypt.compare(password, user.password);

    if (match) {
      res.status(200).json({ message: '登录成功' });
    } else {
      res.status(401).json({ message: '用户名或密码错误' });
    }

    await db.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '网络服务错误' });
  }
}
