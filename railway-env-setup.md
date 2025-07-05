# 🔧 Railway 后端环境变量设置指令

## 📋 前置条件

### 1. 安装 Railway CLI
```bash
npm install -g @railway/cli
```

### 2. 登录 Railway
```bash
railway login
```

### 3. 链接到项目
```bash
# 如果还没有链接项目
railway init

# 或者链接到现有项目
railway link --project your-project-name
```

## 🚀 方法一：通过 Railway CLI 设置（推荐）

### 步骤 1: 检查当前项目状态
```bash
railway status
```

### 步骤 2: 设置 Firebase 环境变量
```bash
# Firebase 项目 ID
railway variables set FIREBASE_PROJECT_ID=your-firebase-project-id

# Firebase 私钥（注意引号）
railway variables set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"

# Firebase 客户端邮箱
railway variables set FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# Firebase 客户端 ID
railway variables set FIREBASE_CLIENT_ID=your-client-id

# Firebase Auth URI
railway variables set FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth

# Firebase Token URI
railway variables set FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Firebase Auth Provider X509 Cert URL
railway variables set FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs

# Firebase Client X509 Cert URL
railway variables set FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com
```

### 步骤 3: 设置 JWT 密钥
```bash
# 生成一个强密码作为 JWT 密钥
railway variables set JWT_SECRET=your-super-secret-jwt-key-here
```

### 步骤 4: 设置 Gemini AI API 密钥
```bash
# Gemini AI API 密钥
railway variables set GEMINI_API_KEY=your-gemini-api-key
```

### 步骤 5: 设置其他可选环境变量
```bash
# Node.js 环境
railway variables set NODE_ENV=production

# 端口（Railway 会自动设置，但可以明确指定）
railway variables set PORT=3000
```

### 步骤 6: 验证环境变量
```bash
# 查看所有环境变量
railway variables

# 查看特定环境变量
railway variables get FIREBASE_PROJECT_ID
```

## 🌐 方法二：通过 Railway Web 控制台设置

### 步骤 1: 访问 Railway Dashboard
1. 打开浏览器访问: https://railway.app/dashboard
2. 登录你的 Railway 账户

### 步骤 2: 选择项目
1. 在项目列表中找到你的项目
2. 点击项目进入详情页面

### 步骤 3: 进入环境变量设置
1. 点击左侧菜单的 "Variables" 标签
2. 或者点击 "Settings" → "Variables"

### 步骤 4: 添加环境变量
点击 "New Variable" 按钮，逐个添加以下变量：

#### Firebase 配置
- **Key**: `FIREBASE_PROJECT_ID`
- **Value**: `your-firebase-project-id`

- **Key**: `FIREBASE_PRIVATE_KEY`
- **Value**: 
```
-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY_HERE
-----END PRIVATE KEY-----
```

- **Key**: `FIREBASE_CLIENT_EMAIL`
- **Value**: `your-service-account@your-project.iam.gserviceaccount.com`

#### JWT 配置
- **Key**: `JWT_SECRET`
- **Value**: `your-super-secret-jwt-key-here`

#### Gemini AI 配置
- **Key**: `GEMINI_API_KEY`
- **Value**: `your-gemini-api-key`

## 🔄 方法三：从本地 .env 文件导入

如果你有本地的 `.env` 文件，可以使用以下脚本自动导入：

```bash
# 运行环境变量设置脚本
./setup-env.sh
```

或者手动导入：

```bash
# 读取 .env 文件并设置环境变量
while IFS='=' read -r key value; do
    if [[ ! $key =~ ^# ]] && [[ -n $key ]]; then
        value=$(echo "$value" | sed 's/^"//;s/"$//')
        echo "设置 $key"
        railway variables set "$key=$value"
    fi
done < backend/.env
```

## ✅ 验证设置

### 1. 检查环境变量
```bash
railway variables
```

### 2. 重新部署
```bash
railway up
```

### 3. 查看日志
```bash
railway logs
```

### 4. 测试健康检查
```bash
# 获取项目 URL
railway domain

# 测试健康检查端点
curl https://your-project-url.railway.app/api/auth/health
```

## 🆘 常见问题解决

### 问题 1: 环境变量未生效
```bash
# 重新部署项目
railway up

# 查看部署日志
railway logs
```

### 问题 2: Firebase 连接失败
- 检查 `FIREBASE_PROJECT_ID` 是否正确
- 确保 `FIREBASE_PRIVATE_KEY` 格式正确（包含换行符）
- 验证 `FIREBASE_CLIENT_EMAIL` 是否正确

### 问题 3: JWT 错误
- 确保 `JWT_SECRET` 足够复杂
- 检查是否包含特殊字符

### 问题 4: Gemini API 错误
- 验证 `GEMINI_API_KEY` 是否有效
- 检查 API 配额是否充足

## 📞 获取帮助

- **Railway 文档**: https://docs.railway.app
- **Railway 支持**: https://railway.app/support
- **查看项目状态**: `railway status`
- **查看详细日志**: `railway logs --follow` 