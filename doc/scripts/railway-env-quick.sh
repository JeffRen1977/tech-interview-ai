#!/bin/bash

# Railway 环境变量快速设置脚本
# 使用方法: ./railway-env-quick.sh

echo "🔧 Railway 环境变量快速设置..."
echo "=================================="

# 检查 Railway CLI
if ! command -v railway &> /dev/null; then
    echo "📦 安装 Railway CLI..."
    npm install -g @railway/cli
fi

# 检查登录
if ! railway whoami &> /dev/null; then
    echo "🔑 登录 Railway..."
    railway login
fi

# 检查项目链接
if ! railway status &> /dev/null; then
    echo "🔗 初始化 Railway 项目..."
    railway init
fi

echo ""
echo "📝 请按照提示输入环境变量值："
echo ""

# Firebase 配置
read -p "🔥 Firebase Project ID: " FIREBASE_PROJECT_ID
read -p "🔑 Firebase Private Key (完整私钥): " FIREBASE_PRIVATE_KEY
read -p "📧 Firebase Client Email: " FIREBASE_CLIENT_EMAIL
read -p "🆔 Firebase Client ID: " FIREBASE_CLIENT_ID

# JWT 配置
read -p "🔐 JWT Secret (强密码): " JWT_SECRET

# Gemini AI 配置
read -p "🤖 Gemini API Key: " GEMINI_API_KEY

echo ""
echo "🚀 正在设置环境变量..."

# 设置 Firebase 环境变量
railway variables set FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID"
railway variables set FIREBASE_PRIVATE_KEY="$FIREBASE_PRIVATE_KEY"
railway variables set FIREBASE_CLIENT_EMAIL="$FIREBASE_CLIENT_EMAIL"
railway variables set FIREBASE_CLIENT_ID="$FIREBASE_CLIENT_ID"
railway variables set FIREBASE_AUTH_URI="https://accounts.google.com/o/oauth2/auth"
railway variables set FIREBASE_TOKEN_URI="https://oauth2.googleapis.com/token"
railway variables set FIREBASE_AUTH_PROVIDER_X509_CERT_URL="https://www.googleapis.com/oauth2/v1/certs"
railway variables set FIREBASE_CLIENT_X509_CERT_URL="https://www.googleapis.com/robot/v1/metadata/x509/$FIREBASE_CLIENT_EMAIL"

# 设置 JWT 密钥
railway variables set JWT_SECRET="$JWT_SECRET"

# 设置 Gemini AI API 密钥
railway variables set GEMINI_API_KEY="$GEMINI_API_KEY"

# 设置其他环境变量
railway variables set NODE_ENV="production"
railway variables set PORT="3000"

echo ""
echo "✅ 环境变量设置完成！"
echo ""
echo "📋 当前环境变量列表："
railway variables

echo ""
echo "🚀 重新部署项目..."
railway up

echo ""
echo "🎉 设置完成！"
echo "🌐 项目地址: $(railway domain)"
echo "📊 查看状态: railway status"
echo "📋 查看日志: railway logs" 