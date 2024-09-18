import React, { useState } from 'react';
import Navbar from '../src/components/ui/navbar';
import { Button } from '../src/components/ui/button';
import FloatingSidebar from '../src/components/ui/FloatingSidebar';
import styles from '../src/styles/FloatingSidebar.module.css';

function HelloWorld() {
  const [activeSection, setActiveSection] = useState('conversation');

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 pt-16">
        <FloatingSidebar>
          <button
            className={`${styles.sidebarButton} ${activeSection === 'conversation' ? styles.active : ''}`}
            onClick={() => handleSectionChange('conversation')}
          >
            对话
            <svg viewBox="0 0 16 19" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z" />
            </svg>
          </button>
          <button
            className={`${styles.sidebarButton} ${activeSection === 'recognition' ? styles.active : ''}`}
            onClick={() => handleSectionChange('recognition')}
          >
            识别
            <svg viewBox="0 0 16 19" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z" />
            </svg>
          </button>
        </FloatingSidebar>
        <main className="flex-1 p-6 flex justify-center items-center"> {/* 移除左边距，添加居中样式 */}
          <div className="max-w-3xl w-full">
            {activeSection === 'conversation' && (
              <div className="text-center"> {/* 添加文本居中样式 */}
                <h1 className="text-3xl font-bold mb-4">对话部分</h1>
                <p className="mb-4">这里是对话相关的内容。</p>
                <Button>开始对话</Button>
              </div>
            )}
            {activeSection === 'recognition' && (
              <div className="text-center"> {/* 添加文本居中样式 */}
                <h1 className="text-3xl font-bold mb-4">识别部分</h1>
                <p className="mb-4">这里是识别相关的内容。</p>
                <Button>开始识别</Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default HelloWorld;
