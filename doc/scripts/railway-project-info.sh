#!/bin/bash

# Railway 项目信息查看脚本
# 使用方法: ./railway-project-info.sh

echo "🔍 Railway 项目信息查看"
echo "================================"

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

echo ""
echo "👤 当前用户: $(railway whoami)"
echo ""

echo "📋 所有项目列表："
echo "=================="
railway list

echo ""
echo "🔗 当前连接的项目："
echo "=================="
if railway status &> /dev/null; then
    railway status
    echo ""
    echo "📊 项目环境变量："
    echo "=================="
    railway variables
    echo ""
    echo "🌐 项目域名："
    echo "============"
    railway domain
else
    echo "❌ 未连接到任何项目"
    echo ""
    echo "💡 使用以下命令连接项目："
    echo "   ./railway-project-select.sh"
    echo "   或者"
    echo "   railway link --project <项目名称>"
fi

echo ""
echo "📋 可用命令："
echo "============"
echo "🔗 选择项目: ./railway-project-select.sh"
echo "📝 导入环境变量: ./railway-env-import.sh"
echo "🚀 部署项目: railway up"
echo "📊 查看日志: railway logs"
echo "🌐 打开控制台: railway open" 