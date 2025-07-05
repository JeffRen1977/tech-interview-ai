/**
 * 编码面试分析质量测试脚本
 * 测试 API: POST /api/questions/submit-coding-solution
 * 功能: 分析用户代码解答，提供技术反馈
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
        name: "正确解答测试",
        input: {
            sessionId: "test_session_001",
            solution: `
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}
            `,
            approach: "使用哈希表优化查找，时间复杂度O(n)，空间复杂度O(n)",
            timeSpent: 15
        },
        expectedFields: ['feedback'],
        qualityCriteria: {
            hasCorrectness: true,
            hasEfficiency: true,
            hasCodeQuality: true,
            hasProblemSolving: true,
            hasCommunication: true,
            hasScore: true
        }
    },
    {
        name: "错误解答测试",
        input: {
            sessionId: "test_session_002",
            solution: `
function twoSum(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    return [];
}
            `,
            approach: "暴力解法，双重循环",
            timeSpent: 25
        },
        expectedFields: ['feedback'],
        qualityCriteria: {
            hasCorrectness: true,
            hasEfficiency: true,
            hasCodeQuality: true,
            hasProblemSolving: true,
            hasCommunication: true,
            hasScore: true
        }
    },
    {
        name: "不完整解答测试",
        input: {
            sessionId: "test_session_003",
            solution: `
function twoSum(nums, target) {
    // 这里需要实现
    return [];
}
            `,
            approach: "还没有完成",
            timeSpent: 5
        },
        expectedFields: ['feedback'],
        qualityCriteria: {
            hasCorrectness: true,
            hasEfficiency: true,
            hasCodeQuality: true,
            hasProblemSolving: true,
            hasCommunication: true,
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
    const requiredFields = ['correctness', 'efficiency', 'codeQuality', 'problemSolving', 'communication', 'score'];
    let fieldScore = 0;
    
    requiredFields.forEach(field => {
        if (feedbackData[field] !== undefined) {
            fieldScore += 4;
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
    const gradeFields = ['correctness', 'efficiency', 'codeQuality', 'problemSolving', 'communication'];
    
    let gradeScore = 0;
    gradeFields.forEach(field => {
        if (feedbackData[field] && validGrades.includes(feedbackData[field].toLowerCase())) {
            gradeScore += 3;
        } else if (feedbackData[field]) {
            feedback.push(`${field}字段的值不在预期范围内`);
        }
    });
    
    score += gradeScore;
    
    // 4. 检查详细反馈质量 (20分)
    if (feedbackData.detailedFeedback) {
        const detailLength = feedbackData.detailedFeedback.length;
        if (detailLength > 50) score += 10;
        else if (detailLength > 20) score += 5;
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
    
    // 5. 检查与代码的相关性 (20分)
    const solutionText = testCase.input.solution.toLowerCase();
    const feedbackText = JSON.stringify(feedbackData).toLowerCase();
    
    // 检查是否提到了代码中的关键元素
    const codeElements = ['function', 'for', 'if', 'return', 'map', 'array'];
    let relevanceScore = 0;
    
    codeElements.forEach(element => {
        if (solutionText.includes(element) && feedbackText.includes(element)) {
            relevanceScore += 3;
        }
    });
    
    score += Math.min(relevanceScore, 20);
    
    if (relevanceScore < 10) {
        feedback.push("反馈与代码内容相关性不足");
    }
    
    return { score, feedback };
}

// 运行测试
async function runTest(testCase) {
    console.log(`\n=== 运行测试: ${testCase.name} ===`);
    
    try {
        const response = await axios.post('/questions/submit-coding-solution', testCase.input, CONFIG);
        
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
    console.log('🚀 开始编码面试分析质量测试');
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
        testType: 'coding_analysis',
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
        `benchmark/results/coding_analysis_${Date.now()}.json`,
        JSON.stringify(report, null, 2)
    );
    
    console.log('\n💾 测试结果已保存到 benchmark/results/ 目录');
}

// 运行测试
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { runTest, assessQuality, TEST_CASES }; 