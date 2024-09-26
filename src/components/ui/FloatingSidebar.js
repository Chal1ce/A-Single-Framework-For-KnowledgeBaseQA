import React, { useState } from 'react';
import styles from '../../styles/FloatingSidebar.module.css';
import axios from 'axios';

const FloatingSidebar = ({ children }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('');
  const [embedModel, setEmbedModel] = useState('');
  const [needWebSearch, setNeedWebSearch] = useState(false);
  const [serperApiKey, setSerperApiKey] = useState('');

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const settings = { 'baseUrl': baseUrl, 'apiKey': apiKey, 'modelName': modelName, 'embedModel': embedModel, 'needWebSearch': needWebSearch, 'serperApiKey': serperApiKey };
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/update_settings', settings);
      if (response.status === 200) {
        // 显示成功消息
        const successMessage = document.createElement('div');
        successMessage.textContent = '设置已成功保存';
        successMessage.style.cssText = `
          position: fixed;
          top: 70px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #4CAF50;
          color: white;
          padding: 15px;
          border-radius: 5px;
          z-index: 1000;
        `;
        document.body.appendChild(successMessage);

        // 移除消息
        setTimeout(() => {
          document.body.removeChild(successMessage);
        }, 1500);
        console.log('设置已成功保存到服务器');
        setIsSettingsOpen(false);
      } else {
        console.error('保存设置时出错:', response.statusText);
      }
    } catch (error) {
      console.error('发送设置请求时出错:', error);
    }
  };

  return (
    <aside className={`${styles.floatingSidebar} ${isSidebarVisible ? '' : styles.hidden}`}>
      {isSidebarVisible ? (
        <>
          <nav className={styles.sidebarContent}>
            {children}
          </nav>
          <div className={styles.sidebarControls}>
            <button className={`${styles.button} ${styles.toggleButton}`} onClick={toggleSidebar}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span className={styles.label}>隐藏</span>
            </button>
            <button className={styles.button} onClick={toggleSettings}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 20 20" height="16" fill="none" className={styles.svgIcon}>
                <g strokeWidth="1.5" strokeLinecap="round" stroke="currentColor">
                  <circle r="2.5" cy="10" cx="10"></circle>
                  <path fillRule="evenodd" d="m8.39079 2.80235c.53842-1.51424 2.67991-1.51424 3.21831-.00001.3392.95358 1.4284 1.40477 2.3425.97027 1.4514-.68995 2.9657.82427 2.2758 2.27575-.4345.91407.0166 2.00334.9702 2.34248 1.5143.53842 1.5143 2.67996 0 3.21836-.9536.3391-1.4047 1.4284-.9702 2.3425.6899 1.4514-.8244 2.9656-2.2758 2.2757-.9141-.4345-2.0033.0167-2.3425.9703-.5384 1.5142-2.67989 1.5142-3.21831 0-.33914-.9536-1.4284-1.4048-2.34247-.9703-1.45148.6899-2.96571-.8243-2.27575-2.2757.43449-.9141-.01669-2.0034-.97028-2.3425-1.51422-.5384-1.51422-2.67994.00001-3.21836.95358-.33914 1.40476-1.42841.97027-2.34248-.68996-1.45148.82427-2.9657 2.27575-2.27575.91407.4345 2.00333-.01669 2.34247-.97026z" clipRule="evenodd"></path>
                </g>
              </svg>
              <span className={styles.label}>设置</span>
            </button>
          </div>
        </>
      ) : (
        <button
          className={`${styles.showButton} ${styles.exploreButton}`}
          onClick={toggleSidebar}
        >
        </button>
      )}
      {isSettingsOpen && (
        <div className={styles.settingsPanel}>
          <h3>设置</h3>
          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="baseUrl">Base URL:</label>
              <input
                type="text"
                id="baseUrl"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="输入 Base URL"
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="apiKey">API Key:</label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入 API Key"
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="modelName">模型名称:</label>
              <input
                type="text"
                id="modelName"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="输入模型名称"
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="embedModel">Embed Model:</label>
              <input
                type="text"
                id="embedModel"
                value={embedModel}
                onChange={(e) => setEmbedModel(e.target.value)}
                placeholder="输入 Embed Model 名称"
              />
            </div>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="needWebSearch"
                checked={needWebSearch}
                onChange={(e) => setNeedWebSearch(e.target.checked)}
              />
              <label htmlFor="needWebSearch">联网搜索(Google)</label>
            </div>
            {needWebSearch && (
              <div className={styles.inputGroup}>
                <label htmlFor="serperApiKey">Google API Key:</label>
                <input
                  type="password"
                  id="serperApiKey"
                  value={serperApiKey}
                  onChange={(e) => setSerperApiKey(e.target.value)}
                  placeholder="输入 Google Serper API Key"
                />
              </div>
            )}
            <button type="submit" className={styles.submitButton}>确认设置</button>
          </form>
        </div>
      )}
    </aside>
  );
};

export default FloatingSidebar;