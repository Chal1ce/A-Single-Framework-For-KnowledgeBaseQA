import { useState } from 'react';
import Link from 'next/link';
import styles from './login.module.css';
import background from './background.css';

export default function ForgotPassword() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const response = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <div className={background.container}>
        <div className={styles.container}>
            <h1 className={styles.title}>重置密码</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* 用户名输入 */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="username">用户名</label>
                        <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="输入你的用户名"
                        className={styles.input}
                        required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password">新密码:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>
                    {/* 提交按钮 */}
                    <button type="submit" className={styles.button}>
                        重置密码
                    </button>
                    </form>
                    {/* 错误信息显示 */}
                    {error && <p className={styles.error}>{error}</p>}
                    {/* 成功信息显示 */}
                    {message && <p className={styles.success}>{message}</p>}
                    {/* 其他链接 */}
                    <div className={styles.links}>
                    <Link href="/login" className={styles.link}>
                        返回登录页面
                    </Link>
                    </div>
                </div>
        </div>
    );
}
