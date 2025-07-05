#!/bin/bash

# Railway 快速部署脚本
# 使用方法: ./deploy-railway.sh

set -e

echo "🚀 开始 Railway 后端部署..."

# 检查是否在正确的目录
if [ ! -f "backend/package.json" ]; then
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

echo "📋 检查项目配置..."
if [ ! -f "railway.json" ] && [ ! -f "nixpacks.toml" ]; then
    echo "❌ 错误: 找不到 railway.json 或 nixpacks.toml 配置文件"
    exit 1
fi

echo "🔍 检查环境变量..."
if [ ! -f "backend/.env" ]; then
    echo "⚠️  警告: 找不到 backend/.env 文件"
    echo "📝 请根据 backend/env.example 创建 .env 文件并配置环境变量"
    echo "💡 或者直接在 Railway 控制台中配置环境变量"
fi

echo "🚀 开始部署..."
railway up

echo "✅ 部署完成！"
echo "🔗 查看部署状态: railway status"
echo "📊 查看日志: railway logs"
echo "🌐 获取域名: railway domain"

# 返回根目录
cd ..

echo "�� Railway 后端部署完成！" 