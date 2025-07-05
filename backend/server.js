const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
require('dotenv').config();

// 引入路由模块
const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const codeRoutes = require('./routes/codeRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const wrongQuestionRoutes = require('./routes/wrongQuestionRoutes');
const coachAgentRoutes = require('./routes/coachAgentRoutes');
const systemDesignRoutes = require('./routes/systemDesignRoutes');
const behavioralRoutes = require('./routes/behavioralRoutes');
const mockRoutes = require('./routes/mockRoutes');

// --- 初始化 ---
const app = express();

// CORS 配置
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://your-frontend-domain.vercel.app', // 替换为你的 Vercel 域名
        'https://your-frontend-domain.vercel.app', // 替换为你的 Vercel 域名
        'http://localhost:5173', // 开发环境
        'http://localhost:3000'  // 开发环境
      ]
    : true,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    abortOnLimit: true,
    createParentPath: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not Set'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Interview Coach API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// --- API 路由挂载 ---
// 所有 /api/auth 开头的请求都由 authRoutes 处理
app.use('/api/auth', authRoutes);
// 所有 /api/questions 开头的请求都由 questionRoutes 处理
app.use('/api/questions', questionRoutes);
app.use('/api/code', codeRoutes); 
app.use('/api/resume', resumeRoutes);
app.use('/api/wrong-questions', wrongQuestionRoutes);
app.use('/api/coach-agent', coachAgentRoutes);
app.use('/api/system-design', systemDesignRoutes);
app.use('/api/behavioral', behavioralRoutes);
app.use('/api/mock', mockRoutes);

// --- 启动服务器 ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Firebase Project ID: ${process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not Set'}`);
});