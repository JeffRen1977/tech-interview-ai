# 系统设计面试功能文档

## 概述

系统设计面试功能是一个专门针对AI/ML系统设计的模拟面试模块，集成了白板绘图、语音输入和AI智能反馈功能。该功能专注于机器学习、计算机视觉、自然语言处理、强化学习等现代AI技术领域的系统设计挑战。

## 主要功能

### 1. 智能题目生成
- **AI/ML主题覆盖**：机器学习系统、计算机视觉、NLP、强化学习、深度学习、AI基础设施、推荐系统、自动驾驶系统
- **难度分级**：初级、中级、高级三个难度等级
- **多语言支持**：中文和英文
- **动态生成**：基于Gemini API实时生成符合要求的系统设计题目

### 2. 交互式白板
- **实时绘图**：支持鼠标绘制系统架构图
- **颜色选择**：多种颜色选择器
- **画笔粗细**：可调节画笔粗细（细、中、粗）
- **撤销功能**：支持撤销操作
- **清空画布**：一键清空重新开始
- **数据保存**：自动保存绘图数据用于AI分析

### 3. 语音输入系统
- **实时录音**：支持麦克风录音功能
- **语音转录**：集成语音识别API（可扩展）
- **文本同步**：转录结果自动同步到文本输入框
- **多模态输入**：支持语音+文本混合输入

### 4. AI智能评估
- **多维度评分**：
  - 系统设计能力
  - 技术深度
  - 沟通表达
  - 创新思维
  - 可扩展性
  - 可靠性
- **实时反馈**：提交后立即获得详细反馈
- **改进建议**：提供具体的改进方向和建议
- **最终报告**：面试结束后生成综合评估报告

### 5. 用户历史管理
- **历史记录**：自动保存所有面试记录
- **统计分析**：提供面试数据统计和分析
- **搜索过滤**：支持按类型、主题、关键词搜索
- **详细查看**：可查看每次面试的详细报告

## 技术架构

### 前端技术栈
- **React 18**：用户界面框架
- **Tailwind CSS**：样式框架
- **Canvas API**：白板绘图功能
- **MediaRecorder API**：语音录制功能
- **Lucide React**：图标库

### 后端技术栈
- **Node.js + Express**：服务器框架
- **Firebase Firestore**：数据存储
- **Gemini API**：AI智能生成和评估
- **express-fileupload**：文件上传处理

### 核心组件

#### 前端组件
1. **SystemDesignInterview.jsx**：主面试组件
2. **UserHistory.jsx**：用户历史记录组件
3. **MockInterview.jsx**：面试类型选择组件

#### 后端控制器
1. **startSystemDesignInterview**：开始面试
2. **submitSystemDesignSolution**：提交解答
3. **getSystemDesignFeedback**：获取反馈
4. **endSystemDesignInterview**：结束面试
5. **transcribeAudio**：音频转录
6. **getUserHistory**：获取用户历史

## API接口

### 系统设计面试接口

#### 1. 开始面试
```
POST /api/questions/system-design-interview/start
Content-Type: application/json

{
  "topic": "machine-learning",
  "difficulty": "medium",
  "language": "chinese"
}
```

#### 2. 提交解答
```
POST /api/questions/system-design-interview/submit
Content-Type: application/json

{
  "sessionId": "session_id",
  "voiceInput": "用户语音输入文本",
  "whiteboardData": [...],
  "timeSpent": 3600
}
```

#### 3. 获取反馈
```
POST /api/questions/system-design-interview/feedback
Content-Type: application/json

{
  "sessionId": "session_id"
}
```

#### 4. 结束面试
```
POST /api/questions/system-design-interview/end
Content-Type: application/json

{
  "sessionId": "session_id"
}
```

#### 5. 音频转录
```
POST /api/questions/transcribe-audio
Content-Type: multipart/form-data

audio: [音频文件]
```

#### 6. 用户历史
```
GET /api/questions/user-history
```

## 使用流程

### 1. 开始面试
1. 选择面试类型为"系统设计面试"
2. 选择主题领域（机器学习、计算机视觉等）
3. 选择难度等级
4. 选择语言
5. 点击"开始面试"

