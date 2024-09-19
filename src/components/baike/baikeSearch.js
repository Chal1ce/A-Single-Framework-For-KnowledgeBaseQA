import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Navbar from '../ui/navbar';
import FloatingSidebar from '../ui/FloatingSidebar';
import styles from '../../styles/FloatingSidebar.module.css';
import searchStyles from '../../styles/SearchBox.module.css';
import resultStyles from '../../styles/BaikeSearchResults.module.css';

export default function BaikeSearch() {
  const [activeSection, setActiveSection] = useState('baikeSearch');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const chatContainerRef = useRef(null);

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleSearch = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/search_baidu_baike', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await response.json();
      console.log(data);
      setSearchResults(data.results);
    } catch (error) {
      console.error('搜索出错:', error);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleImageError = (event) => {
    event.target.src = '/404.svg';
  };

  const BaikeSearchResult = ({ result }) => {
    return (
      <div className={resultStyles.cardWrapper}>
        <div className={resultStyles.resultCard}>
          <div className={resultStyles.cardLeft}>
            <h4 className={resultStyles.keyword}>关键词：</h4>
            <p className={resultStyles.keywordContent}>{result.keywords}</p>
            <h4 className={resultStyles.description}>描述：</h4>
            <p className={resultStyles.descriptionContent}>{result.summary}</p>
          </div>
          <div className={resultStyles.cardRight}>
            <img src={result.image} alt={result.title} className={resultStyles.cardImage} onError={handleImageError} />
            <div className={resultStyles.cardTitle}>{searchQuery}</div>
          </div>
        </div>
        <button 
          className={resultStyles.viewMoreButton}
          onClick={() => window.open(result.url, '_blank')}
        >
          查看更多
        </button>
      </div>
    );
  };

  const handleChatSubmit = async () => {
    setIsStreaming(true);
    setChatResponse('');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: chatQuery }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setChatResponse(prev => prev + chunk);
      }
    } catch (error) {
      console.error('聊天出错:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatResponse]);

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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button className={searchStyles.searchButton} onClick={handleSearch}>
                  搜索
                </button>
              </div>
              {searchResults.length > 0 && (
                <div className={resultStyles.resultsContainer}>
                  {searchResults.map((result, index) => (
                    <BaikeSearchResult key={index} result={result} />
                  ))}
                </div>
              )}
            </div>
          )}
          {activeSection === 'conversation' && (
            <div className={searchStyles.searchContainer}>
              {/*<h2 className={searchStyles.searchTitle}>物种知识问答</h2>*/}
              <p className={searchStyles.searchSubtitle}>请输入您的问题，我将为您解答</p>
              <div className={searchStyles.searchInputContainer}>
                <input
                  type="text"
                  className={searchStyles.searchInput}
                  placeholder="请输入您的问题"
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                />
                <button 
                  className={searchStyles.searchButton}
                  onClick={handleChatSubmit}
                  disabled={isStreaming}
                >
                  发送
                </button>
              </div>
              {chatResponse && (
                <div className={resultStyles.chatResponseContainer} ref={chatContainerRef}>
                  <div className={resultStyles.chatResponse}>
                    <h4>回答：</h4>
                    <ReactMarkdown>{chatResponse}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}