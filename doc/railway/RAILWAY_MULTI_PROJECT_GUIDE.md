# 🚀 Railway 多项目管理指南

## 📋 你的项目列表

根据查询结果，你有以下 Railway 项目：

1. **grateful-contentment**
2. **believable-possibility** 
3. **valiant-passion**
4. **upbeat-education**
5. **triumphant-communication**

## 🔧 使用步骤

### 步骤 1: 查看项目信息
```bash
./railway-project-info.sh
```
这会显示：
- 所有项目列表
- 当前连接的项目
- 项目状态和环境变量

### 步骤 2: 选择正确的项目
```bash
./railway-project-select.sh
```
这会让你从列表中选择要连接的项目。

### 步骤 3: 配置环境变量
```bash
./railway-env-import.sh
```
这会从 `backend/.env` 文件导入环境变量到选定的项目。

## 🎯 推荐操作流程

### 如果你知道哪个项目是 AI Interview Agent：

1. **直接连接项目**：
```bash
# 假设 "triumphant-communication" 是你的 AI Interview Agent 项目
railway link --project triumphant-communication
```

2. **查看项目状态**：
```bash
railway status
```

3. **导入环境变量**：
```bash
./railway-env-import.sh
```

### 如果你不确定哪个项目：

1. **查看所有项目信息**：
```bash
./railway-project-info.sh
```

2. **选择项目**：
```bash
./railway-project-select.sh
```

3. **导入环境变量**：
```bash
./railway-env-import.sh
```

## 🔍 如何识别正确的项目

### 方法 1: 通过 Railway Web 控制台
```bash
railway open
```
这会打开浏览器，你可以在控制台中查看每个项目的详细信息。

### 方法 2: 查看项目环境变量
```bash
# 连接到项目后
railway variables
```
查看是否已经有相关的环境变量配置。

### 方法 3: 查看项目域名
```bash
railway domain
```
查看项目的域名，可能包含项目相关的信息。

## 🆘 常见问题

### 问题 1: 连接了错误的项目
```bash
# 取消当前连接
railway unlink

# 重新选择项目
./railway-project-select.sh
```

### 问题 2: 想要创建新项目
```bash
# 创建新项目
railway init

# 然后导入环境变量
./railway-env-import.sh
```

### 问题 3: 查看项目日志
```bash
# 查看最新日志
railway logs

# 实时查看日志
railway logs --follow
```

## 📊 项目状态检查

运行以下命令检查项目状态：

```bash
# 检查当前连接的项目
railway status

# 查看环境变量
railway variables

# 查看项目域名
railway domain

# 查看部署状态
railway logs
```

## 🎯 下一步操作

1. **选择正确的项目**
2. **配置环境变量**
3. **部署项目**
4. **测试功能**
5. **配置前端 CORS**

## 💡 建议

- 建议为 AI Interview Agent 项目使用一个容易识别的名称
- 可以在项目描述中添加相关信息
- 定期检查项目状态和环境变量
- 保持环境变量的安全性 