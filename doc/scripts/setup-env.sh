#!/bin/bash

# Railway 环境变量设置脚本
# 使用方法: ./setup-env.sh

echo "🔧 Railway 环境变量设置向导..."

# 检查 Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ 错误: 请先安装 Railway CLI"
    echo "运行: npm install -g @railway/cli"
    exit 1
fi

# 检查项目链接
if ! railway status &> /dev/null; then
    echo "❌ 错误: 请先链接到 Railway 项目"
    echo "运行: ./quick-deploy.sh 或 railway init"
    exit 1
fi

echo "📝 设置环境变量..."

# 读取本地 .env 文件（如果存在）
if [ -f "backend/.env" ]; then
    echo "📖 从 backend/.env 文件读取环境变量..."
    
    # 读取并设置环境变量
    while IFS='=' read -r key value; do
        # 跳过注释和空行
        if [[ ! $key =~ ^# ]] && [[ -n $key ]]; then
            # 移除引号
            value=$(echo "$value" | sed 's/^"//;s/"$//')
            echo "🔧 设置 $key"
            railway variables set "$key=$value"
        fi
    done < backend/.env
    
    echo "✅ 环境变量设置完成！"
else
    echo "⚠️  找不到 backend/.env 文件"
    echo ""
    echo "📋 请手动设置以下必需的环境变量:"
    echo ""
    echo "🔑 Firebase 配置:"
    echo "  railway variables set FIREBASE_PROJECT_ID=your-project-id"
    echo "  railway variables set FIREBASE_PRIVATE_KEY='your-private-key'"
    echo "  railway variables set FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com"
    echo ""
    echo "🔐 JWT 配置:"
    echo "  railway variables set JWT_SECRET=your-jwt-secret"
    echo ""
    echo "🤖 Gemini AI 配置:"
    echo "  railway variables set GEMINI_API_KEY=your-gemini-api-key"
    echo ""
    echo "📖 详细配置请参考: backend/env.example"
fi

echo ""
echo "🔍 查看当前环境变量:"
railway variables

echo ""
echo "✅ 环境变量设置完成！" 