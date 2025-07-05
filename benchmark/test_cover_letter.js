/**
 * 求职信生成质量测试脚本
 * 测试 API: POST /api/resume/cover-letter
 * 功能: 生成个性化求职信
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
        name: "标准求职信测试",
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

我们是一家快速发展的科技公司，正在寻找有经验的软件工程师加入我们的团队。

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

我们提供:
- 有竞争力的薪资
- 灵活的工作时间
- 良好的职业发展机会
            `,
            companyName: "创新科技有限公司",
            positionTitle: "高级软件工程师",
            companyCulture: "注重创新、团队合作、持续学习"
        },
        expectedFields: ['success', 'coverLetter'],
        qualityCriteria: {
            hasCoverLetter: true,
            hasKeyHighlights: true,
            hasCustomizationNotes: true
        }
    },
    {
        name: "应届生求职信测试",
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

我们是一家专注于用户体验的互联网公司，正在寻找有潜力的前端开发工程师。

要求:
- 计算机相关专业应届毕业生
- 熟悉JavaScript和主流前端框架
- 有项目开发经验
- 学习能力强，有团队合作精神

优先考虑:
- 有移动端开发经验
- 熟悉Vue.js或React
- 有实际项目经验

我们提供:
- 完善的培训体系
- 导师指导
- 良好的成长环境
            `,
            companyName: "用户体验科技有限公司",
            positionTitle: "前端开发工程师",
            companyCulture: "注重用户体验、创新思维、年轻活力"
        },
        expectedFields: ['success', 'coverLetter'],
        qualityCriteria: {
            hasCoverLetter: true,
            hasKeyHighlights: true,
            hasCustomizationNotes: true
        }
    }
];

// 质量评估函数
function assessQuality(response, testCase) {
    let score = 0;
    const feedback = [];
    
    // 检查响应格式
    if (!response.success || !response.coverLetter) {
        return { score: 0, feedback: ["响应格式错误：缺少success或coverLetter字段"] };
    }
    
    const coverLetter = response.coverLetter;
    
    // 1. 检查必需字段完整性 (25分)
    const requiredFields = ['coverLetter', 'keyHighlights', 'customizationNotes'];
    
    let fieldScore = 0;
    requiredFields.forEach(field => {
        if (coverLetter[field] !== undefined) {
            fieldScore += 8;
        } else {
            feedback.push(`缺少必需字段: ${field}`);
        }
    });
    
    score += fieldScore;
    
    // 2. 检查求职信内容质量 (30分)
    if (coverLetter.coverLetter) {
        const letterText = coverLetter.coverLetter;
        
        // 检查长度
        if (letterText.length > 200) {
            score += 10;
        } else {
            feedback.push("求职信内容过短");
        }
        
        // 检查是否包含公司名称
        if (letterText.toLowerCase().includes(testCase.input.companyName.toLowerCase())) {
            score += 5;
        } else {
            feedback.push("求职信中未提及公司名称");
        }
        
        // 检查是否包含职位名称
        if (letterText.toLowerCase().includes(testCase.input.positionTitle.toLowerCase())) {
            score += 5;
        } else {
            feedback.push("求职信中未提及职位名称");
        }
        
        // 检查是否包含简历中的关键信息
        const resumeKeywords = ['java', 'javascript', 'python', 'spring', 'react', 'vue', 'mysql', '经验'];
        let resumeRelevance = 0;
        
        resumeKeywords.forEach(keyword => {
            if (testCase.input.resumeText.toLowerCase().includes(keyword) && 
                letterText.toLowerCase().includes(keyword)) {
                resumeRelevance += 2;
            }
        });
        
        score += Math.min(resumeRelevance, 10);
        
        if (resumeRelevance < 4) {
            feedback.push("求职信与简历内容关联度不足");
        }
    }
    
    // 3. 检查关键亮点 (20分)
    if (coverLetter.keyHighlights && Array.isArray(coverLetter.keyHighlights)) {
        if (coverLetter.keyHighlights.length > 0) {
            score += 20;
        } else {
            feedback.push("关键亮点数组为空");
        }
    } else {
        feedback.push("keyHighlights不是数组格式");
    }
    
    // 4. 检查定制化说明 (15分)
    if (coverLetter.customizationNotes) {
        const notesText = coverLetter.customizationNotes;
        
        if (notesText.length > 50) {
            score += 15;
        } else {
            feedback.push("定制化说明内容过短");
        }
    } else {
        feedback.push("缺少定制化说明");
    }
    
    // 5. 检查与职位描述的相关性 (10分)
    const jobDesc = testCase.input.jobDescription.toLowerCase();
    const letterText = JSON.stringify(coverLetter).toLowerCase();
    
    const jobKeywords = ['要求', '技能', '经验', '熟悉', '掌握', '优先'];
    let jobRelevance = 0;
    
    jobKeywords.forEach(keyword => {
        if (jobDesc.includes(keyword) && letterText.includes(keyword)) {
            jobRelevance += 2;
        }
    });
    
    score += Math.min(jobRelevance, 10);
    
    if (jobRelevance < 4) {
        feedback.push("求职信与职位要求相关性不足");
    }
    
    return { score, feedback };
}

// 运行测试
async function runTest(testCase) {
    console.log(`\n=== 运行测试: ${testCase.name} ===`);
    
    try {
        const response = await axios.post('/resume/cover-letter', testCase.input, CONFIG);
        
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
    console.log('🚀 开始求职信生成质量测试');
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
        testType: 'cover_letter',
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
        `benchmark/results/cover_letter_${Date.now()}.json`,
        JSON.stringify(report, null, 2)
    );
    
    console.log('\n💾 测试结果已保存到 benchmark/results/ 目录');
}

// 运行测试
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { runTest, assessQuality, TEST_CASES }; 