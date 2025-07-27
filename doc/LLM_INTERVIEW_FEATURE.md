# 大模型面试功能实现文档

## 概述

本项目新增了大模型（LLM）面试功能，为用户提供专业的大语言模型技术面试训练。该功能包含完整的题目管理、AI生成、智能分析等核心特性。

## 功能特性

### 1. 题目分类管理
- **4个主要分类**：
  - LLM Fine-tuning（微调技术）
  - RAG（检索增强生成）
  - LLM Architecture（架构设计）
  - LLM Advanced Topics（高级主题）

- **3个难度等级**：
  - 简单（1题）
  - 中等（3题）
  - 困难（4题）

### 2. 智能题目系统
- **预设题目库**：8个精心设计的高质量LLM面试题
- **AI生成功能**：支持基于用户输入动态生成新的LLM题目
- **分类筛选**：支持按分类、难度、关键词筛选题目
- **详细解答**：每个题目都包含完整的技术解答和设计步骤

### 3. 智能分析系统
- **多维度评估**：技术准确性、实现可行性、技术深度等
- **个性化反馈**：针对用户解答提供具体的改进建议
- **评分系统**：0-100分的综合评分机制
- **学习建议**：提供下一步学习方向和资源推荐

## 技术架构

### 后端实现

#### 1. 数据模型
```javascript
{
  id: "LLM001",
  category: "LLM Fine-tuning",
  title: "多轮对话任务如何微调模型?",
  englishTitle: "How to fine-tune models for multi-turn dialogue tasks?",
  difficulty: "困难",
  description: "设计一个支持多轮对话的LLM微调方案...",
  detailedAnswer: "多轮对话微调需要解决的核心问题包括...",
  tags: ["fine-tuning", "dialogue", "multi-turn"],
  designSteps: ["数据预处理和格式转换", "模型架构选择和优化"],
  keyPoints: ["对话历史长度管理", "角色标识处理"]
}
```

#### 2. API端点
- `GET /api/llm/categories` - 获取题目分类
- `GET /api/llm/questions` - 获取所有题目
- `GET /api/llm/questions/filtered` - 获取筛选后的题目
- `GET /api/llm/questions/:id` - 获取特定题目
- `POST /api/llm/generate` - AI生成新题目
- `POST /api/llm/analyze` - 分析用户解答
- `POST /api/llm/learning-history` - 保存学习历史

#### 3. 核心控制器
- `llmController.js` - 处理所有LLM相关的业务逻辑
- `loadLLMQuestions.js` - 题目数据加载工具

### 前端实现

#### 1. 组件结构
- `LLMInterview.jsx` - 主要的LLM面试组件
- 集成到主应用的侧边栏导航

#### 2. 功能特性
- **响应式设计**：支持桌面和移动端
- **实时筛选**：支持分类、难度、关键词筛选
- **智能分析**：实时AI分析用户解答
- **学习历史**：自动保存学习进度

#### 3. 用户体验
- **直观界面**：清晰的题目列表和详情展示
- **交互反馈**：实时显示分析进度和结果
- **多语言支持**：中英文界面切换

## 题目内容

### LLM Fine-tuning（2题）
1. **多轮对话任务如何微调模型?** - 困难
   - 涵盖数据格式设计、模型架构选择、训练策略等
   
2. **微调后的模型出现能力劣化，灾难性遗忘是怎么回事?** - 中等
   - 分析灾难性遗忘的原因和缓解策略

### RAG（2题）
1. **什么是RAG?** - 简单
   - 介绍RAG的基本概念、工作流程和应用场景
   
2. **RAG有哪些流程，流程里各有什么优化手段?** - 困难
   - 详细分析RAG系统的各个流程环节和优化策略

### LLM Architecture（2题）
1. **大模型LLM的架构介绍?** - 中等
   - 详细介绍Transformer结构、注意力机制等核心组件
   
2. **为什么现在的主流大模型都是 decoder-only 架构?** - 中等
   - 分析decoder-only架构的技术优势和应用场景

### LLM Advanced Topics（2题）
1. **大模型 (LLMs) 推理面** - 困难
   - 设计高性能的大模型推理系统
   
2. **大模型 (LLMs) 强化学习——RLHF及其变种面** - 困难
   - 深入分析RLHF技术，包括PPO、DPO等变种算法

## 部署和使用

### 1. 环境要求
- Node.js 18+
- Firebase项目配置
- Gemini API密钥

### 2. 安装步骤
```bash
# 后端
cd backend
npm install
node utils/loadLLMQuestions.js  # 加载题目数据
npm start

# 前端
cd frontend
npm install
npm run dev
```

### 3. 测试验证
```bash
# 运行API测试
cd backend
node test/test-llm-api.js
```

## 扩展计划

### 1. 功能增强
- [ ] 添加更多LLM题目分类（如多模态、推理等）
- [ ] 支持题目难度自适应调整
- [ ] 增加视频讲解功能
- [ ] 添加题目收藏和笔记功能

### 2. 技术优化
- [ ] 实现题目缓存机制
- [ ] 优化AI分析响应速度
- [ ] 添加批量题目导入功能
- [ ] 支持题目版本管理

### 3. 用户体验
- [ ] 添加学习进度追踪
- [ ] 实现个性化推荐算法
- [ ] 增加社区讨论功能
- [ ] 支持题目分享和协作

## 贡献指南

欢迎提交Issue和Pull Request来改进LLM面试功能：

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

## 许可证

本项目采用MIT许可证，详见LICENSE文件。 