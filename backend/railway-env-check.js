#!/usr/bin/env node

// Railway 环境变量检查脚本
// 直接检查 Railway 平台的环境变量

const { execSync } = require('child_process');

console.log('🚂 Railway 环境变量检查');
console.log('=' .repeat(50));

// 检查 Railway CLI 是否安装
try {
  execSync('railway --version', { stdio: 'pipe' });
} catch (error) {
  console.log('❌ Railway CLI 未安装');
  console.log('请先安装: npm install -g @railway/cli');
  process.exit(1);
}

// 检查是否已登录
try {
  execSync('railway whoami', { stdio: 'pipe' });
} catch (error) {
  console.log('❌ 未登录 Railway');
  console.log('请先运行: railway login');
  process.exit(1);
}

console.log('✅ Railway CLI 已安装并已登录');

// 导出环境变量
let railwayVars = {};
try {
  const output = execSync('railway variables --json', { encoding: 'utf8' });
  railwayVars = JSON.parse(output);
  console.log(`✅ 成功导出 ${Object.keys(railwayVars).length} 个环境变量`);
} catch (error) {
  console.log('❌ 导出环境变量失败:', error.message);
  process.exit(1);
}

// 设置环境变量到 process.env
Object.entries(railwayVars).forEach(([key, value]) => {
  process.env[key] = value;
});

// 运行 Firebase 检查
console.log('\n🔍 运行 Firebase 环境变量检查...\n');

// 导入检查逻辑
const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL', 
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_DATABASE_URL',
  'FIREBASE_STORAGE_BUCKET'
];

const optionalVars = [
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID'
];

let allGood = true;
let missingVars = [];
let formatIssues = [];

// 检查必需变量
console.log('📋 检查必需变量:');
for (const key of requiredVars) {
  const value = process.env[key];
  if (!value) {
    console.log(`❌ 缺少: ${key}`);
    missingVars.push(key);
    allGood = false;
  } else {
    console.log(`✅ ${key}: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
    
    // 检查 PRIVATE_KEY 格式
    if (key === 'FIREBASE_PRIVATE_KEY') {
      if (!value.includes('\\n')) {
        console.log(`⚠️  ${key} 可能没有正确转义为单行（应包含 \\n）`);
        formatIssues.push(`${key}: 缺少 \\n 转义`);
        allGood = false;
      }
      if (value.startsWith('"') || value.endsWith('"') || value.startsWith("'") || value.endsWith("'")) {
        console.log(`⚠️  ${key} 包含多余的引号，请去掉`);
        formatIssues.push(`${key}: 包含多余引号`);
        allGood = false;
      }
      if (value.includes('-----BEGIN PRIVATE KEY-----') && !value.includes('\\n')) {
        console.log(`⚠️  ${key} 看起来是原始格式，需要转换为单行并添加 \\n`);
        formatIssues.push(`${key}: 需要转换为单行格式`);
        allGood = false;
      }
    }
  }
}

// 检查可选变量
console.log('\n📋 检查可选变量:');
for (const key of optionalVars) {
  const value = process.env[key];
  if (!value) {
    console.log(`⚠️  可选: ${key} (未设置)`);
  } else {
    console.log(`✅ ${key}: ${value.substring(0, 30)}${value.length > 30 ? '...' : ''}`);
  }
}

// 检查其他相关变量
console.log('\n📋 检查其他相关变量:');
const otherVars = Object.keys(railwayVars).filter(key => 
  key.includes('FIREBASE') || 
  key.includes('GOOGLE') || 
  key.includes('GEMINI')
);

if (otherVars.length > 0) {
  for (const key of otherVars) {
    if (!requiredVars.includes(key) && !optionalVars.includes(key)) {
      const value = railwayVars[key];
      console.log(`ℹ️  ${key}: ${value ? value.substring(0, 20) + '...' : '(空值)'}`);
    }
  }
} else {
  console.log('ℹ️  没有找到其他 Firebase/Google 相关变量');
}

// 总结
console.log('\n' + '='.repeat(50));
console.log('📊 检查结果:');

if (allGood) {
  console.log('✅ 所有必需的 Firebase 环境变量都已正确设置！');
} else {
  console.log('❌ 发现以下问题:');
  
  if (missingVars.length > 0) {
    console.log(`\n🔴 缺少的变量:`);
    missingVars.forEach(varName => console.log(`   - ${varName}`));
  }
  
  if (formatIssues.length > 0) {
    console.log(`\n🟡 格式问题:`);
    formatIssues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  console.log('\n💡 修复建议:');
  console.log('1. 在 Railway 仪表板中检查变量名称是否正确');
  console.log('2. 确保 FIREBASE_PRIVATE_KEY 是单行格式，包含 \\n 转义');
  console.log('3. 移除 FIREBASE_PRIVATE_KEY 中多余的引号');
  console.log('4. 检查变量值是否完整复制');
  console.log('5. 运行: railway variables 查看所有变量');
}

console.log('\n🔧 常用命令:');
console.log('- 查看所有变量: railway variables');
console.log('- 设置变量: railway variables set FIREBASE_PROJECT_ID=your-project-id');
console.log('- 删除变量: railway variables delete VARIABLE_NAME'); 