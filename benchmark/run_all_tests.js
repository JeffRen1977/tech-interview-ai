/**
 * 运行所有 AI 分析质量测试的主脚本
 * 用于全面评估 AI Interview Agent 的 AI 分析功能质量
 */

const fs = require('fs');
const path = require('path');

// 导入所有测试模块
const behavioralTest = require('./test_behavioral_analysis');
const codingTest = require('./test_coding_analysis');
const resumeTest = require('./test_resume_analysis');
const jdMatchingTest = require('./test_jd_matching');
const coverLetterTest = require('./test_cover_letter');
const systemDesignTest = require('./test_system_design_analysis');
const wrongQuestionTest = require('./test_wrong_question_feedback');
const videoFeedbackTest = require('./test_video_feedback');

// 测试配置
const TEST_CONFIG = {
    // 可以在这里配置全局测试参数
    timeout: 300000, // 5分钟总超时
    retryCount: 2,   // 失败重试次数
    parallel: false  // 是否并行运行（建议设为false，避免API限制）
};

// 所有测试模块
const TEST_MODULES = [
    {
        name: '行为面试分析',
        module: behavioralTest,
        description: '测试行为面试回答的AI分析质量'
    },
    {
        name: '编码面试分析',
        module: codingTest,
        description: '测试代码解答的AI分析质量'
    },
    {
        name: '简历优化分析',
        module: resumeTest,
        description: '测试简历分析和优化建议的质量'
    },
    {
        name: 'JD匹配度分析',
        module: jdMatchingTest,
        description: '测试简历与职位描述匹配度分析的质量'
    },
    {
        name: '求职信生成',
        module: coverLetterTest,
        description: '测试个性化求职信生成的质量'
    },
    {
        name: '系统设计分析',
        module: systemDesignTest,
        description: '测试系统设计解答的AI分析质量'
    },
    {
        name: '错题讲解反馈',
        module: wrongQuestionTest,
        description: '测试错题AI讲解和重做计划的质量'
    },
    {
        name: '视频面试反馈',
        module: videoFeedbackTest,
        description: '测试视频面试表现分析的质量'
    }
];

// 运行单个测试模块
async function runTestModule(testModule) {
    console.log(`\n🚀 开始运行: ${testModule.name}`);
    console.log(`📝 描述: ${testModule.description}`);
    console.log('=' * 60);
    
    try {
        const results = [];
        
        // 运行该模块的所有测试用例
        for (const testCase of testModule.module.TEST_CASES) {
            const result = await testModule.module.runTest(testCase);
            results.push(result);
        }
        
        // 计算该模块的统计信息
        const successfulTests = results.filter(r => r.success);
        const averageScore = successfulTests.length > 0 
            ? successfulTests.reduce((sum, r) => sum + r.score, 0) / successfulTests.length 
            : 0;
        
        const moduleSummary = {
            moduleName: testModule.name,
            totalTests: results.length,
            successfulTests: successfulTests.length,
            averageScore: averageScore.toFixed(1),
            results: results
        };
        
        console.log(`\n✅ ${testModule.name} 测试完成`);
        console.log(`   总测试数: ${results.length}`);
        console.log(`   成功测试数: ${successfulTests.length}`);
        console.log(`   平均分数: ${averageScore.toFixed(1)}/100`);
        
        return moduleSummary;
        
    } catch (error) {
        console.log(`❌ ${testModule.name} 测试失败:`, error.message);
        return {
            moduleName: testModule.name,
            totalTests: 0,
            successfulTests: 0,
            averageScore: '0.0',
            error: error.message,
            results: []
        };
    }
}

