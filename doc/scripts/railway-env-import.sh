#!/bin/bash

# Railway 环境变量导入脚本
# 从本地 .env 文件导入环境变量到 Railway
# 使用方法: ./railway-env-import.sh

echo "🔧 Railway 环境变量导入脚本"
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

# 检查项目链接
if ! railway status &> /dev/null; then
    echo "❌ 未连接到任何项目"
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
fi

# 检查 .env 文件
ENV_FILE="backend/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ 找不到 $ENV_FILE 文件"
    echo "📝 请先创建 .env 文件并填入实际的环境变量值"
    echo "💡 可以复制 env.example 作为模板："
    echo "   cp backend/env.example backend/.env"
    echo ""
    echo "🔧 然后编辑 backend/.env 文件，填入实际值："
    echo "   - FIREBASE_PROJECT_ID: 你的 Firebase 项目 ID"
    echo "   - FIREBASE_PRIVATE_KEY: 你的 Firebase 私钥"
    echo "   - FIREBASE_CLIENT_EMAIL: 你的 Firebase 服务账号邮箱"
    echo "   - JWT_SECRET: 你的 JWT 密钥"
    echo "   - GEMINI_API_KEY: 你的 Gemini API 密钥"
    exit 1
fi

echo "✅ 找到 $ENV_FILE 文件"
echo "📊 当前项目: $(railway status | grep 'Project:' | sed 's/Project: //')"
echo "🚀 开始导入环境变量到 Railway..."

# 读取 .env 文件并设置环境变量
while IFS='=' read -r key value; do
    # 跳过注释行和空行
    if [[ ! $key =~ ^# ]] && [[ -n $key ]]; then
        # 移除值两端的引号
        value=$(echo "$value" | sed 's/^"//;s/"$//')
        # 移除值两端的单引号
        value=$(echo "$value" | sed "s/^'//;s/'$//")
        
        echo "📝 设置 $key"
        railway variables set "$key=$value"
    fi
done < "$ENV_FILE"

echo ""
echo "✅ 环境变量导入完成！"
echo ""
echo "📋 当前 Railway 环境变量列表："
railway variables

echo ""
echo "🚀 重新部署项目..."
railway up

echo ""
echo "🎉 导入完成！"
echo "🌐 项目地址: $(railway domain)"
echo "📊 查看状态: railway status"
echo "📋 查看日志: railway logs" 