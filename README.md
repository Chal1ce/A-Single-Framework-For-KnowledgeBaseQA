这是我的个人项目 `基于知识图谱的农业种养殖技术服务系统` 的前端项目，基于 `next.js` 进行开发。你也可以作为一个前端模板进行二次开发使用。

## 开始

**运行项目:**

⚠️ 首次运行项目前，需要先运行初始化数据库的脚本。
- 在命令行或终端中输入以下命令：
```bash
npm run initialize-db
```

- 然后输入以下命令启动项目：
```bash
npm run dev
```

在浏览器打开链接 [http://localhost:3000](http://localhost:3000) 在浏览器中查看结果。

项目中使用了 Next.js 的字体优化功能，特别是用于加载和优化 Inter 字体，这是一种 Google 提供的自定义字体。链接指向了 Next.js 文档中关于字体优化的详细说明。链接：[next/font](https://nextjs.org/docs/basic-features/font-optimization)

## 项目信息

```bash
# 首次进去的主页面
src/app/page.js
# 初始化用户数据库脚本
.init-db.js

# src
|--src
    |----app # 主页面
        |----favicon.ico # 网站图标
        |----layout.js # 主页面布局
        |----page.js # 主页面
        |----page.module.css # 主页面样式
        |----(other) # 其他
    |----components # 组件
        |----user # 用户相关；页面样式什么的可以在这改
            |----background.css # 登录注册页面的背景
            |----login.module.css # 登录注册页面的样式
            |----register.js # 注册页面
            |----ForgotPW.js # 忘记密码、重置密码页面
            |----Login.js # 登录页面
    ｜----layout # 目前没放东西

|--public # 存放公共资源，例如图片等

# pages
|--pages
    |----api # 接口
        |----forgot-password # 忘记密码，重置密码
        |----register # 注册
        |----login # 登录
        |----(other) # 其他
    |----forgot-password.js # 忘记密码，重置密码页面
    |----register.js # 注册页面
    |----login.js # 登录页面
    |----helloWorld.js # 测试页面

```
