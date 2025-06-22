AI 面试教练 (React + Vite + TailwindCSS)
本项目是一个功能丰富的前端应用，旨在为准备技术面试的用户提供一个全面的、由AI驱动的练习平台。它采用了现代化的前端技术栈，包括React、Vite和TailwindCSS，以确保高效的开发体验和卓越的用户界面。

核心功能
首页: 介绍平台功能并引导用户登录或开始练习。

仪表盘: 展示用户的学习进度、练习统计和AI推荐的下一步学习重点。

智能题库: 提供包括算法、系统设计、SQL在内的多种题型，支持按难度、公司等维度筛选。

AI模拟面试: 与AI进行算法、系统设计或行为面试，并获得专业的评分和反馈。

简历优化: 分析用户简历与目标职位描述（JD）的匹配度，并提供优化建议。

个性化教练: AI Agent根据用户的目标和进度，为其量身定制每日学习计划。

项目文件结构
/ai-coach-frontend/
│
├── public/
│   └── vite.svg
│
├── src/
│   ├── components/
│   │   └── ... (可复用UI组件)
│   ├── pages/
│   │   └── ... (主要页面组件)
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
└── tailwind.config.js

安装与运行指南
第一步：准备环境
确保您的电脑上已经安装了 Node.js (推荐版本 16 或更高)。

打开您的终端（命令行工具）。

第二步：创建项目
在您选择的位置创建一个新的项目文件夹并进入。

mkdir ai-coach-frontend
cd ai-coach-frontend

使用 Vite 初始化一个新的React项目。

npm create vite@latest . -- --template react

注意：命令末尾的 . 表示在当前文件夹中创建项目。

第三步：安装依赖
安装项目的主要依赖包。

npm install

安装 TailwindCSS 及其相关依赖。

npm install -D tailwindcss postcss autoprefixer

运行以下命令来创建TailwindCSS和PostCSS的配置文件 (tailwind.config.js 和 postcss.config.js)。

npx tailwindcss init -p

这个命令会替代之前package.json中的自定义脚本，是更标准的做法。

安装图标库 Lucide React。

npm install lucide-react

第四步：配置TailwindCSS
打开 tailwind.config.js 文件。

用以下内容替换该文件的全部内容，以告知Tailwind要扫描哪些文件来生成CSS。

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

打开 src/index.css 文件。

用以下内容替换该文件的全部内容，以引入Tailwind的基础样式。

@tailwind base;
@tailwind components;
@tailwind utilities;

第五步：启动开发服务器
完成所有配置和安装后，在终端中运行以下命令：

npm run dev

您的浏览器将自动打开 http://localhost:5173，您就可以看到并开始使用这个应用了。