import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../../styles/login.module.css';
import background from '../../styles/background.css';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 创建 FormData 对象
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const response = await fetch('http://127.0.0.1:8000/register', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                router.push('/login');
            } else {
                const data = await response.json();
                setError(data.message || '注册失败，请稍后重试');
            }
        } catch (err) {
            setError('发生了一个未知错误，请稍后重试');
        }
    };

    return (
        <div className={background.container}>
            <div className={styles.container}>
                <h1 className={styles.title}>注册</h1>
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
                        {/* 密码输入 */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="password">密码</label>
                            <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="输入你的密码"
                            className={styles.input}
                            required
                            />
                        </div>
                        {/* 错误信息显示 */}
                        {error && <p className={styles.error}>{error}</p>}
                        {/* 提交按钮 */}
                        <button type="submit" className={styles.button}>
                            创建账号
                        </button>
                        </form>
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

export default Register;