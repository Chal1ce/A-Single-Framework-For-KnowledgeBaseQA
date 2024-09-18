import { useState } from 'react';
import Navbar from '../ui/navbar';
import FloatingSidebar from '../ui/FloatingSidebar';
import styles from '../../styles/FloatingSidebar.module.css';
import searchStyles from '../../styles/SearchBox.module.css';

export default function BaikeSearch() {
  const [activeSection, setActiveSection] = useState('conversation');

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <FloatingSidebar>
          <button
            className={`${styles.sidebarButton} ${activeSection === 'baikeSearch' ? styles.active : ''}`}
            onClick={() => handleSectionChange('baikeSearch')}
          >
            百科搜索
            <svg viewBox="0 0 16 19" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z" />
            </svg>
          </button>
          <button
            className={`${styles.sidebarButton} ${activeSection === 'conversation' ? styles.active : ''}`}
            onClick={() => handleSectionChange('conversation')}
          >
            物种知识问答
            <svg viewBox="0 0 16 19" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z" />
            </svg>
          </button>
          <button
            className={`${styles.sidebarButton} ${activeSection === 'recognition' ? styles.active : ''}`}
            onClick={() => handleSectionChange('recognition')}
          >
            物种识别
            <svg viewBox="0 0 16 19" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z" />
            </svg>
          </button>
        </FloatingSidebar>
        <main className="flex-1">
          {activeSection === 'baikeSearch' && (
            <div className={searchStyles.searchContainer}>
              <h1 className={searchStyles.searchTitle}>百科搜索</h1>
              <p className={searchStyles.searchSubtitle}>输入物种名称，探索知识的海洋</p>
              <div className={searchStyles.searchInputContainer}>
                <input
                  type="text"
                  className={searchStyles.searchInput}
                  placeholder="请输入搜索内容"
                />
                <button className={searchStyles.searchButton}>
                  搜索
                </button>
              </div>
            </div>
          )}
        </main>
        <main className="flex-1">
          {activeSection === 'conversation' && (
            <div className={searchStyles.searchContainer}>
              <p className={searchStyles.searchSubtitle}>请输入您的问题，我将为您解答</p>
              <div className={searchStyles.searchInputContainer}>
                <input
                  type="text"
                  className={searchStyles.searchInput}
                  placeholder="请输入搜索内容"
                />
                <button className={searchStyles.searchButton}>
                  发送
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}