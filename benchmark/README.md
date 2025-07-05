# AI Interview Agent - Quality Benchmark Suite

## 概述

本 benchmark 套件用于评估 AI Interview Agent 后端系统中所有 AI 分析功能的质量。系统的核心价值在于提供个性化的面试分析、简历优化和学习反馈，因此对 AI 生成内容的质量评估至关重要。

## 核心 AI 分析功能

### 1. 行为面试分析 (Behavioral Interview Analysis)
- **功能**: 分析用户行为面试回答，提供 STAR 框架指导
- **API**: `POST /api/behavioral/analyze`
- **文件**: `backend/controllers/behavioralController.js` → `analyzeAnswer`
- **评估重点**: 
  - 回答结构分析（STAR 框架）
  - 优点识别
  - 改进建议的具体性
  - 示例改进的实用性
  - 评分的合理性

### 2. 编码面试分析 (Coding Interview Analysis)
- **功能**: 分析用户代码解答，提供技术反馈
- **API**: `POST /api/questions/submit-coding-solution`
- **文件**: `backend/controllers/questionController.js` → `submitCodingSolution`
- **评估重点**:
  - 代码正确性判断
  - 效率分析
  - 代码质量评估
  - 问题解决能力评价
  - 沟通能力反馈

### 3. 系统设计面试分析 (System Design Interview Analysis)
- **功能**: 分析系统设计解答，评估技术深度
- **API**: `POST /api/questions/submit-system-design-solution`
- **文件**: `backend/controllers/questionController.js` → `submitSystemDesignSolution`
- **评估重点**:
  - 技术深度评估
  - 创新性分析
  - 可扩展性考虑
  - 可靠性设计
  - 架构分析质量

### 4. 简历优化分析 (Resume Optimization)
- **功能**: 分析简历并提供优化建议
- **API**: `POST /api/resume/analyze`
- **文件**: `backend/controllers/resumeController.js` → `analyzeResume`
- **评估重点**:
  - 整体评估的准确性
  - 优化建议的具体性
  - 技能匹配分析
  - 经验改进建议
  - 格式建议的实用性

### 5. JD 匹配度分析 (Job Description Matching)
- **功能**: 分析简历与职位描述的匹配度
- **API**: `POST /api/resume/jd-matching`
- **文件**: `backend/controllers/resumeController.js` → `assessJDMatching`
- **评估重点**:
  - 匹配分数的合理性
  - 分类匹配分析
  - 缺失技能识别
  - 项目建议的相关性
  - 强化建议的可行性

### 6. 求职信生成 (Cover Letter Generation)
- **功能**: 生成个性化求职信
- **API**: `POST /api/resume/cover-letter`
- **文件**: `backend/controllers/resumeController.js` → `generateCoverLetter`
- **评估重点**:
  - 个性化程度
  - 与职位描述的匹配度
  - 语言表达的专业性
  - 关键亮点的突出性
  - 定制化说明的准确性

### 7. 错题讲解与学习反馈 (Wrong Question Feedback)
- **功能**: 提供错题 AI 讲解和重做计划
- **API**: `POST /api/wrong-questions/:id/ai-feedback`
- **文件**: `backend/controllers/wrongQuestionController.js` → `getAIExplanationAndRedoPlan`
- **评估重点**:
  - 解释的清晰度
  - 教学方法的有效性
  - 重做计划的步骤性
  - 知识点的覆盖度

### 8. 视频面试反馈 (Video Interview Feedback)
- **功能**: 分析视频面试表现
- **API**: `POST /api/learn-feedback/video-feedback`
- **文件**: `backend/controllers/wrongQuestionController.js` → `videoInterviewFeedback`
- **评估重点**:
  - 语音转录准确性
  - 语言表达分析
  - 逻辑结构评估
  - 肢体语言反馈

## 质量评估标准

### 通用评估维度
1. **响应完整性**: AI 是否返回了所有必需的字段
2. **JSON 格式正确性**: 响应是否为有效的 JSON 格式
3. **内容相关性**: 反馈是否与输入内容相关
4. **具体性**: 建议是否具体且可操作
5. **专业性**: 语言表达是否专业且符合面试场景

### 评分标准
- **优秀 (90-100)**: 反馈全面、具体、专业，提供可操作的改进建议
- **良好 (80-89)**: 反馈基本完整，建议有一定实用性
- **一般 (70-79)**: 反馈基本正确但不够具体
- **较差 (60-69)**: 反馈存在明显问题或不够相关
- **失败 (0-59)**: 响应格式错误或内容完全不相关

## 测试脚本说明

每个测试脚本包含：
1. **测试用例构造**: 准备典型的输入数据
2. **API 调用**: 调用对应的后端接口
3. **响应验证**: 检查响应格式和内容质量
4. **质量评分**: 根据评估标准给出分数
5. **结果记录**: 保存测试结果和评估报告

## 使用方法

1. 确保后端服务正在运行
2. 设置正确的环境变量（GEMINI_API_KEY 等）
3. 运行对应的测试脚本：
   ```bash
   node benchmark/test_behavioral_analysis.js
   node benchmark/test_coding_analysis.js
   # ... 其他测试脚本
   ```

## 持续改进

- 定期更新测试用例以覆盖更多场景
- 根据用户反馈调整评估标准
- 监控 AI 模型性能变化
- 优化提示词以提高输出质量 