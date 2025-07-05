#!/bin/bash

# Vercel 后端部署脚本
# 使用方法: ./deploy-vercel-backend.sh

echo "🚀 Vercel 后端部署脚本..."

# 检查 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装 Vercel CLI..."
    npm install -g vercel
fi

echo "🔐 检查 Vercel 登录..."
if ! vercel whoami &> /dev/null; then
    echo "🔑 登录 Vercel..."
    vercel login
fi

echo "📋 创建 Vercel 配置文件..."
cat > vercel-backend.json << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "backend/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
EOF

echo "🔧 创建 Vercel 项目配置..."
cat > .vercelignore << EOF
frontend/
node_modules/
.env
*.log
EOF

echo "🚀 部署到 Vercel..."
vercel --prod

echo "✅ 部署完成！"
echo ""
echo "🔧 设置环境变量:"
echo "vercel env add FIREBASE_PROJECT_ID"
echo "vercel env add FIREBASE_PRIVATE_KEY"
echo "vercel env add FIREBASE_CLIENT_EMAIL"
echo "vercel env add JWT_SECRET"
echo "vercel env add GEMINI_API_KEY"
echo ""
echo "🌐 Vercel 提供免费计划，每月 100GB 带宽" 