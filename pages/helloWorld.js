import React from 'react';
import styles from '../styles/helloworld.css'; // 我们将为组件创建一个CSS模块

function HelloWorld() {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <nav>
          <ul>
            <li><a href="#conversation">对话</a></li>
            <li><a href="#recognition">识别</a></li>
          </ul>
        </nav>
      </aside>
      <main className={styles.content}>
        <h1>Hello, World!</h1>
        <p>Welcome to my Next.js page.</p>
      </main>
    </div>
  );
}

export default HelloWorld;
