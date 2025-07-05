# AI Interview Coach 部署指南

本项目包含前端 (Vercel) 和后端 (Railway) 的部署配置。

## 🚀 快速部署

### 后端部署 (Railway)

1. **准备 Firebase 配置**
   - 从 Firebase Console 下载服务账号密钥文件
   - 获取 Gemini API Key

2. **部署到 Railway**
   ```bash
   # 安装 Railway CLI
   npm install -g @railway/cli
   
   # 登录 Railway
   railway login
   
   # 进入后端目录
   cd backend
   
   # 初始化 Railway 项目
   railway init
   
   # 设置环境变量
   railway variables set FIREBASE_PROJECT_ID=your-project-id
   railway variables set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
   railway variables set FIREBASE_CLIENT_EMAIL=your-client-email
   railway variables set JWT_SECRET=your-jwt-secret
   railway variables set GEMINI_API_KEY=your-gemini-api-key
   railway variables set NODE_ENV=production
   
   # 部署
   railway up
   ```

3. **获取后端 URL**
   - 部署完成后，Railway 会提供一个 URL
   - 例如: `https://your-app-name.railway.app`

### 前端部署 (Vercel)

1. **准备环境变量**
   - 将后端 URL 设置为环境变量

2. **部署到 Vercel**
   ```bash
   # 安装 Vercel CLI
   npm install -g vercel
   
   # 进入前端目录
   cd frontend
   
   # 登录 Vercel
   vercel login
   
   # 部署
   vercel --prod
   ```

3. **设置环境变量**
   - 在 Vercel Dashboard 中设置:
   - `VITE_API_BASE_URL`: 你的 Railway 后端 URL

## 🔧 环境变量配置

### 后端环境变量 (Railway)

| 变量名 | 描述 | 示例 |
|--------|------|------|
| `FIREBASE_PROJECT_ID` | Firebase 项目 ID | `your-project-id` |
| `FIREBASE_PRIVATE_KEY` | Firebase 私钥 | `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n` |
| `FIREBASE_CLIENT_EMAIL` | Firebase 客户端邮箱 | `firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com` |
| `JWT_SECRET` | JWT 签名密钥 | `your-secret-key` |
| `GEMINI_API_KEY` | Gemini API 密钥 | `AIzaSyC...` |
| `NODE_ENV` | 环境 | `production` |

### 前端环境变量 (Vercel)

| 变量名 | 描述 | 示例 |
|--------|------|------|
| `VITE_API_BASE_URL` | 后端 API 基础 URL | `https://your-app-name.railway.app` |

## 📋 部署检查清单

### 后端检查
- [ ] Firebase 服务账号配置正确
- [ ] Gemini API Key 有效
- [ ] JWT Secret 已设置
- [ ] 健康检查端点可访问: `/api/auth/health`
- [ ] CORS 配置正确

### 前端检查
- [ ] 环境变量 `VITE_API_BASE_URL` 已设置
- [ ] 构建成功
- [ ] API 请求能正常发送到后端
- [ ] 用户认证功能正常

## 🔍 故障排除

### 常见问题

1. **CORS 错误**
   - 检查后端 CORS 配置
   - 确认前端 URL 在后端允许列表中

2. **环境变量未生效**
   - 重新部署应用
   - 检查变量名是否正确

3. **Firebase 连接失败**
   - 验证服务账号权限
   - 检查项目 ID 是否正确

4. **API 请求失败**
   - 确认后端 URL 正确
   - 检查网络连接

## 📞 支持

如果遇到部署问题，请检查:
1. 环境变量配置
2. 网络连接
3. 服务状态
4. 日志输出 