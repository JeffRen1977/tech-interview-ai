#!/bin/bash

# Railway 修复版部署脚本
# 使用方法: ./deploy-railway-fixed.sh

set -e

echo "🚀 Railway 修复版部署脚本..."
echo "=================================="

# 检查是否在正确的目录
if [ ! -f "railway.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 检查 Railway CLI
if ! command -v railway &> /dev/null; then
    echo "📦 安装 Railway CLI..."
    npm install -g @railway/cli
fi

echo "🔐 检查 Railway 登录..."
if ! railway whoami &> /dev/null; then
    echo "🔑 登录 Railway..."
    railway login
fi

# 检查项目链接
if ! railway status &> /dev/null; then
    echo "🔗 初始化 Railway 项目..."
    railway init
fi

echo "🔧 检查环境变量..."
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

echo "🚀 开始部署..."
echo "⏳ 这可能需要几分钟时间..."

# 尝试部署，如果失败则重试
MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "🔄 尝试部署 (第 $((RETRY_COUNT + 1)) 次)..."
    
    if railway up; then
        echo "✅ 部署成功！"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo "❌ 部署失败，等待 30 秒后重试..."
            sleep 30
        else
            echo "❌ 部署失败，已达到最大重试次数"
            echo ""
            echo "🔧 故障排除建议:"
            echo "1. 检查 Railway 账户是否有足够的配额"
            echo "2. 检查环境变量是否正确设置"
            echo "3. 查看 Railway 日志: railway logs"
            echo "4. 尝试手动部署: railway up --debug"
            exit 1
        fi
    fi
done

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