### 2. 进行面试
1. **阅读题目**：仔细阅读系统设计题目和要求
2. **使用白板**：在白板上绘制系统架构图
3. **语音输入**：使用语音功能描述设计思路
4. **文本补充**：在文本框中补充详细说明
5. **提交解答**：点击提交获得实时反馈

### 3. 查看反馈
1. **实时反馈**：提交后立即查看AI评估结果
2. **详细分析**：查看各维度的评分和详细反馈
3. **改进建议**：根据建议优化设计

### 4. 结束面试
1. 点击"结束面试"生成最终报告
2. 查看综合评估结果
3. 保存到历史记录

### 5. 历史管理
1. 在侧边栏选择"面试历史"
2. 查看所有面试记录
3. 使用搜索和过滤功能
4. 查看详细报告

## 数据模型

### 面试会话数据
```javascript
{
  sessionId: "unique_session_id",
  questionData: {
    questionId: "unique_question_id",
    title: "题目标题",
    description: "题目描述",
    requirements: ["要求1", "要求2"],
    constraints: "系统约束",
    expectedComponents: ["组件1", "组件2"],
    hints: ["提示1", "提示2"],
    evaluationCriteria: {...},
    difficulty: "medium",
    topic: "machine-learning",
    estimatedTime: 60,
    category: "ai-ml-system-design"
  },
  startTime: "2024-01-01T00:00:00Z",
  status: "active|completed",
  voiceInputs: ["语音输入1", "语音输入2"],
  whiteboardData: [...],
  feedback: [...],
  timeSpent: 3600,
  endTime: "2024-01-01T01:00:00Z",
  finalReport: {...}
}
```

### 用户历史数据
```javascript
{
  sessionId: "unique_session_id",
  interviewType: "system-design",
  questionData: {...},
  finalReport: {...},
  startTime: "2024-01-01T00:00:00Z",
  endTime: "2024-01-01T01:00:00Z",
  timeSpent: 3600,
  topic: "machine-learning",
  difficulty: "medium"
}
```

## 扩展功能

### 1. 语音识别集成
当前使用模拟转录，可集成以下服务：
- Google Speech-to-Text
- Azure Speech Services
- AWS Transcribe
- 百度语音识别

### 2. 高级白板功能
- 图形模板库
- 协作绘图
- 导出功能
- 历史版本

### 3. 个性化推荐
- 基于历史表现推荐题目
- 个性化学习路径
- 智能难度调整

### 4. 实时协作
- 多用户同时面试
- 实时反馈同步
- 面试官模式

## 部署说明

### 环境要求
- Node.js 16+
- Firebase项目配置
- Gemini API密钥

### 安装步骤
1. 安装后端依赖：`cd backend && npm install`
2. 安装前端依赖：`cd frontend && npm install`
3. 配置环境变量
4. 启动后端服务：`npm start`
5. 启动前端服务：`npm run dev`

### 环境变量配置
```env
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

## 性能优化

### 1. 前端优化
- 白板数据压缩
- 语音数据分块上传
- 组件懒加载
- 缓存策略

### 2. 后端优化
- 数据库索引优化
- API响应缓存
- 文件上传限制
- 并发控制

## 安全考虑

### 1. 数据安全
- 用户数据加密存储
- API访问控制
- 文件上传验证
- 敏感信息脱敏

### 2. 隐私保护
- 用户同意机制
- 数据删除功能
- 匿名化处理
- 合规性检查

## 故障排除

### 常见问题
1. **白板无法绘制**：检查Canvas API支持
2. **语音录制失败**：检查麦克风权限
3. **API调用失败**：检查网络连接和API密钥
4. **数据保存失败**：检查Firebase配置

### 调试工具
- 浏览器开发者工具
- 后端日志监控
- Firebase控制台
- API测试工具

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 基础系统设计面试功能
- 白板和语音输入
- AI智能评估
- 用户历史管理

## 贡献指南

欢迎提交Issue和Pull Request来改进这个功能。请确保：
1. 遵循代码规范
2. 添加适当的测试
3. 更新相关文档
4. 测试所有功能

## 许可证

MIT License 