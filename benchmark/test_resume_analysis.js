/**
 * 简历分析质量测试脚本
 * 测试 API: POST /api/resume/analyze
 * 功能: 分析简历并提供优化建议
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
        name: "标准软件工程师简历测试",
        input: {
            resumeText: `
张三
软件工程师
电话: 138-0000-0000 | 邮箱: zhangsan@email.com

教育背景:
北京大学 计算机科学与技术 本科 2018-2022

工作经验:
ABC科技有限公司 (2022-至今)
- 负责公司核心产品的后端开发
- 使用Java和Spring Boot开发RESTful API
- 优化数据库查询，提升系统性能30%
- 参与代码审查，确保代码质量

项目经验:
电商平台项目 (2021.09-2022.06)
- 使用React和Node.js开发全栈应用
- 实现用户认证、商品管理、订单处理等功能
- 项目获得校级优秀项目奖

技能:
编程语言: Java, JavaScript, Python
框架: Spring Boot, React, Express.js
数据库: MySQL, MongoDB
工具: Git, Docker, Jenkins
            `,
            jobDescription: `
我们正在寻找一位有经验的软件工程师加入我们的团队。

要求:
- 计算机相关专业本科及以上学历
- 2年以上Java开发经验
- 熟悉Spring Boot框架
- 有数据库设计和优化经验
- 良好的团队协作能力

优先考虑:
- 有全栈开发经验
- 熟悉微服务架构
- 有性能优化经验
            `
        },
        expectedFields: ['success', 'analysis'],
        qualityCriteria: {
            hasOverallAssessment: true,
            hasOptimizationSuggestions: true,
            hasRecommendedModifications: true,
            hasSkillsToHighlight: true,
            hasExperienceImprovements: true,
            hasFormattingSuggestions: true
        }
    },
    {
        name: "应届生简历测试",
        input: {
            resumeText: `
李四
应届毕业生
电话: 139-0000-0000 | 邮箱: lisi@email.com

教育背景:
清华大学 软件工程 本科 2020-2024

实习经验:
XYZ公司 软件开发实习生 (2023.06-2023.09)
- 参与移动应用开发
- 学习使用Flutter框架
- 协助测试和bug修复

项目经验:
校园二手交易平台 (2023.03-2023.06)
- 使用Vue.js和Node.js开发
- 实现用户注册、商品发布、聊天功能
- 获得院级项目竞赛二等奖

技能:
编程语言: JavaScript, Python, Java
框架: Vue.js, Node.js, Flutter
数据库: MySQL
工具: Git, VS Code
            `,
            jobDescription: `
招聘前端开发工程师

要求:
- 计算机相关专业应届毕业生
- 熟悉JavaScript和主流前端框架
- 有项目开发经验
- 学习能力强，有团队合作精神

优先考虑:
- 有移动端开发经验
- 熟悉Vue.js或React
- 有实际项目经验
            `
        },
        expectedFields: ['success', 'analysis'],
        qualityCriteria: {
            hasOverallAssessment: true,
            hasOptimizationSuggestions: true,
            hasRecommendedModifications: true,
            hasSkillsToHighlight: true,
            hasExperienceImprovements: true,
            hasFormattingSuggestions: true
        }
    },
    {
        name: "简短简历测试",
        input: {
            resumeText: `
王五
前端开发
电话: 137-0000-0000

教育: 某大学计算机专业

工作经验:
- 做过一些网站开发
- 会HTML, CSS, JavaScript

技能:
- HTML, CSS, JavaScript
            `,
            jobDescription: `
招聘前端开发工程师

要求:
- 熟悉HTML, CSS, JavaScript
- 有网站开发经验
- 良好的学习能力
            `
        },
        expectedFields: ['success', 'analysis'],
        qualityCriteria: {
            hasOverallAssessment: true,
            hasOptimizationSuggestions: true,
            hasRecommendedModifications: true,
            hasSkillsToHighlight: true,
            hasExperienceImprovements: true,
            hasFormattingSuggestions: true
        }
    }
];

// 质量评估函数
function assessQuality(response, testCase) {
    let score = 0;
    const feedback = [];
    
    // 检查响应格式
    if (!response.success || !response.analysis) {
        return { score: 0, feedback: ["响应格式错误：缺少success或analysis字段"] };
    }
    
    const analysis = response.analysis;
    
    // 1. 检查必需字段完整性 (30分)
    const requiredFields = [
        'overallAssessment', 
        'optimizationSuggestions', 
        'recommendedModifications', 
        'skillsToHighlight', 
        'experienceImprovements', 
        'formattingSuggestions'
    ];
    
    let fieldScore = 0;
    requiredFields.forEach(field => {
        if (analysis[field] !== undefined) {
            fieldScore += 5;
        } else {
            feedback.push(`缺少必需字段: ${field}`);
        }
    });
    
    score += fieldScore;
    
    // 2. 检查数组字段格式 (20分)
    const arrayFields = ['optimizationSuggestions', 'recommendedModifications', 'skillsToHighlight', 'experienceImprovements', 'formattingSuggestions'];
    let arrayScore = 0;
    
    arrayFields.forEach(field => {
        if (Array.isArray(analysis[field])) {
            if (analysis[field].length > 0) {
                arrayScore += 4;
            } else {
                feedback.push(`${field}数组为空`);
            }
        } else {
            feedback.push(`${field}不是数组格式`);
        }
    });
    
    score += arrayScore;
    
    // 3. 检查内容相关性 (25分)
    const resumeText = testCase.input.resumeText.toLowerCase();
    const jobDesc = testCase.input.jobDescription.toLowerCase();
    const analysisText = JSON.stringify(analysis).toLowerCase();
    
    // 检查是否提到了简历中的关键信息
    const resumeKeywords = ['java', 'javascript', 'python', 'spring', 'react', 'vue', 'mysql', 'git'];
    let resumeRelevance = 0;
    
    resumeKeywords.forEach(keyword => {
        if (resumeText.includes(keyword) && analysisText.includes(keyword)) {
            resumeRelevance += 2;
        }
    });
    
    // 检查是否提到了职位描述中的要求
    const jobKeywords = ['经验', '技能', '要求', '优先', '熟悉', '掌握'];
    let jobRelevance = 0;
    
    jobKeywords.forEach(keyword => {
        if (jobDesc.includes(keyword) && analysisText.includes(keyword)) {
            jobRelevance += 2;
        }
    });
    
    score += Math.min(resumeRelevance + jobRelevance, 25);
    
    if (resumeRelevance < 8) {
        feedback.push("分析与简历内容相关性不足");
    }
    if (jobRelevance < 6) {
        feedback.push("分析与职位要求相关性不足");
    }
    
    // 4. 检查建议的具体性 (15分)
    let specificityScore = 0;
    
    // 检查整体评估的长度
    if (analysis.overallAssessment && analysis.overallAssessment.length > 50) {
        specificityScore += 5;
    } else {
        feedback.push("整体评估内容过短");
    }
    
    // 检查建议的具体性
    const hasSpecificSuggestions = arrayFields.some(field => {
        return analysis[field] && analysis[field].some(suggestion => 
            suggestion.length > 20 && (suggestion.includes('可以') || suggestion.includes('建议') || suggestion.includes('应该'))
        );
    });
    
    if (hasSpecificSuggestions) {
        specificityScore += 10;
    } else {
        feedback.push("建议不够具体");
    }
    
    score += specificityScore;
    
    // 5. 检查专业性 (10分)
    const isProfessional = !analysisText.includes('错误') && 
                          !analysisText.includes('失败') && 
                          analysisText.length > 200;
    
    if (isProfessional) {
        score += 10;
    } else {
        feedback.push("分析内容不够专业或过短");
    }
    
    return { score, feedback };
}

// 运行测试
async function runTest(testCase) {
    console.log(`\n=== 运行测试: ${testCase.name} ===`);
    
    try {
        const response = await axios.post('/resume/analyze', testCase.input, CONFIG);
        
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
    console.log('🚀 开始简历分析质量测试');
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
        testType: 'resume_analysis',
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
        `benchmark/results/resume_analysis_${Date.now()}.json`,
        JSON.stringify(report, null, 2)
    );
    
    console.log('\n💾 测试结果已保存到 benchmark/results/ 目录');
}

// 运行测试
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { runTest, assessQuality, TEST_CASES }; 