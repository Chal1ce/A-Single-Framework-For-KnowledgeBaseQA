import React from 'react';
import styles from '../../styles/FloatingSidebar.module.css';

const FloatingSidebar = ({ children }) => {
  return (
    <aside className={styles.floatingSidebar}>
      <nav className={styles.sidebarContent}>
        {children}
      </nav>
    </aside>
  );
};

export default FloatingSidebar;