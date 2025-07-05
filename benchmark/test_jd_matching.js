/**
 * JD匹配度分析质量测试脚本
 * 测试 API: POST /api/resume/jd-matching
 * 功能: 分析简历与职位描述的匹配度
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
        name: "高匹配度测试",
        input: {
            resumeText: `
张三
高级软件工程师
电话: 138-0000-0000 | 邮箱: zhangsan@email.com

工作经验:
ABC科技有限公司 (2020-至今)
- 负责大规模分布式系统的设计和开发
- 使用Java、Spring Boot、微服务架构
- 优化系统性能，提升吞吐量50%
- 带领5人团队完成核心功能开发
- 有丰富的数据库设计和优化经验

技能:
编程语言: Java, Python, JavaScript
框架: Spring Boot, Spring Cloud, React
数据库: MySQL, Redis, MongoDB
云服务: AWS, Docker, Kubernetes
            `,
            jobDescription: `
招聘高级软件工程师

要求:
- 5年以上Java开发经验
- 熟悉Spring Boot和微服务架构
- 有分布式系统设计经验
- 有团队领导经验
- 熟悉MySQL和Redis
- 有性能优化经验

优先考虑:
- 有云服务经验(AWS/Azure/GCP)
- 熟悉Docker和Kubernetes
- 有大规模系统经验
            `
        },
        expectedFields: ['success', 'assessment'],
        qualityCriteria: {
            hasMatchingScore: true,
            hasMatchingAnalysis: true,
            hasMissingSkills: true,
            hasProjectSuggestions: true,
            hasExperienceGaps: true,
            hasReinforcementPoints: true
        }
    },
    {
        name: "中等匹配度测试",
        input: {
            resumeText: `
李四
前端开发工程师
电话: 139-0000-0000 | 邮箱: lisi@email.com

工作经验:
XYZ公司 (2021-至今)
- 负责公司产品的前端开发
- 使用React和Vue.js开发用户界面
- 参与移动端H5页面开发
- 与后端团队协作完成功能开发

技能:
编程语言: JavaScript, TypeScript, HTML, CSS
框架: React, Vue.js, Node.js
工具: Git, Webpack, VS Code
            `,
            jobDescription: `
招聘全栈开发工程师

要求:
- 3年以上前端开发经验
- 熟悉React或Vue.js
- 有Node.js后端开发经验
- 熟悉数据库操作
- 有移动端开发经验

优先考虑:
- 有TypeScript经验
- 熟悉微服务架构
- 有性能优化经验
            `
        },
        expectedFields: ['success', 'assessment'],
        qualityCriteria: {
            hasMatchingScore: true,
            hasMatchingAnalysis: true,
            hasMissingSkills: true,
            hasProjectSuggestions: true,
            hasExperienceGaps: true,
            hasReinforcementPoints: true
        }
    },
    {
        name: "低匹配度测试",
        input: {
            resumeText: `
王五
UI设计师
电话: 137-0000-0000 | 邮箱: wangwu@email.com

工作经验:
设计公司 (2022-至今)
- 负责产品UI设计
- 使用Figma、Sketch等设计工具
- 参与用户研究和交互设计
- 与开发团队协作完成设计实现

技能:
设计工具: Figma, Sketch, Adobe Creative Suite
设计技能: UI设计, 交互设计, 用户研究
            `,
            jobDescription: `
招聘后端开发工程师

要求:
- 3年以上Java或Python开发经验
- 熟悉Spring Boot或Django框架
- 有数据库设计和优化经验
- 熟悉RESTful API设计
- 有微服务架构经验

优先考虑:
- 有云服务经验
- 熟悉Docker和Kubernetes
- 有性能优化经验
            `
        },
        expectedFields: ['success', 'assessment'],
        qualityCriteria: {
            hasMatchingScore: true,
            hasMatchingAnalysis: true,
            hasMissingSkills: true,
            hasProjectSuggestions: true,
            hasExperienceGaps: true,
            hasReinforcementPoints: true
        }
    }
];

// 质量评估函数
function assessQuality(response, testCase) {
    let score = 0;
    const feedback = [];
    
    // 检查响应格式
    if (!response.success || !response.assessment) {
        return { score: 0, feedback: ["响应格式错误：缺少success或assessment字段"] };
    }
    
    const assessment = response.assessment;
    
    // 1. 检查必需字段完整性 (25分)
    const requiredFields = [
        'matchingScore', 
        'matchingAnalysis', 
        'missingSkills', 
        'projectSuggestions', 
        'experienceGaps', 
        'reinforcementPoints'
    ];
    
    let fieldScore = 0;
    requiredFields.forEach(field => {
        if (assessment[field] !== undefined) {
            fieldScore += 4;
        } else {
            feedback.push(`缺少必需字段: ${field}`);
        }
    });
    
    score += fieldScore;
    
    // 2. 检查匹配分数合理性 (20分)
    if (assessment.matchingScore !== undefined) {
        if (assessment.matchingScore >= 0 && assessment.matchingScore <= 100) {
            score += 20;
        } else {
            feedback.push("匹配分数超出合理范围(0-100)");
        }
    }
    
    // 3. 检查匹配分析结构 (20分)
    if (assessment.matchingAnalysis) {
        const analysisFields = ['skills', 'experience', 'education', 'projects'];
        let analysisScore = 0;
        
        analysisFields.forEach(field => {
            if (assessment.matchingAnalysis[field]) {
                if (assessment.matchingAnalysis[field].score !== undefined && 
                    assessment.matchingAnalysis[field].details) {
                    analysisScore += 5;
                } else {
                    feedback.push(`matchingAnalysis.${field}缺少score或details字段`);
                }
            } else {
                feedback.push(`matchingAnalysis缺少${field}字段`);
            }
        });
        
        score += analysisScore;
    } else {
        feedback.push("缺少matchingAnalysis字段");
    }
    
    // 4. 检查数组字段格式 (15分)
    const arrayFields = ['missingSkills', 'projectSuggestions', 'experienceGaps', 'reinforcementPoints'];
    let arrayScore = 0;
    
    arrayFields.forEach(field => {
        if (Array.isArray(assessment[field])) {
            if (assessment[field].length > 0) {
                arrayScore += 3;
            } else {
                feedback.push(`${field}数组为空`);
            }
        } else {
            feedback.push(`${field}不是数组格式`);
        }
    });
    
    score += arrayScore;
    
    // 5. 检查内容相关性 (20分)
    const resumeText = testCase.input.resumeText.toLowerCase();
    const jobDesc = testCase.input.jobDescription.toLowerCase();
    const assessmentText = JSON.stringify(assessment).toLowerCase();
    
    // 检查是否识别了简历中的技能
    const resumeSkills = ['java', 'python', 'javascript', 'react', 'vue', 'mysql', 'redis', 'spring', 'node'];
    let skillRecognition = 0;
    
    resumeSkills.forEach(skill => {
        if (resumeText.includes(skill) && assessmentText.includes(skill)) {
            skillRecognition += 2;
        }
    });
    
    // 检查是否识别了职位要求
    const jobRequirements = ['经验', '技能', '熟悉', '掌握', '要求', '优先'];
    let requirementRecognition = 0;
    
    jobRequirements.forEach(req => {
        if (jobDesc.includes(req) && assessmentText.includes(req)) {
            requirementRecognition += 2;
        }
    });
    
    score += Math.min(skillRecognition + requirementRecognition, 20);
    
    if (skillRecognition < 6) {
        feedback.push("技能识别不够准确");
    }
    if (requirementRecognition < 6) {
        feedback.push("职位要求识别不够准确");
    }
    
    return { score, feedback };
}

// 运行测试
async function runTest(testCase) {
    console.log(`\n=== 运行测试: ${testCase.name} ===`);
    
    try {
        const response = await axios.post('/resume/jd-matching', testCase.input, CONFIG);
        
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
    console.log('🚀 开始JD匹配度分析质量测试');
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
        testType: 'jd_matching',
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
        `benchmark/results/jd_matching_${Date.now()}.json`,
        JSON.stringify(report, null, 2)
    );
    
    console.log('\n💾 测试结果已保存到 benchmark/results/ 目录');
}

// 运行测试
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { runTest, assessQuality, TEST_CASES }; 