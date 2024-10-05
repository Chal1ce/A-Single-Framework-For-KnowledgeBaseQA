import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import '../../styles/navbar.css';

const Navbar = ({ className, ...props }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    if (loggedIn) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        setUsername(user?.username || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUsername('');
      }
    }
  }, []);

  const navItems = [
    { name: '首页', path: '/helloWorld' },
    { name: '百科问答', path: '/BaikeSearch' },
    { name: '论坛', path: '/forum' },
    { name: '关于', path: '/about' },
  ];

  const handleNavigation = (path) => {
    router.push(path);
  };

  const isActive = (path) => {
    if (path === '/BaikeSearch') {
      return router.pathname.startsWith('/BaikeSearch');
    }
    return router.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUsername('');
    router.push('/login');
  };

  return (
    <nav className={`navbar bg-gray-100 ${className}`} {...props}>
      <div className="navbar-container">
        <div className="navbar-content">
          <div className="navbar-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.867 3.493l4.133 3.444v5.127l-10 8.333-10-8.334v-5.126l4.133-3.444 5.867 3.911 5.867-3.911zm.133-2.493l-6 4-6-4-6 5v7l12 10 12-10v-7l-6-5z" fill="rgb(0, 100, 0)"/>
            </svg>
          </div>
          <div className="navbar-links">
            {navItems.map((item) => (
              <button
                key={item.name}
                className={`navbar-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
              >
                {item.name}
              </button>
            ))}
          </div>
          <div className="navbar-button">
            {isLoggedIn ? (
              <>
                <span className="navbar-greeting">你好，{username}</span>
                <button className="logout-button" onClick={handleLogout}>退出登录</button>
              </>
            ) : (
              <button className="login-button" onClick={() => handleNavigation('/login')}>登录</button>
            )}
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="navbar-menu-button"
            aria-expanded="false"
          >
            <span className="sr-only">打开主菜单</span>
            <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="navbar-mobile-menu">
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`navbar-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              {item.name}
            </button>
          ))}
          {isLoggedIn ? (
            <>
              <span className="navbar-greeting">你好，{username}</span>
              <button className="logout-button" onClick={handleLogout}>退出登录</button>
            </>
          ) : (
            <button className="login-button" onClick={() => handleNavigation('/login')}>登录</button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;