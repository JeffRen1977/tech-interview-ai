/**
 * 行为面试分析质量测试脚本
 * 测试 API: POST /api/behavioral/analyze
 * 功能: 分析用户行为面试回答，提供 STAR 框架指导
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
        name: "标准 STAR 回答测试",
        input: {
            questionId: "test_001",
            question: "请描述一个你面临挑战并成功解决的经历。",
            userAnswer: "在我上一份工作中，我们团队负责开发一个电商平台。当时面临的主要挑战是系统性能问题，用户反馈页面加载速度很慢。我作为技术负责人，首先分析了性能瓶颈，发现是数据库查询效率低下。我重新设计了数据库索引，优化了查询语句，并实施了缓存策略。最终，页面加载时间从原来的5秒降低到1秒以内，用户满意度显著提升。"
        },
        expectedFields: ['success', 'message'],
        qualityCriteria: {
            hasSTARAnalysis: true,
            hasStrengths: true,
            hasImprovements: true,
            hasExamples: true,
            hasScore: true
        }
    },
    {
        name: "简短回答测试",
        input: {
            questionId: "test_002",
            question: "你如何处理团队冲突？",
            userAnswer: "我会先了解冲突的原因，然后组织大家开会讨论，找到解决方案。"
        },
        expectedFields: ['success', 'message'],
        qualityCriteria: {
            hasSTARAnalysis: true,
            hasStrengths: true,
            hasImprovements: true,
            hasExamples: true,
            hasScore: true
        }
    }
];

// 质量评估函数
function assessQuality(response, testCase) {
    let score = 0;
    const feedback = [];
    
    // 1. 检查响应格式 (20分)
    if (response.success && response.message) {
        score += 20;
    } else {
        feedback.push("响应格式不正确");
    }
    
    // 2. 检查内容完整性 (30分)
    const message = response.message || '';
    const hasSTAR = message.includes('STAR') || message.includes('情境') || message.includes('任务') || message.includes('行动') || message.includes('结果');
    const hasStrengths = message.includes('优点') || message.includes('优势') || message.includes('strength');
    const hasImprovements = message.includes('改进') || message.includes('建议') || message.includes('improvement');
    const hasScore = /\d+分|\d+%|\d+\/\d+/.test(message);
    
    if (hasSTAR) score += 8;
    if (hasStrengths) score += 8;
    if (hasImprovements) score += 8;
    if (hasScore) score += 6;
    
    if (!hasSTAR) feedback.push("缺少STAR框架分析");
    if (!hasStrengths) feedback.push("缺少优点识别");
    if (!hasImprovements) feedback.push("缺少改进建议");
    if (!hasScore) feedback.push("缺少评分");
    
    // 3. 检查内容相关性 (25分)
    const questionKeywords = testCase.input.question.toLowerCase();
    const answerKeywords = testCase.input.userAnswer.toLowerCase();
    const responseText = message.toLowerCase();
    
    const questionRelevance = questionKeywords.split(' ').some(word => 
        word.length > 2 && responseText.includes(word)
    );
    const answerRelevance = answerKeywords.split(' ').some(word => 
        word.length > 3 && responseText.includes(word)
    );
    
    if (questionRelevance) score += 12;
    if (answerRelevance) score += 13;
    
    if (!questionRelevance) feedback.push("回答与问题相关性不足");
    if (!answerRelevance) feedback.push("反馈与用户回答相关性不足");
    
    // 4. 检查具体性 (15分)
    const hasSpecificSuggestions = message.includes('具体') || message.includes('例如') || message.includes('比如');
    const hasActionableAdvice = message.includes('可以') || message.includes('建议') || message.includes('应该');
    
    if (hasSpecificSuggestions) score += 8;
    if (hasActionableAdvice) score += 7;
    
    if (!hasSpecificSuggestions) feedback.push("建议不够具体");
    if (!hasActionableAdvice) feedback.push("缺少可操作的建议");
    
    // 5. 检查专业性 (10分)
    const isProfessional = !message.includes('错误') && !message.includes('失败') && message.length > 100;
    if (isProfessional) score += 10;
    else feedback.push("语言表达不够专业");
    
    return { score, feedback };
}

// 运行测试
async function runTest(testCase) {
    console.log(`\n=== 运行测试: ${testCase.name} ===`);
    
    try {
        const response = await axios.post('/behavioral/analyze', testCase.input, CONFIG);
        
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
    console.log('🚀 开始行为面试分析质量测试');
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
        testType: 'behavioral_analysis',
        results,
        summary: {
            totalTests: results.length,
            successfulTests: successfulTests.length,
            averageScore: averageScore.toFixed(1)
        }
    };
    
    fs.writeFileSync(
        `benchmark/results/behavioral_analysis_${Date.now()}.json`,
        JSON.stringify(report, null, 2)
    );
    
    console.log('\n💾 测试结果已保存到 benchmark/results/ 目录');
}

// 运行测试
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { runTest, assessQuality, TEST_CASES }; 