// 生成综合报告
function generateComprehensiveReport(allResults) {
    console.log('\n📋 综合测试报告');
    console.log('=' * 80);
    
    const successfulModules = allResults.filter(r => !r.error);
    const failedModules = allResults.filter(r => r.error);
    
    // 计算总体统计
    const totalTests = allResults.reduce((sum, r) => sum + r.totalTests, 0);
    const totalSuccessfulTests = allResults.reduce((sum, r) => sum + r.successfulTests, 0);
    const overallAverageScore = successfulModules.length > 0 
        ? successfulModules.reduce((sum, r) => sum + parseFloat(r.averageScore), 0) / successfulModules.length 
        : 0;
    
    console.log(`📊 总体统计:`);
    console.log(`   测试模块数: ${allResults.length}`);
    console.log(`   成功模块数: ${successfulModules.length}`);
    console.log(`   失败模块数: ${failedModules.length}`);
    console.log(`   总测试数: ${totalTests}`);
    console.log(`   成功测试数: ${totalSuccessfulTests}`);
    console.log(`   总体平均分数: ${overallAverageScore.toFixed(1)}/100`);
    
    // 各模块详细结果
    console.log(`\n📈 各模块详细结果:`);
    allResults.forEach(result => {
        const status = result.error ? '❌' : '✅';
        const score = result.error ? ' (失败)' : ` (${result.averageScore}/100)`;
        console.log(`${status} ${result.moduleName}${score}`);
        
        if (result.error) {
            console.log(`   错误: ${result.error}`);
        } else {
            console.log(`   测试数: ${result.totalTests}, 成功: ${result.successfulTests}`);
        }
    });
    
    // 质量等级分布
    const gradeDistribution = {
        '优秀 (90-100)': 0,
        '良好 (80-89)': 0,
        '一般 (70-79)': 0,
        '较差 (60-69)': 0,
        '失败 (0-59)': 0
    };
    
    successfulModules.forEach(module => {
        const score = parseFloat(module.averageScore);
        if (score >= 90) gradeDistribution['优秀 (90-100)']++;
        else if (score >= 80) gradeDistribution['良好 (80-89)']++;
        else if (score >= 70) gradeDistribution['一般 (70-79)']++;
        else if (score >= 60) gradeDistribution['较差 (60-69)']++;
        else gradeDistribution['失败 (0-59)']++;
    });
    
    console.log(`\n🏆 质量等级分布:`);
    Object.entries(gradeDistribution).forEach(([grade, count]) => {
        if (count > 0) {
            console.log(`   ${grade}: ${count} 个模块`);
        }
    });
    
    // 生成建议
    console.log(`\n💡 改进建议:`);
    if (overallAverageScore >= 85) {
        console.log('   🎉 AI分析质量整体表现优秀！');
    } else if (overallAverageScore >= 75) {
        console.log('   👍 AI分析质量良好，有改进空间');
    } else if (overallAverageScore >= 65) {
        console.log('   ⚠️  AI分析质量一般，需要重点关注');
    } else {
        console.log('   🚨 AI分析质量较差，需要立即改进');
    }
    
    if (failedModules.length > 0) {
        console.log(`   🔧 需要修复 ${failedModules.length} 个失败的测试模块`);
    }
    
    return {
        timestamp: new Date().toISOString(),
        summary: {
            totalModules: allResults.length,
            successfulModules: successfulModules.length,
            failedModules: failedModules.length,
            totalTests,
            totalSuccessfulTests,
            overallAverageScore: overallAverageScore.toFixed(1)
        },
        gradeDistribution,
        moduleResults: allResults
    };
}

// 保存综合报告
function saveComprehensiveReport(report) {
    const reportPath = `benchmark/results/comprehensive_report_${Date.now()}.json`;
    
    // 确保results目录存在
    if (!fs.existsSync('benchmark/results')) {
        fs.mkdirSync('benchmark/results', { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 综合报告已保存到: ${reportPath}`);
    
    return reportPath;
}

// 主函数
async function main() {
    console.log('🎯 AI Interview Agent - 全面质量测试');
    console.log('=' * 80);
    console.log('📅 开始时间:', new Date().toLocaleString());
    console.log('🔧 测试配置:', JSON.stringify(TEST_CONFIG, null, 2));
    
    const startTime = Date.now();
    const allResults = [];
    
    // 顺序运行所有测试模块
    for (const testModule of TEST_MODULES) {
        const result = await runTestModule(testModule);
        allResults.push(result);
        
        // 添加延迟，避免API限制
        if (TEST_CONFIG.parallel === false) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);
    
    console.log(`\n⏱️  测试完成，总耗时: ${duration} 秒`);
    
    // 生成综合报告
    const report = generateComprehensiveReport(allResults);
    
    // 保存报告
    const reportPath = saveComprehensiveReport(report);
    
    console.log('\n🎉 所有测试完成！');
    console.log(`📊 详细报告: ${reportPath}`);
    console.log(`📅 结束时间: ${new Date().toLocaleString()}`);
}

// 运行测试
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 测试运行失败:', error);
        process.exit(1);
    });
}

module.exports = {
    runAllTests: main,
    TEST_MODULES,
    TEST_CONFIG
}; 