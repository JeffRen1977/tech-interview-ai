#!/bin/bash

# Railway 项目选择脚本
# 使用方法: ./railway-project-select.sh

echo "🔧 Railway 项目选择脚本"
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
echo "📋 你的 Railway 项目列表："
echo ""

# 获取项目列表
PROJECTS=$(railway list | grep -E "^  [a-zA-Z-]+" | sed 's/^  //')

# 显示项目列表
counter=1
declare -a project_names
while IFS= read -r project; do
    if [ -n "$project" ]; then
        echo "$counter. $project"
        project_names[$counter]=$project
        ((counter++))
    fi
done <<< "$PROJECTS"

echo ""
echo "请选择要连接的项目 (输入数字 1-$((counter-1)))："
read -p "选择项目: " choice

# 验证选择
if [[ ! "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -lt 1 ] || [ "$choice" -ge "$counter" ]; then
    echo "❌ 无效选择，请输入 1 到 $((counter-1)) 之间的数字"
    exit 1
fi

selected_project=${project_names[$choice]}
echo ""
echo "✅ 选择项目: $selected_project"
echo "🔗 正在连接到项目..."

# 连接到选定的项目
railway link --project "$selected_project"

echo ""
echo "📊 项目状态："
railway status

echo ""
echo "🔧 现在你可以运行环境变量设置脚本："
echo "   ./railway-env-import.sh"
echo ""
echo "或者手动设置环境变量："
echo "   railway variables set KEY=VALUE" 