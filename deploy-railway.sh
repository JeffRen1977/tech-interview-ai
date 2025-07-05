#!/bin/bash

# Railway 完整自动化部署脚本
# 使用方法: ./deploy-railway.sh [project-name]

set -e

echo "🚀 开始 Railway 后端自动化部署..."

# 检查是否在正确的目录
if [ ! -f "railway.json" ] || [ ! -f "nixpacks.toml" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 检查 Railway CLI 是否安装
if ! command -v railway &> /dev/null; then
    echo "📦 安装 Railway CLI..."
    npm install -g @railway/cli
fi

echo "🔐 检查 Railway 登录状态..."
if ! railway whoami &> /dev/null; then
    echo "🔑 请先登录 Railway..."
    railway login
fi

# 获取项目名称参数
PROJECT_NAME=${1:-"ai-interview-coach-backend"}

echo "📋 检查项目配置..."
echo "🔧 项目名称: $PROJECT_NAME"

# 检查是否已经链接到项目
if ! railway status &> /dev/null; then
    echo "🔗 链接到 Railway 项目..."
    
    # 尝试链接到现有项目
    if railway link --project "$PROJECT_NAME" &> /dev/null; then
        echo "✅ 成功链接到现有项目: $PROJECT_NAME"
    else
        echo "📝 创建新的 Railway 项目..."
        railway init --name "$PROJECT_NAME"
        echo "✅ 成功创建并链接到新项目: $PROJECT_NAME"
    fi
else
    echo "✅ 项目已链接"
fi

echo "🔍 检查环境变量..."
if [ ! -f "backend/.env" ]; then
    echo "⚠️  警告: 找不到 backend/.env 文件"
    echo "📝 请根据 backend/env.example 创建 .env 文件并配置环境变量"
    echo "💡 或者直接在 Railway 控制台中配置环境变量"
    echo ""
    echo "🔧 必需的环境变量:"
    echo "  - FIREBASE_PROJECT_ID"
    echo "  - FIREBASE_PRIVATE_KEY"
    echo "  - FIREBASE_CLIENT_EMAIL"
    echo "  - JWT_SECRET"
    echo "  - GEMINI_API_KEY"
    echo ""
    echo "📖 详细配置请参考: RAILWAY_DEPLOYMENT.md"
fi

echo "🚀 开始部署..."
echo "⏳ 这可能需要几分钟时间..."

# 部署到 Railway
railway up

echo ""
echo "✅ 部署完成！"
echo ""
echo "📊 查看部署状态:"
railway status

echo ""
echo "📋 查看日志:"
echo "railway logs"

echo ""
echo "🌐 查看项目:"
echo "railway open"

echo ""
echo "🔧 管理环境变量:"
echo "railway variables"

echo ""
echo "🎉 Railway 后端部署成功！"
echo "💡 下一步: 部署前端到 Vercel" 