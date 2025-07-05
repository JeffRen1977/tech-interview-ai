/**
 * 系统设计面试分析质量测试脚本
 * 测试 API: POST /api/questions/submit-system-design-solution
 * 功能: 分析系统设计解答，评估技术深度
 */

const axios = require('axios');

// 测试配置
const CONFIG = {
    baseURL: 'http://localhost:5000/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TEST_TOKEN' // 需要替换为有效的测试 token
    }
};

// 测试用例数据
const TEST_CASES = [
    {
        name: "完整系统设计解答测试",
        input: {
            sessionId: "test_session_001",
            voiceInput: "我设计了一个推荐系统，使用协同过滤算法，包含用户行为数据收集、特征工程、模型训练和推荐生成四个模块。系统采用微服务架构，使用Redis缓存热门推荐，MySQL存储用户数据，Kafka处理实时数据流。",
            whiteboardData: {
                components: [
                    { name: "数据收集层", type: "service", connections: ["特征工程层"] },
                    { name: "特征工程层", type: "service", connections: ["模型训练层"] },
                    { name: "模型训练层", type: "service", connections: ["推荐生成层"] },
                    { name: "推荐生成层", type: "service", connections: ["API网关"] },
                    { name: "Redis缓存", type: "cache", connections: ["推荐生成层"] },
                    { name: "MySQL数据库", type: "database", connections: ["数据收集层"] },
                    { name: "Kafka消息队列", type: "queue", connections: ["数据收集层", "特征工程层"] }
                ]
            },
            timeSpent: 1800
        },
        expectedFields: ['feedback'],
        qualityCriteria: {
            hasSystemDesign: true,
            hasTechnicalDepth: true,
            hasCommunication: true,
            hasInnovation: true,
            hasScalability: true,
            hasReliability: true,
            hasScore: true
        }
    },
    {
        name: "基础系统设计解答测试",
        input: {
            sessionId: "test_session_002",
            voiceInput: "我设计了一个简单的聊天系统，有用户管理、消息存储和实时通信功能。使用WebSocket实现实时通信，MySQL存储用户和消息数据。",
            whiteboardData: {
                components: [
                    { name: "用户管理", type: "service", connections: ["数据库"] },
                    { name: "消息存储", type: "service", connections: ["数据库"] },
                    { name: "实时通信", type: "service", connections: ["用户管理", "消息存储"] },
                    { name: "MySQL数据库", type: "database", connections: ["用户管理", "消息存储"] }
                ]
            },
            timeSpent: 900
        },
        expectedFields: ['feedback'],
        qualityCriteria: {
            hasSystemDesign: true,
            hasTechnicalDepth: true,
            hasCommunication: true,
            hasInnovation: true,
            hasScalability: true,
            hasReliability: true,
            hasScore: true
        }
    },
    {
        name: "不完整系统设计解答测试",
        input: {
            sessionId: "test_session_003",
            voiceInput: "我设计了一个系统，但是还没有想清楚具体的架构。",
            whiteboardData: null,
            timeSpent: 300
        },
        expectedFields: ['feedback'],
        qualityCriteria: {
            hasSystemDesign: true,
            hasTechnicalDepth: true,
            hasCommunication: true,
            hasInnovation: true,
            hasScalability: true,
            hasReliability: true,
            hasScore: true
        }
    }
];

