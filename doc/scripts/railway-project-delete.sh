#!/bin/bash

# Railway 项目删除脚本
# 使用方法: ./railway-project-delete.sh

echo "🗑️ Railway 项目删除脚本"
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
echo "⚠️  警告：删除项目是不可逆操作！"
echo "请选择要删除的项目 (输入数字 1-$((counter-1)))："
read -p "选择项目: " choice

# 验证选择
if [[ ! "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -lt 1 ] || [ "$choice" -ge "$counter" ]; then
    echo "❌ 无效选择，请输入 1 到 $((counter-1)) 之间的数字"
    exit 1
fi

selected_project=${project_names[$choice]}
echo ""
echo "🗑️  准备删除项目: $selected_project"
echo ""
echo "⚠️  确认删除？"
echo "   项目名称: $selected_project"
echo "   此操作不可逆！"
echo ""
read -p "请输入项目名称确认删除: " confirm_name

if [ "$confirm_name" != "$selected_project" ]; then
    echo "❌ 项目名称不匹配，取消删除"
    exit 1
fi

echo ""
echo "🔗 连接到项目..."
railway link --project "$selected_project"

echo ""
echo "📊 项目信息："
railway status

echo ""
echo "🗑️  开始删除项目..."
echo "💡 注意：CLI 可能不支持直接删除项目"
echo "🌐 请访问 Railway 控制台手动删除："
echo "   https://railway.app/dashboard"
echo ""
echo "📋 删除步骤："
echo "1. 打开上面的链接"
echo "2. 选择项目: $selected_project"
echo "3. 点击 'Settings'"
echo "4. 滚动到底部 'Danger Zone'"
echo "5. 点击 'Delete Project'"
echo "6. 输入项目名称确认删除"

echo ""
echo "🔗 直接打开项目页面："
railway open 