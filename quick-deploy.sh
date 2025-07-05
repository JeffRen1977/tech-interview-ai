#!/bin/bash

# Railway 快速部署脚本
# 使用方法: ./quick-deploy.sh

echo "🚀 Railway 快速部署..."

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

echo "🚀 部署中..."
railway up

echo "✅ 部署完成！"
railway status 