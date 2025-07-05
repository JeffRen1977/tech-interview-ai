# Railway 后端部署配置指南

## 🚀 部署步骤

### 1. 安装 Railway CLI
```bash
npm install -g @railway/cli
```

### 2. 登录 Railway
```bash
railway login
```

### 3. 初始化项目
```bash
cd backend
railway init
```

### 4. 配置环境变量
在 Railway 控制台中设置以下环境变量：

#### 🔑 必需的环境变量
```bash
# Firebase 配置
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key

# Gemini AI 配置
GEMINI_API_KEY=your-gemini-api-key

# 环境配置
NODE_ENV=production
PORT=3000
```

#### 🔧 可选的环境变量
```bash
# CORS 配置
FRONTEND_URL=https://your-frontend-domain.vercel.app

# 日志级别
LOG_LEVEL=info
```

### 5. 部署到 Railway
```bash
railway up
```

### 6. 设置域名（可选）
```bash
railway domain
```

## 📋 配置文件说明

### railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/auth/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "numReplicas": 1
  }
}
```

### package.json
```json
{
  "name": "ai-coach-server",
  "version": "1.0.0",
  "description": "Backend for AI Interview Coach",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "@google/generative-ai": "^0.2.1",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^17.0.1",
    "express": "^4.18.2",
    "express-fileupload": "^1.5.1",
    "firebase-admin": "^11.11.0",
    "jsonwebtoken": "^9.0.2",
    "multer": "^2.0.1",
    "node-fetch": "^3.3.2"
  }
}
```

## 🔍 健康检查

### 健康检查端点
- **URL**: `/api/auth/health`
- **方法**: GET
- **响应**:
```json
{
  "status": "OK",
  "message": "AI Interview Coach Backend is running",
  "timestamp": "2024-07-05T00:00:00.000Z"
}
```

### 检查部署状态
```bash
# 查看部署日志
railway logs

# 查看服务状态
railway status

# 查看环境变量
railway variables
```

## 🌐 API 端点

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/profile` - 更新用户资料
- `PUT /api/auth/change-password` - 修改密码
- `GET /api/auth/health` - 健康检查

### 面试相关
- `GET /api/questions` - 获取面试题目
- `POST /api/code/analyze` - 代码分析
- `POST /api/system-design/analyze` - 系统设计分析
- `POST /api/behavioral/analyze` - 行为面试分析
- `GET /api/wrong-questions` - 获取错题本
- `GET /api/coach-agent/ability-map` - 获取能力图谱

## 🔧 故障排除

### 常见问题

1. **端口冲突**
   - Railway 会自动分配端口，使用 `process.env.PORT`

2. **环境变量未设置**
   - 检查 Railway 控制台中的环境变量配置

3. **Firebase 连接失败**
   - 确保 Firebase 服务账号配置正确
   - 检查网络连接

4. **健康检查失败**
   - 检查应用是否正常启动
   - 查看部署日志

### 调试命令
```bash
# 查看实时日志
railway logs --follow

# 重启服务
railway service restart

# 查看服务详情
railway service

# 连接到服务
railway connect
```

## 📊 监控和日志

### 日志级别
- `error` - 错误信息
- `warn` - 警告信息
- `info` - 一般信息
- `debug` - 调试信息

### 监控指标
- CPU 使用率
- 内存使用率
- 请求响应时间
- 错误率

## 🔒 安全配置

### CORS 配置
```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://your-frontend-domain.vercel.app',
        'http://localhost:5173'
      ]
    : true,
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 环境变量安全
- 不要在代码中硬编码敏感信息
- 使用 Railway 的环境变量功能
- 定期轮换密钥

## 🚀 自动化部署

### GitHub Actions 集成
```yaml
name: Deploy to Railway
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - uses: railway/deploy@v1
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
```

## 📞 支持

如有问题，请检查：
1. Railway 官方文档
2. 项目日志
3. 环境变量配置
4. 网络连接状态 