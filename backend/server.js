const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 引入路由模块
const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const codeRoutes = require('./routes/codeRoutes');

// --- 初始化 ---
const app = express();
app.use(cors());
app.use(express.json());


// --- API 路由挂载 ---
// 所有 /api/auth 开头的请求都由 authRoutes 处理
app.use('/api/auth', authRoutes);
// 所有 /api/questions 开头的请求都由 questionRoutes 处理
app.use('/api/questions', questionRoutes);
app.use('/api/code', codeRoutes); 

// --- 启动服务器 ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});