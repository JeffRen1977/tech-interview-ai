#!/bin/bash

echo "🚀 AI Interview Coach 部署脚本"
echo "================================"

# 检查是否安装了必要的工具
check_dependencies() {
    echo "检查依赖..."
    
    if ! command -v railway &> /dev/null; then
        echo "❌ Railway CLI 未安装"
        echo "请运行: npm install -g @railway/cli"
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        echo "❌ Vercel CLI 未安装"
        echo "请运行: npm install -g vercel"
        exit 1
    fi
    
    echo "✅ 依赖检查完成"
}

# 部署后端
deploy_backend() {
    echo ""
    echo "🔧 部署后端到 Railway..."
    
    cd backend
    
    # 检查是否已登录 Railway
    if ! railway whoami &> /dev/null; then
        echo "请先登录 Railway: railway login"
        exit 1
    fi
    
    # 检查环境变量
    echo "请确保已设置以下环境变量:"
    echo "- FIREBASE_PROJECT_ID"
    echo "- FIREBASE_PRIVATE_KEY"
    echo "- FIREBASE_CLIENT_EMAIL"
    echo "- JWT_SECRET"
    echo "- GEMINI_API_KEY"
    echo "- NODE_ENV=production"
    
    read -p "环境变量已设置? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "请在 Railway Dashboard 中设置环境变量后重试"
        exit 1
    fi
    
    # 部署
    echo "开始部署..."
    railway up
    
    # 获取部署 URL
    BACKEND_URL=$(railway status --json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
    echo "✅ 后端部署完成: $BACKEND_URL"
    
    cd ..
}

# 部署前端
deploy_frontend() {
    echo ""
    echo "🎨 部署前端到 Vercel..."
    
    cd frontend
    
    # 检查是否已登录 Vercel
    if ! vercel whoami &> /dev/null; then
        echo "请先登录 Vercel: vercel login"
        exit 1
    fi
    
    # 设置环境变量
    if [ ! -z "$BACKEND_URL" ]; then
        echo "设置前端环境变量..."
        vercel env add VITE_API_BASE_URL production
        echo "$BACKEND_URL" | vercel env pull .env.local
    fi
    
    # 部署
    echo "开始部署..."
    vercel --prod
    
    cd ..
}

# 主函数
main() {
    check_dependencies
    
    echo ""
    echo "选择部署选项:"
    echo "1) 部署后端 (Railway)"
    echo "2) 部署前端 (Vercel)"
    echo "3) 部署全部"
    echo "4) 退出"
    
    read -p "请选择 (1-4): " choice
    
    case $choice in
        1)
            deploy_backend
            ;;
        2)
            deploy_frontend
            ;;
        3)
            deploy_backend
            deploy_frontend
            ;;
        4)
            echo "退出部署"
            exit 0
            ;;
        *)
            echo "无效选择"
            exit 1
            ;;
    esac
    
    echo ""
    echo "🎉 部署完成!"
    echo "请检查应用是否正常运行"
}

# 运行主函数
main 