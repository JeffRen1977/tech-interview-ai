# Railway 环境变量检查工具

这个工具可以帮助你检查和验证 Railway 平台上的 Firebase 环境变量设置。

## 工具说明

### 1. `railway-env-check.js` (推荐)
直接检查 Railway 平台的环境变量，无需手动导出。

**使用方法：**
```bash
cd backend
node railway-env-check.js
```

**功能：**
- 自动检查 Railway CLI 是否安装和登录
- 直接导出并检查 Railway 环境变量
- 验证 Firebase 必需变量的存在和格式
- 提供详细的修复建议

### 2. `check-firebase-env.js`
通用的 Firebase 环境变量检查脚本。

**使用方法：**
```bash
cd backend
# 检查本地 .env 文件
node -r dotenv/config check-firebase-env.js

# 或者从 Railway 导出后检查
railway variables --format json > vars.json
node -e "
const vars = JSON.parse(require('fs').readFileSync('vars.json', 'utf8'));
Object.entries(vars).forEach(([k,v]) => process.env[k] = v);
require('./check-firebase-env.js');
"
```

### 3. `check-railway-env.sh`
Shell 脚本版本，需要安装 `jq` 工具。

**使用方法：**
```bash
cd backend
./check-railway-env.sh
```

## 检查的变量

### 必需变量
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_DATABASE_URL`
- `FIREBASE_STORAGE_BUCKET`

### 可选变量
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

## 常见问题修复

### 1. FIREBASE_PRIVATE_KEY 格式问题
**问题：** 私钥格式不正确
**解决：**
- 确保是单行格式
- 包含 `\n` 转义字符
- 移除多余的引号

**正确格式示例：**
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----
```

### 2. 变量名称错误
**问题：** 变量名不匹配
**解决：** 确保使用正确的变量名（以 `FIREBASE_` 开头）

### 3. 缺少必需变量
**问题：** 某些必需变量未设置
**解决：** 从 Firebase 控制台获取并设置所有必需变量

## Railway CLI 常用命令

```bash
# 查看所有变量
railway variables

# 设置变量
railway variables set FIREBASE_PROJECT_ID=your-project-id

# 删除变量
railway variables delete VARIABLE_NAME

# 导出变量
railway variables --format json > vars.json
```

## 故障排除

1. **Railway CLI 未安装**
   ```bash
   npm install -g @railway/cli
   ```

2. **未登录 Railway**
   ```bash
   railway login
   ```

3. **权限问题**
   ```bash
   chmod +x railway-env-check.js
   chmod +x check-railway-env.sh
   ```

4. **jq 未安装（仅 shell 脚本需要）**
   ```bash
   # macOS
   brew install jq
   
   # Ubuntu/Debian
   sudo apt-get install jq
   ``` 