import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../../styles/Login.module.css';
import background from '../../styles/background.css';

function Login() {
  // 使用 useState 钩子管理表单状态
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState(''); // 存储错误信息
  const [isLoading, setIsLoading] = useState(false); // 控制加载状态
  const [rememberMe, setRememberMe] = useState(false); //"记住我"功能状态
  
  const router = useRouter();  // 用于页面导航

  // 处理输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  // 表单验证
  const validateForm = () => {
    if (!credentials.username.trim()) {
      setError('用户名不能为空');
      return false;
    }
    if (!credentials.password.trim()) {
      setError('密码不能为空');
      return false;
    }
    return true;
  };

  // 新增: 用于检查登录状态的useEffect
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      router.push('/helloWorld');
    }
  }, []);

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      // 创建 FormData 对象
      const formData = new FormData();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);

      // 发送登录请求
      const response = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify({ username: credentials.username }));
        localStorage.setItem('isLoggedIn', 'true');
        router.push('/helloWorld');
      } else {
        setError(data.message || '登录失败，请检查你的账号密码');
      }
    } catch (err) {
      setError('发生了一个未知错误，请稍候重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={background.container}>
      <div className={styles.container}>
        <h1 className={styles.title}>登录</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* 用户名输入 */}
          <div className={styles.inputGroup}>
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className={styles.input}
              placeholder="输入你的用户名"
            />
          </div>
          {/* 密码输入 */}
          <div className={styles.inputGroup}>
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="输入你的密码"
            />
          </div>
          {/* "记住我"复选框 */}
          <div className={styles.rememberMe}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">记住我</label>
          </div>
          {/* 错误信息显示 */}
          {error && <p className={styles.error}>{error}</p>}
          {/* 提交按钮 */}
          <button type="submit" disabled={isLoading} className={styles.button}>
            {isLoading ? '登录中...' : 'Login'}
          </button>
        </form>
        {/* 其他链接 */}
        <div className={styles.links}>
          <Link href="/forgot-password" className={styles.link}>
              忘记密码？
          </Link>
          <Link href="/register" className={styles.link}>
              创建账号
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;