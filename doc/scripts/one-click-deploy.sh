#!/bin/bash

# Railway 一键部署脚本
# 使用方法: ./one-click-deploy.sh

set -e

echo "🎯 Railway 一键部署开始..."
echo "=================================="

# 步骤 1: 检查环境
echo "📋 步骤 1: 检查环境..."
if [ ! -f "railway.json" ] || [ ! -f "nixpacks.toml" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 步骤 2: 安装 Railway CLI
echo "📦 步骤 2: 检查 Railway CLI..."
if ! command -v railway &> /dev/null; then
    echo "📦 安装 Railway CLI..."
    npm install -g @railway/cli
fi

# 步骤 3: 登录 Railway
echo "🔐 步骤 3: 检查 Railway 登录..."
if ! railway whoami &> /dev/null; then
    echo "🔑 登录 Railway..."
    railway login
fi

# 步骤 4: 初始化/链接项目
echo "🔗 步骤 4: 初始化 Railway 项目..."
if ! railway status &> /dev/null; then
    echo "📝 创建新的 Railway 项目..."
    railway init
    echo "✅ 项目创建成功！"
else
    echo "✅ 项目已链接"
fi

# 步骤 5: 设置环境变量
echo "🔧 步骤 5: 设置环境变量..."
if [ -f "backend/.env" ]; then
    echo "📖 从 backend/.env 文件读取环境变量..."
    
    # 读取并设置环境变量
    while IFS='=' read -r key value; do
        # 跳过注释和空行
        if [[ ! $key =~ ^# ]] && [[ -n $key ]]; then
            # 移除引号
            value=$(echo "$value" | sed 's/^"//;s/"$//')
            echo "🔧 设置 $key"
            railway variables set "$key=$value" &> /dev/null || true
        fi
    done < backend/.env
    echo "✅ 环境变量设置完成！"
else
    echo "⚠️  警告: 找不到 backend/.env 文件"
    echo "💡 请手动设置环境变量或创建 backend/.env 文件"
fi

# 步骤 6: 部署
echo "🚀 步骤 6: 部署到 Railway..."
echo "⏳ 部署中，请稍候..."
railway up

# 步骤 7: 显示结果
echo ""
echo "=================================="
echo "🎉 部署完成！"
echo ""
echo "📊 部署状态:"
railway status

echo ""
echo "🌐 项目链接:"
railway open

echo ""
echo "📋 查看日志:"
echo "railway logs"

echo ""
echo "🔧 管理环境变量:"
echo "railway variables"

echo ""
echo "✅ Railway 后端部署成功！"
echo "�� 下一步: 部署前端到 Vercel" 