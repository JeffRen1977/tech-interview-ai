# 🚀 Railway 环境变量设置指南

## 📋 步骤概览

1. **准备环境变量文件** - 创建并配置 `backend/.env`
2. **安装 Railway CLI** - 安装命令行工具
3. **登录 Railway** - 登录你的账户
4. **导入环境变量** - 从本地文件导入到 Railway
5. **验证设置** - 检查并测试部署

## 🔧 详细步骤

### 步骤 1: 准备环境变量文件

我已经为你创建了 `backend/.env` 文件模板。现在你需要编辑这个文件，填入实际的值：

```bash
# 编辑 .env 文件
nano backend/.env
# 或者使用你喜欢的编辑器
code backend/.env
```

#### 需要填入的值：

**Firebase 配置** (从 Firebase Console 获取):
- `FIREBASE_PROJECT_ID`: 你的 Firebase 项目 ID
- `FIREBASE_PRIVATE_KEY`: 你的 Firebase 私钥 (完整格式)
- `FIREBASE_CLIENT_EMAIL`: 你的 Firebase 服务账号邮箱
- `FIREBASE_CLIENT_ID`: 你的 Firebase 客户端 ID

**JWT 配置**:
- `JWT_SECRET`: 生成一个强密码作为 JWT 密钥

**Gemini AI 配置** (从 Google AI Studio 获取):
- `GEMINI_API_KEY`: 你的 Gemini API 密钥

**其他配置**:
- `FRONTEND_URL`: 你的前端域名 (如果已部署)

### 步骤 2: 运行导入脚本

```bash
# 运行环境变量导入脚本
./railway-env-import.sh
```

这个脚本会：
- 检查 Railway CLI 是否安装
- 提示你登录 Railway
- 初始化或链接到项目
- 从 `backend/.env` 文件导入所有环境变量
- 重新部署项目

### 步骤 3: 手动验证

如果脚本运行成功，你可以手动验证：

```bash
# 查看所有环境变量
railway variables

# 查看项目状态
railway status

# 查看部署日志
railway logs

# 获取项目 URL
railway domain
```

## 🔍 获取配置值的方法

### Firebase 配置获取步骤：

1. **访问 Firebase Console**: https://console.firebase.google.com/
2. **选择你的项目**
3. **进入项目设置**: 点击齿轮图标 → 项目设置
4. **服务账号标签**: 点击 "服务账号" 标签
5. **生成新的私钥**: 点击 "生成新的私钥" 按钮
6. **下载 JSON 文件**: 下载包含所有配置的 JSON 文件
7. **提取配置值**: 从 JSON 文件中提取需要的值

### Gemini API 密钥获取步骤：

1. **访问 Google AI Studio**: https://makersuite.google.com/app/apikey
2. **创建 API 密钥**: 点击 "Create API Key"
3. **复制密钥**: 复制生成的 API 密钥

### JWT 密钥生成：

```bash
# 生成一个强密码
openssl rand -base64 32
# 或者使用在线生成器
```

## 🆘 常见问题解决

### 问题 1: Railway CLI 未安装
```bash
npm install -g @railway/cli
```

### 问题 2: 登录失败
```bash
railway logout
railway login
```

### 问题 3: 项目未链接
```bash
railway init
# 或者
railway link --project your-project-name
```

### 问题 4: 环境变量格式错误
- 确保 `FIREBASE_PRIVATE_KEY` 包含完整的私钥格式
- 确保所有值都正确填写，没有多余的空格

### 问题 5: 部署失败
```bash
# 查看详细日志
railway logs --follow

# 重新部署
railway up
```

## ✅ 验证部署

部署完成后，测试以下端点：

```bash
# 健康检查
curl https://your-project-url.railway.app/api/auth/health

# 应该返回: {"status":"ok","message":"Server is running"}
```

## 📞 获取帮助

- **Railway 文档**: https://docs.railway.app
- **Firebase 文档**: https://firebase.google.com/docs
- **Gemini AI 文档**: https://ai.google.dev/docs

## 🎯 下一步

环境变量设置完成后，你可以：
1. 部署前端到 Vercel
2. 配置 CORS 设置
3. 测试完整的应用功能 