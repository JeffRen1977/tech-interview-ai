/**
 * 错题讲解与学习反馈质量测试脚本
 * 测试 API: POST /api/wrong-questions/:id/ai-feedback
 * 功能: 提供错题 AI 讲解和重做计划
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
        name: "算法题错题测试",
        input: {
            questionId: "algo_001",
            question: "什么是快速排序的时间复杂度？",
            userAnswer: "O(n²)",
            correctAnswer: "平均情况下是O(n log n)，最坏情况下是O(n²)",
            type: "算法",
            knowledgePoint: "排序算法时间复杂度"
        },
        expectedFields: ['success', 'explanation', 'redoPlan'],
        qualityCriteria: {
            hasExplanation: true,
            hasRedoPlan: true,
            explanationClarity: true,
            planActionability: true
        }
    },
    {
        name: "系统设计题错题测试",
        input: {
            questionId: "system_001",
            question: "设计一个高并发的消息队列系统，需要考虑哪些关键因素？",
            userAnswer: "需要考虑数据库存储和消息发送",
            correctAnswer: "需要考虑：1. 消息持久化 2. 高可用性 3. 消息顺序保证 4. 重复消息处理 5. 死信队列 6. 监控和告警 7. 水平扩展能力",
            type: "系统设计",
            knowledgePoint: "消息队列系统设计"
        },
        expectedFields: ['success', 'explanation', 'redoPlan'],
        qualityCriteria: {
            hasExplanation: true,
            hasRedoPlan: true,
            explanationClarity: true,
            planActionability: true
        }
    },
    {
        name: "编程语言题错题测试",
        input: {
            questionId: "lang_001",
            question: "JavaScript中，let和var的区别是什么？",
            userAnswer: "let是块级作用域，var是函数作用域",
            correctAnswer: "1. 作用域：let是块级作用域，var是函数作用域 2. 变量提升：var会提升，let不会 3. 重复声明：var允许重复声明，let不允许 4. 暂时性死区：let存在暂时性死区",
            type: "编程语言",
            knowledgePoint: "JavaScript变量声明"
        },
        expectedFields: ['success', 'explanation', 'redoPlan'],
        qualityCriteria: {
            hasExplanation: true,
            hasRedoPlan: true,
            explanationClarity: true,
            planActionability: true
        }
    }
];

// 质量评估函数
function assessQuality(response, testCase) {
    let score = 0;
    const feedback = [];
    
    // 检查响应格式
    if (!response.success) {
        return { score: 0, feedback: ["响应格式错误：缺少success字段"] };
    }
    
    // 1. 检查必需字段完整性 (25分)
    const requiredFields = ['explanation', 'redoPlan'];
    let fieldScore = 0;
    
    requiredFields.forEach(field => {
        if (response[field] !== undefined) {
            fieldScore += 12;
        } else {
            feedback.push(`缺少必需字段: ${field}`);
        }
    });
    
    score += fieldScore;
    
    // 2. 检查解释的清晰度 (30分)
    if (response.explanation) {
        const explanationText = response.explanation;
        
        // 检查长度
        if (explanationText.length > 100) {
            score += 15;
        } else if (explanationText.length > 50) {
            score += 10;
        } else {
            feedback.push("解释内容过短");
        }
        
        // 检查是否包含正确答案的关键信息
        const correctAnswer = testCase.input.correctAnswer.toLowerCase();
        const explanation = explanationText.toLowerCase();
        
        // 提取正确答案中的关键概念
        const keyConcepts = correctAnswer.split(/[,，、]/).map(concept => concept.trim());
        let conceptCoverage = 0;
        
        keyConcepts.forEach(concept => {
            if (concept.length > 2 && explanation.includes(concept)) {
                conceptCoverage += 3;
            }
        });
        
        score += Math.min(conceptCoverage, 15);
        
        if (conceptCoverage < 6) {
            feedback.push("解释未覆盖正确答案的关键概念");
        }
    }
    
    // 3. 检查重做计划的可操作性 (25分)
    if (response.redoPlan && Array.isArray(response.redoPlan)) {
        if (response.redoPlan.length > 0) {
            score += 10;
            
            // 检查计划的步骤性
            let stepQuality = 0;
            response.redoPlan.forEach((step, index) => {
                if (step.length > 10) {
                    stepQuality += 3;
                }
            });
            
            score += Math.min(stepQuality, 15);
            
            if (stepQuality < 9) {
                feedback.push("重做计划步骤不够详细");
            }
        } else {
            feedback.push("重做计划数组为空");
        }
    } else {
        feedback.push("redoPlan不是数组格式");
    }
    
    // 4. 检查与问题的相关性 (20分)
    const questionText = testCase.input.question.toLowerCase();
    const responseText = JSON.stringify(response).toLowerCase();
    
    // 检查是否提到了问题中的关键概念
    const questionKeywords = questionText.split(/[\s,，、？?]/).filter(word => word.length > 2);
    let questionRelevance = 0;
    
    questionKeywords.forEach(keyword => {
        if (responseText.includes(keyword)) {
            questionRelevance += 2;
        }
    });
    
    score += Math.min(questionRelevance, 20);
    
    if (questionRelevance < 8) {
        feedback.push("反馈与问题内容相关性不足");
    }
    
    return { score, feedback };
}

// 运行测试
async function runTest(testCase) {
    console.log(`\n=== 运行测试: ${testCase.name} ===`);
    
    try {
        const response = await axios.post(`/wrong-questions/${testCase.input.questionId}/ai-feedback`, {}, CONFIG);
        
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
    console.log('🚀 开始错题讲解与学习反馈质量测试');
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
        testType: 'wrong_question_feedback',
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
        `benchmark/results/wrong_question_feedback_${Date.now()}.json`,
        JSON.stringify(report, null, 2)
    );
    
    console.log('\n💾 测试结果已保存到 benchmark/results/ 目录');
}

// 运行测试
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { runTest, assessQuality, TEST_CASES }; 