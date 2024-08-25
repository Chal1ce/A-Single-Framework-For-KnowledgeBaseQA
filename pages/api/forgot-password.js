import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email } = req.body;

  try {
    const db = await open({
      filename: './user.db',
      driver: sqlite3.Database
    });

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    await db.run('UPDATE users SET reset_token = ? WHERE id = ?', [resetToken, user.id]);

    await db.close();

    // 在实际应用中，你应该发送一封包含重置链接的电子邮件
    // 这里我们只是返回重置令牌作为演示
    res.status(200).json({ message: '密码重置链接已经发送到电子邮箱', resetToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '网络服务错误' });
  }
}
