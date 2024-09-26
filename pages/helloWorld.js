import React from 'react';
import { useRouter } from 'next/router';
import Navbar from '../src/components/ui/navbar';
import styles from '../styles/HelloWorld.module.css';

// 卡片数据
const cardData = [
  {
    title: "AI知识库问答对话",
    content: "利用大语言模型，实现知识库问答对话，同时支持联网搜索，从网络中获取最新信息以及答案。",
    buttonText: "体验对话",
    route: "/BaikeSearch/conversation"
  },
  {
    title: "知识论坛",
    content: "可以搭建一个属于你的论坛，可以讨论任何你想讨论的话题。",
    buttonText: "了解更多",
    route: "/forum"
  },
  {
    title: "开源协作",
    content: "欢迎你参与到开源协作中来，对项目不断进行改进。",
    buttonText: "参与贡献",
    route: "https://github.com/Chal1ce/Agriculture-Chatbot-With-Neo4j" // 替换为您的GitHub仓库URL
  }
];

function HelloWorld() {
  const router = useRouter();

  const handleCardClick = (route) => {
    if (route.startsWith('http')) {
      window.open(route, '_blank');
    } else {
      router.push(route);
    }
  };

  // 新增：GitHub按钮点击处理函数
  const handleGithubClick = () => {
    window.open('https://github.com/Chal1ce/Agriculture-Chatbot-With-Neo4j', '_blank');
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.heroSection}>
        <div className={styles.heroImage}>
          <div className={styles.heroContent}>
            <h2 className={styles.heroTitle}>开源的、简单的<br />结合AI的知识论坛框架</h2>
            <button className={styles.githubButton} onClick={handleGithubClick}>
              <svg
                className={styles.githubIcon}
                height="100"
                preserveAspectRatio="xMidYMid meet"
                viewBox="0 0 100 100"
                width="100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M50,1.23A50,50,0,0,0,34.2,98.68c2.5.46,3.41-1.09,3.41-2.41s0-4.33-.07-8.5c-13.91,3-16.84-6.71-16.84-6.71-2.28-5.77-5.55-7.31-5.55-7.31-4.54-3.1.34-3,.34-3,5,.35,7.66,5.15,7.66,5.15C27.61,83.5,34.85,81.3,37.7,80a10.72,10.72,0,0,1,3.17-6.69C29.77,72.07,18.1,67.78,18.1,48.62A19.34,19.34,0,0,1,23.25,35.2c-.52-1.26-2.23-6.34.49-13.23,0,0,4.19-1.34,13.75,5.13a47.18,47.18,0,0,1,25,0C72.07,20.63,76.26,22,76.26,22c2.72,6.89,1,12,.49,13.23a19.28,19.28,0,0,1,5.14,13.42c0,19.21-11.69,23.44-22.83,24.67,1.8,1.55,3.4,4.6,3.4,9.26,0,6.69-.06,12.08-.06,13.72,0,1.34.9,2.89,3.44,2.4A50,50,0,0,0,50,1.23Z"
                ></path>
              </svg>
              前往 Github →
            </button>
          </div>
        </div>
        <div className={`${styles.wave} ${styles.wave1}`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#ffffff" fillOpacity="0.7" d="M0,160L48,176C96,192,192,224,288,240C384,256,480,256,576,234.7C672,213,768,171,864,165.3C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        <div className={`${styles.wave} ${styles.wave2}`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#ffffff" fillOpacity="0.5" d="M0,128L48,122.7C96,117,192,107,288,101.3C384,96,480,96,576,117.3C672,139,768,181,864,197.3C960,213,1056,203,1152,186.7C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>
      
      {/* 修改后的卡片部分 */}
      <div className={styles.cardContainer}>
        {cardData.map((card, index) => (
          <div key={index} className={styles.card}>
            <div className={`${styles.cardBlur} ${styles.cardBlur1}`}></div>
            <div className={`${styles.cardBlur} ${styles.cardBlur2}`}></div>
            <div className={`${styles.cardBlur} ${styles.cardBlur3}`}></div>
            <div className={`${styles.cardBlur} ${styles.cardBlur4}`}></div>
            <div className={styles.cardContent}>
              <span className={styles.cardTitle}>{card.title}</span>
              <p>{card.content}</p>
              <button 
                className={styles.cardButton}
                onClick={() => handleCardClick(card.route)}
              >
                {card.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* ... 其余内容 ... */}
    </div>
  );
}

export default HelloWorld;
