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
app.use(cors());
app.use(express.json());
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    abortOnLimit: true,
    createParentPath: true
}));

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
});