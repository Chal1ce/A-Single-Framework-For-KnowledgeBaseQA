import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/login.module.css';
import background from '../../styles/background.css';

export default function ForgotPassword() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // 创建 FormData 对象
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch('http://127.0.0.1:8000/forgot-password', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || '密码重置成功，请使用新密码登录。');
        // 可以在这里添加一个延迟，然后自动跳转到登录页面
        setTimeout(() => router.push('/Login'), 3000);
      } else {
        setError(data.message || '密码重置失败，请稍后重试。');
      }
    } catch (err) {
      setError('发生了一个未知错误，请稍后重试');
    }
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