// 质量评估函数
function assessQuality(response, testCase) {
    let score = 0;
    const feedback = [];
    
    // 检查响应格式
    if (!response.feedback) {
        return { score: 0, feedback: ["响应格式错误：缺少feedback字段"] };
    }
    
    const feedbackData = response.feedback;
    
    // 1. 检查必需字段完整性 (25分)
    const requiredFields = ['systemDesign', 'technicalDepth', 'communication', 'innovation', 'scalability', 'reliability', 'score'];
    let fieldScore = 0;
    
    requiredFields.forEach(field => {
        if (feedbackData[field] !== undefined) {
            fieldScore += 3;
        } else {
            feedback.push(`缺少必需字段: ${field}`);
        }
    });
    
    score += fieldScore;
    
    // 2. 检查评分合理性 (20分)
    if (feedbackData.score !== undefined) {
        if (feedbackData.score >= 0 && feedbackData.score <= 100) {
            score += 20;
        } else {
            feedback.push("评分超出合理范围(0-100)");
        }
    }
    
    // 3. 检查评价等级合理性 (15分)
    const validGrades = ['excellent', 'good', 'fair', 'poor'];
    const gradeFields = ['systemDesign', 'technicalDepth', 'communication', 'innovation', 'scalability', 'reliability'];
    
    let gradeScore = 0;
    gradeFields.forEach(field => {
        if (feedbackData[field] && validGrades.includes(feedbackData[field].toLowerCase())) {
            gradeScore += 2;
        } else if (feedbackData[field]) {
            feedback.push(`${field}字段的值不在预期范围内`);
        }
    });
    
    score += gradeScore;
    
    // 4. 检查详细反馈质量 (20分)
    if (feedbackData.detailedFeedback) {
        const detailLength = feedbackData.detailedFeedback.length;
        if (detailLength > 100) score += 10;
        else if (detailLength > 50) score += 5;
        else feedback.push("详细反馈内容过短");
        
        // 检查是否包含具体建议
        if (feedbackData.suggestions && Array.isArray(feedbackData.suggestions) && feedbackData.suggestions.length > 0) {
            score += 10;
        } else {
            feedback.push("缺少具体建议");
        }
    } else {
        feedback.push("缺少详细反馈");
    }
    
    // 5. 检查与系统设计内容的相关性 (20分)
    const voiceInput = testCase.input.voiceInput.toLowerCase();
    const whiteboardData = testCase.input.whiteboardData;
    const feedbackText = JSON.stringify(feedbackData).toLowerCase();
    
    // 检查是否提到了系统设计中的关键概念
    const systemKeywords = ['系统', '架构', '服务', '数据库', '缓存', '队列', '微服务', '分布式'];
    let systemRelevance = 0;
    
    systemKeywords.forEach(keyword => {
        if (voiceInput.includes(keyword) && feedbackText.includes(keyword)) {
            systemRelevance += 2;
        }
    });
    
    // 检查是否提到了白板数据中的组件
    if (whiteboardData && whiteboardData.components) {
        whiteboardData.components.forEach(component => {
            if (feedbackText.includes(component.name.toLowerCase()) || 
                feedbackText.includes(component.type.toLowerCase())) {
                systemRelevance += 1;
            }
        });
    }
    
    score += Math.min(systemRelevance, 20);
    
    if (systemRelevance < 8) {
        feedback.push("反馈与系统设计内容相关性不足");
    }
    
    return { score, feedback };
}

// 运行测试
async function runTest(testCase) {
    console.log(`\n=== 运行测试: ${testCase.name} ===`);
    
    try {
        const response = await axios.post('/questions/submit-system-design-solution', testCase.input, CONFIG);
        
        console.log('✅ API 调用成功');
        console.log('响应状态:', response.status);
        
        // 质量评估
        const quality = assessQuality(response.data, testCase);
        
        console.log('📊 质量评估结果:');
        console.log(`   总分: ${quality.score}/100`);
        console.log(`   等级: ${getGrade(quality.score)}`);
        
        if (quality.feedback.length > 0) {
            console.log('   反馈:');
            quality.feedback.forEach(fb => console.log(`   - ${fb}`));
        }
        
        return {
            testCase: testCase.name,
            success: true,
            score: quality.score,
            grade: getGrade(quality.score),
            feedback: quality.feedback
        };
        
    } catch (error) {
        console.log('❌ 测试失败:', error.message);
        return {
            testCase: testCase.name,
            success: false,
            error: error.message
        };
    }
}

// 获取等级
function getGrade(score) {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '一般';
    if (score >= 60) return '较差';
    return '失败';
}

// 主函数
async function main() {
    console.log('🚀 开始系统设计面试分析质量测试');
    console.log('=' * 50);
    
    const results = [];
    
    for (const testCase of TEST_CASES) {
        const result = await runTest(testCase);
        results.push(result);
    }
    
    // 生成测试报告
    console.log('\n📋 测试报告');
    console.log('=' * 50);
    
    const successfulTests = results.filter(r => r.success);
    const averageScore = successfulTests.length > 0 
        ? successfulTests.reduce((sum, r) => sum + r.score, 0) / successfulTests.length 
        : 0;
    
    console.log(`总测试数: ${results.length}`);
    console.log(`成功测试数: ${successfulTests.length}`);
    console.log(`平均分数: ${averageScore.toFixed(1)}/100`);
    
    results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        const score = result.success ? ` (${result.score}/100 - ${result.grade})` : '';
        console.log(`${status} ${result.testCase}${score}`);
    });
    
    // 保存结果到文件
    const fs = require('fs');
    const report = {
        timestamp: new Date().toISOString(),
        testType: 'system_design_analysis',
        results,
        summary: {
            totalTests: results.length,
            successfulTests: successfulTests.length,
            averageScore: averageScore.toFixed(1)
        }
    };
    
    // 确保results目录存在
    if (!fs.existsSync('benchmark/results')) {
        fs.mkdirSync('benchmark/results', { recursive: true });
    }
    
    fs.writeFileSync(
        `benchmark/results/system_design_analysis_${Date.now()}.json`,
        JSON.stringify(report, null, 2)
    );
    
    console.log('\n💾 测试结果已保存到 benchmark/results/ 目录');
}

// 运行测试
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { runTest, assessQuality, TEST_CASES }; 