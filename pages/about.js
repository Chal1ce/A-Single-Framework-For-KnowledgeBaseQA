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
            <p className="about-text">欢迎来到智慧农业平台项目。</p>
            <p className="about-text">这是我毕业后对毕业设计的重构优化。</p>
            <div className="about-text">
              最初版本:
              <ul>
                <li>全Python开发</li>
                <li>无前后端分离</li>
                <li>使用Streamlit构建前端</li>
              </ul>
            </div>
            <div className="about-text">
              重构版本:
              <ul>
                <li>采用Next.js框架</li>
                <li>实现前后端分离</li>
                <li>正在学习和改进中</li>
              </ul>
            </div>
          </div>
          <div className="about-footer">
            <div className="about-timeline">Python+Streamlit → Next.js重构 → 持续优化</div>
            <p className="about-summary">从学生项目到专业重构,持续学习与进步</p>
          </div>
        </div>
      </main>
    </div>
  );
}
