#!/bin/bash

# Railway 环境变量检查和导出脚本

echo "🚂 Railway 环境变量检查工具"
echo "================================"

# 检查是否安装了 Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI 未安装"
    echo "请先安装: npm install -g @railway/cli"
    exit 1
fi

# 检查是否已登录
if ! railway whoami &> /dev/null; then
    echo "❌ 未登录 Railway"
    echo "请先运行: railway login"
    exit 1
fi

echo "✅ Railway CLI 已安装并已登录"

# 导出变量到临时文件
echo "📤 导出 Railway 环境变量..."
railway variables --json > railway-vars.json

if [ $? -eq 0 ]; then
    echo "✅ 变量已导出到 railway-vars.json"
else
    echo "❌ 导出失败"
    exit 1
fi

# 显示导出的变量
echo ""
echo "📋 导出的变量列表:"
jq -r 'keys[]' railway-vars.json | sort

echo ""
echo "🔍 运行 Firebase 环境变量检查..."

# 将 JSON 变量转换为环境变量格式并运行检查
node -e "
const fs = require('fs');
const vars = JSON.parse(fs.readFileSync('railway-vars.json', 'utf8'));

// 设置环境变量
Object.entries(vars).forEach(([key, value]) => {
  process.env[key] = value;
});

// 运行检查脚本
require('./check-firebase-env.js');
"

echo ""
echo "🧹 清理临时文件..."
rm railway-vars.json

echo "✅ 检查完成！" 