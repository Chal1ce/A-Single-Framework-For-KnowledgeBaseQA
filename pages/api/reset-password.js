import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { token, password } = req.body;

  try {
    const db = await open({
      filename: './user.db',
      driver: sqlite3.Database
    });

    const user = await db.get('SELECT * FROM users WHERE reset_token = ?', [token]);

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run('UPDATE users SET password = ?, reset_token = NULL WHERE id = ?', [hashedPassword, user.id]);

    await db.close();

    res.status(200).json({ message: '密码重置成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '网络服务错误' });
  }
}
