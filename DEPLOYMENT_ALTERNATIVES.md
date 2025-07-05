# 🚀 部署平台选择指南

由于 Railway 免费计划资源限制，这里提供其他优秀的部署平台选择。

## 📊 平台对比

| 平台 | 免费额度 | 优点 | 缺点 | 推荐指数 |
|------|----------|------|------|----------|
| **Railway** | $5/月 | 简单易用，自动部署 | 免费额度有限 | ⭐⭐⭐⭐ |
| **Render** | 750小时/月 | 免费额度大，稳定 | 冷启动较慢 | ⭐⭐⭐⭐⭐ |
| **Vercel** | 100GB带宽/月 | 速度快，全球CDN | 主要针对前端 | ⭐⭐⭐⭐ |
| **Heroku** | 需付费 | 功能强大，生态丰富 | 免费计划已停止 | ⭐⭐⭐ |
| **Netlify** | 100GB带宽/月 | 简单易用 | 主要针对静态网站 | ⭐⭐⭐ |

## 🎯 推荐方案

### 方案一：Render（最推荐）
```bash
./deploy-render.sh
```
**优势：**
- ✅ 每月 750 小时免费额度
- ✅ 支持 Node.js 后端
- ✅ 自动 HTTPS
- ✅ 简单易用
- ✅ 稳定可靠

### 方案二：Railway 付费升级
```bash
./one-click-deploy.sh
```
**优势：**
- ✅ 现有配置无需修改
- ✅ 部署简单快速
- ✅ 功能完整

### 方案三：Vercel 后端
```bash
./deploy-vercel-backend.sh
```
**优势：**
- ✅ 速度快，全球CDN
- ✅ 免费额度充足
- ✅ 与前端同平台

## 🚀 快速开始

### 1. Render 部署（推荐）

```bash
# 运行部署指南
./deploy-render.sh

# 然后按照提示在 Render 控制台操作
```

### 2. Railway 升级

1. 访问 [Railway Dashboard](https://railway.app/dashboard)
2. 选择你的项目
3. 点击 "Upgrade"
4. 选择适合的计划（$5-20/月）
5. 运行 `./one-click-deploy.sh`

### 3. Vercel 部署

```bash
# 部署后端
./deploy-vercel-backend.sh

# 部署前端（在 frontend 目录）
cd frontend
vercel --prod
```

## 🔧 环境变量配置

所有平台都需要设置以下环境变量：

```bash
# Firebase 配置
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key

# Gemini AI 配置
GEMINI_API_KEY=your-gemini-api-key
```

## 💡 建议

1. **开发/测试阶段**: 使用 Render（免费额度充足）
2. **生产环境**: 考虑 Railway 付费计划或 Render 付费计划
3. **预算有限**: Render 免费计划是最佳选择
4. **需要全球CDN**: 考虑 Vercel

## 🆘 遇到问题？

- **Render**: 查看 [Render 文档](https://render.com/docs)
- **Railway**: 查看 [Railway 文档](https://docs.railway.app)
- **Vercel**: 查看 [Vercel 文档](https://vercel.com/docs) 