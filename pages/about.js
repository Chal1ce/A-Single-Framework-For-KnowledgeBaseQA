import Navbar from '../src/components/ui/navbar';
import '../src/styles/about.css';

export default function About() {
  return (
    <div>
      <Navbar />
      <main className="about-container">
        <div className="about-card">
          <h1 className="about-title">关于这个项目</h1>
          <hr className="about-divider" />
          <div className="about-content">
            <p className="about-text">欢迎来到这个开源项目</p>
            <p className="about-text">这是我毕业后对毕业设计的重构优化。</p>
            <div className="about-text">
              当前版本:
              <ul>
                <li>前端使用Next.js</li>
                <li>后端使用FastAPI</li>
                <li>实现前后端分离</li>
                <li>后端可灵活接入多种数据库</li>
                <li>可自定义Agent</li>
                <li>可自定义知识库</li>
                <li>可兼容添加更多功能，例如图象识别、各种检测预测、种养殖推荐功能等等</li>
                <li>正在学习和改进中</li>
              </ul>
            </div>
          </div>
          <div className="about-footer">
            <div className="about-timeline">Python+Streamlit → Next.js重构 → 持续优化</div>
            <p className="about-summary">无限进步, 无限精彩</p>
          </div>
        </div>
      </main>
    </div>
  );
}
