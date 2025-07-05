/**
 * 视频面试反馈质量测试脚本
 * 测试 API: POST /api/learn-feedback/video-feedback
 * 功能: 分析视频面试表现
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// 测试配置
const CONFIG = {
    baseURL: 'http://localhost:5000/api',
    timeout: 60000, // 视频处理需要更长时间
    headers: {
        'Authorization': 'Bearer YOUR_TEST_TOKEN' // 需要替换为有效的测试 token
    }
};

// 测试用例数据
const TEST_CASES = [
    {
        name: "标准视频面试测试",
        input: {
            videoPath: "benchmark/test_videos/sample_interview.mp4", // 需要准备测试视频文件
            expectedFields: ['success', 'transcript', 'languageFeedback', 'logicFeedback', 'bodyLanguageFeedback'],
            qualityCriteria: {
                hasTranscript: true,
                hasLanguageFeedback: true,
                hasLogicFeedback: true,
                hasBodyLanguageFeedback: true
            }
        }
    },
    {
        name: "简短视频测试",
        input: {
            videoPath: "benchmark/test_videos/short_response.mp4",
            expectedFields: ['success', 'transcript', 'languageFeedback', 'logicFeedback', 'bodyLanguageFeedback'],
            qualityCriteria: {
                hasTranscript: true,
                hasLanguageFeedback: true,
                hasLogicFeedback: true,
                hasBodyLanguageFeedback: true
            }
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
    
    // 1. 检查必需字段完整性 (30分)
    const requiredFields = ['transcript', 'languageFeedback', 'logicFeedback', 'bodyLanguageFeedback'];
    let fieldScore = 0;
    
    requiredFields.forEach(field => {
        if (response[field] !== undefined) {
            fieldScore += 7;
        } else {
            feedback.push(`缺少必需字段: ${field}`);
        }
    });
    
    score += fieldScore;
    
    // 2. 检查转录质量 (25分)
    if (response.transcript) {
        const transcriptText = response.transcript;
        
        // 检查转录长度
        if (transcriptText.length > 50) {
            score += 15;
        } else if (transcriptText.length > 20) {
            score += 10;
        } else {
            feedback.push("转录内容过短");
        }
        
        // 检查转录的完整性（是否包含完整的句子）
        const sentences = transcriptText.split(/[.!?。！？]/).filter(s => s.trim().length > 0);
        if (sentences.length > 0) {
            score += 10;
        } else {
            feedback.push("转录内容不完整");
        }
    }
    
    // 3. 检查语言表达反馈 (20分)
    if (response.languageFeedback) {
        const languageFeedback = response.languageFeedback;
        
        if (languageFeedback.length > 30) {
            score += 20;
        } else if (languageFeedback.length > 15) {
            score += 15;
        } else {
            feedback.push("语言表达反馈内容过短");
        }
    }
    
    // 4. 检查逻辑结构反馈 (15分)
    if (response.logicFeedback) {
        const logicFeedback = response.logicFeedback;
        
        if (logicFeedback.length > 30) {
            score += 15;
        } else if (logicFeedback.length > 15) {
            score += 10;
        } else {
            feedback.push("逻辑结构反馈内容过短");
        }
    }
    
    // 5. 检查肢体语言反馈 (10分)
    if (response.bodyLanguageFeedback) {
        const bodyLanguageFeedback = response.bodyLanguageFeedback;
        
        if (bodyLanguageFeedback.length > 20) {
            score += 10;
        } else if (bodyLanguageFeedback.length > 10) {
            score += 5;
        } else {
            feedback.push("肢体语言反馈内容过短");
        }
    }
    
    return { score, feedback };
}

// 运行测试
async function runTest(testCase) {
    console.log(`\n=== 运行测试: ${testCase.name} ===`);
    
    try {
        // 检查测试视频文件是否存在
        if (!fs.existsSync(testCase.input.videoPath)) {
            console.log('⚠️  测试视频文件不存在，跳过此测试');
            return {
                testCase: testCase.name,
                success: false,
                error: '测试视频文件不存在',
                skipped: true
            };
        }
        
        // 准备表单数据
        const formData = new FormData();
        formData.append('video', fs.createReadStream(testCase.input.videoPath));
        
        // 设置multipart请求头
        const config = {
            ...CONFIG,
            headers: {
                ...CONFIG.headers,
                ...formData.getHeaders()
            }
        };
        
        const response = await axios.post('/learn-feedback/video-feedback', formData, config);
        
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

// 创建测试视频目录
function createTestVideoDirectory() {
    const testVideoDir = 'benchmark/test_videos';
    if (!fs.existsSync(testVideoDir)) {
        fs.mkdirSync(testVideoDir, { recursive: true });
        console.log(`📁 创建测试视频目录: ${testVideoDir}`);
        console.log('💡 请在此目录中放置测试视频文件');
    }
}

// 主函数
async function main() {
    console.log('🚀 开始视频面试反馈质量测试');
    console.log('=' * 50);
    
    // 创建测试视频目录
    createTestVideoDirectory();
    
    const results = [];
    
    for (const testCase of TEST_CASES) {
        const result = await runTest(testCase);
        results.push(result);
    }
    
    // 生成测试报告
    console.log('\n📋 测试报告');
    console.log('=' * 50);
    
    const successfulTests = results.filter(r => r.success && !r.skipped);
    const skippedTests = results.filter(r => r.skipped);
    const averageScore = successfulTests.length > 0 
        ? successfulTests.reduce((sum, r) => sum + r.score, 0) / successfulTests.length 
        : 0;
    
    console.log(`总测试数: ${results.length}`);
    console.log(`成功测试数: ${successfulTests.length}`);
    console.log(`跳过测试数: ${skippedTests.length}`);
    console.log(`平均分数: ${averageScore.toFixed(1)}/100`);
    
    results.forEach(result => {
        const status = result.skipped ? '⏭️' : (result.success ? '✅' : '❌');
        const score = result.success && !result.skipped ? ` (${result.score}/100 - ${result.grade})` : '';
        const skipNote = result.skipped ? ' (跳过)' : '';
        console.log(`${status} ${result.testCase}${score}${skipNote}`);
    });
    
    // 保存结果到文件
    const report = {
        timestamp: new Date().toISOString(),
        testType: 'video_feedback',
        results,
        summary: {
            totalTests: results.length,
            successfulTests: successfulTests.length,
            skippedTests: skippedTests.length,
            averageScore: averageScore.toFixed(1)
        }
    };
    
    // 确保results目录存在
    if (!fs.existsSync('benchmark/results')) {
        fs.mkdirSync('benchmark/results', { recursive: true });
    }
    
    fs.writeFileSync(
        `benchmark/results/video_feedback_${Date.now()}.json`,
        JSON.stringify(report, null, 2)
    );
    
    console.log('\n💾 测试结果已保存到 benchmark/results/ 目录');
    console.log('\n📝 注意事项:');
    console.log('- 视频反馈测试需要实际的视频文件');
    console.log('- 请在 benchmark/test_videos/ 目录中放置测试视频');
    console.log('- 支持的视频格式: MP4, AVI, MOV 等');
}

// 运行测试
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { runTest, assessQuality, TEST_CASES }; 