#!/bin/bash

# Heroku 部署脚本
# 使用方法: ./deploy-heroku.sh

echo "🚀 Heroku 部署脚本..."

# 检查 Heroku CLI
if ! command -v heroku &> /dev/null; then
    echo "📦 安装 Heroku CLI..."
    echo "请访问: https://devcenter.heroku.com/articles/heroku-cli"
    echo "或运行: brew tap heroku/brew && brew install heroku"
    exit 1
fi

echo "🔐 检查 Heroku 登录..."
if ! heroku auth:whoami &> /dev/null; then
    echo "🔑 登录 Heroku..."
    heroku login
fi

echo "📝 创建 Heroku 应用..."
APP_NAME="ai-interview-coach-$(date +%s)"
heroku create $APP_NAME

echo "🔧 设置构建包..."
heroku buildpacks:set heroku/nodejs

echo "📋 创建 Procfile..."
cat > Procfile << EOF
web: cd backend && npm start
EOF

echo "🔑 设置环境变量..."
echo "请手动设置以下环境变量:"
echo "heroku config:set FIREBASE_PROJECT_ID=your-project-id"
echo "heroku config:set FIREBASE_PRIVATE_KEY='your-private-key'"
echo "heroku config:set FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com"
echo "heroku config:set JWT_SECRET=your-jwt-secret"
echo "heroku config:set GEMINI_API_KEY=your-gemini-api-key"

echo "🚀 部署到 Heroku..."
git add .
git commit -m "Deploy to Heroku"
git push heroku main

echo "✅ 部署完成！"
echo "🌐 应用地址: https://$APP_NAME.herokuapp.com"
echo ""
echo "⚠️  注意: Heroku 免费计划已停止，需要付费计划" 