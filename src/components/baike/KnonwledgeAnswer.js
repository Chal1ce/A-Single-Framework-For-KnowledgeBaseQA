import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import searchStyles from '../../styles/SearchBox.module.css';
import resultStyles from '../../styles/BaikeSearchResults.module.css';
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";
import "markmap-toolbar/dist/style.css";
import { toPng } from 'html-to-image';

const transformer = new Transformer();

const markdownContent = `
# 思维导图
## 第一部分
- 子项1
- 子项2
## 第二部分
- 子项A
- 子项B
`;

// Mindmap组件用于渲染思维导图
const Mindmap = ({ markdown }) => {
  // 用于存储转换后的markdown内容
  const [value, setValue] = useState("");
  // 用于引用SVG元素
  const refSvg = useRef(null);

  // 当value变化时，创建或更新思维导图
  useEffect(() => {
    if (refSvg.current && value) {
      // 创建Markmap实例
      const mm = Markmap.create(refSvg.current);
      if (!mm) return;

      // 转换markdown数据
      const transformData = transformer.transform(value);
      console.log("root", transformData);
      const { root } = transformData;
      // 设置思维导图数据
      mm.setData(root);
    }
  }, [value]);

  // 当markdown prop变化时，延迟设置value
  useEffect(() => {
    const timer = setTimeout(() => {
      setValue(markdown);
      clearTimeout(timer);
    }, 1000);
  }, [markdown]);

  const handleSaveImage = () => {
    if (refSvg.current) {
      toPng(refSvg.current)
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'mindmap.png';
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error('保存图片时出错:', err);
        });
    }
  };

  return (
    <div className={resultStyles.mindmapContainer}>
      <svg ref={refSvg} width="100%" height="100%" style={{ overflow: 'visible' }} />
      <button 
        className={`${searchStyles.searchButton} ${resultStyles.saveImageButton}`}
        onClick={handleSaveImage}
      >
        保存图片
      </button>
    </div>
  );
};

export default function KnowledgeAnswer() {
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showMindmapButton, setShowMindmapButton] = useState(false);
  const [mindmapData, setMindmapData] = useState('');
  const [isGeneratingMindmap, setIsGeneratingMindmap] = useState(false);
  const chatContainerRef = useRef(null);

  const handleChatSubmit = async () => {
    setIsStreaming(true);
    setChatResponse('');
    setShowMindmapButton(false);
    setMindmapData('');
    
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
      setShowMindmapButton(true);  // 在响应完成后显示生成思维导图按钮
    }
  };

  const handleGenerateMindmap = async () => {
    setIsGeneratingMindmap(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/summary_to_mindmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: chatResponse }),
      });
      
      if (!response.ok) {
        throw new Error('网络响应不正常');
      }
      
      const data = await response.text();
      // 处理思维导图数据
      const processedData = data
        .replace(/^"|"$/g, '')  // 去掉开头和结尾的双引号
        .replace(/\\n/g, '\n')  // 将 \n 转换为实际的换行符
        .replace(/##/g, '\n##')  // 在所有 '##' 前添加换行
        .replace(/(?<!\n)-/g, '\n-');  // 在所有不在行首的 '-' 前添加换行
      
      setMindmapData(processedData);
      console.log('思维导图数据:', processedData);
    } catch (error) {
      console.error('生成思维导图时出错:', error);
    } finally {
      setIsGeneratingMindmap(false);
    }
  };

  // 当chatResponse变化时，滚动到最新消息
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatResponse]);

  return (
    <div className={searchStyles.searchContainer}>
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
          {showMindmapButton && (
            <div className={resultStyles.mindmapButtonContainer}>
              <button 
                className={`${searchStyles.searchButton} ${resultStyles.mindmapButton}`}
                onClick={handleGenerateMindmap}
                disabled={isGeneratingMindmap}
              >
                {isGeneratingMindmap ? '生成中...' : '生成思维导图'}
              </button>
            </div>
          )}
        </div>
      )}
      {isGeneratingMindmap && (
        <div className={resultStyles.loadingOverlay}>
          <div className={resultStyles.spinner}></div>
        </div>
      )}
      {mindmapData && (
        <div className={resultStyles.mindmapWrapper}>
          <Mindmap markdown={mindmapData} />
        </div>
      )}
    </div>
  );
}
