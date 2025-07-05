#!/usr/bin/env node

// 修复 Railway 环境变量脚本
const { execSync } = require('child_process');

console.log('🔧 Railway 环境变量修复工具');
console.log('=' .repeat(50));

// 获取当前变量
let railwayVars = {};
try {
  const output = execSync('railway variables --json', { encoding: 'utf8' });
  railwayVars = JSON.parse(output);
  console.log(`✅ 成功获取 ${Object.keys(railwayVars).length} 个环境变量`);
} catch (error) {
  console.log('❌ 获取环境变量失败:', error.message);
  process.exit(1);
}

// 检查并修复 FIREBASE_PRIVATE_KEY
if (railwayVars.FIREBASE_PRIVATE_KEY) {
  let privateKey = railwayVars.FIREBASE_PRIVATE_KEY;
  
  // 移除多余的引号
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
    console.log('🔧 移除 FIREBASE_PRIVATE_KEY 的多余引号');
    
    try {
      execSync(`railway variables --set "FIREBASE_PRIVATE_KEY=${privateKey}"`, { stdio: 'inherit' });
      console.log('✅ FIREBASE_PRIVATE_KEY 已修复');
    } catch (error) {
      console.log('❌ 修复 FIREBASE_PRIVATE_KEY 失败:', error.message);
    }
  }
}

// 检查缺少的变量
const missingVars = ['FIREBASE_DATABASE_URL', 'FIREBASE_STORAGE_BUCKET'];
const projectId = railwayVars.FIREBASE_PROJECT_ID;

if (projectId) {
  // 移除引号
  const cleanProjectId = projectId.replace(/"/g, '');
  
  console.log('\n📋 设置缺少的变量:');
  
  // 设置 FIREBASE_DATABASE_URL
  if (!railwayVars.FIREBASE_DATABASE_URL) {
    const databaseUrl = `https://${cleanProjectId}-default-rtdb.firebaseio.com`;
    console.log(`🔧 设置 FIREBASE_DATABASE_URL: ${databaseUrl}`);
    
    try {
      execSync(`railway variables --set "FIREBASE_DATABASE_URL=${databaseUrl}"`, { stdio: 'inherit' });
      console.log('✅ FIREBASE_DATABASE_URL 已设置');
    } catch (error) {
      console.log('❌ 设置 FIREBASE_DATABASE_URL 失败:', error.message);
    }
  }
  
  // 设置 FIREBASE_STORAGE_BUCKET
  if (!railwayVars.FIREBASE_STORAGE_BUCKET) {
    const storageBucket = `${cleanProjectId}.appspot.com`;
    console.log(`🔧 设置 FIREBASE_STORAGE_BUCKET: ${storageBucket}`);
    
    try {
      execSync(`railway variables --set "FIREBASE_STORAGE_BUCKET=${storageBucket}"`, { stdio: 'inherit' });
      console.log('✅ FIREBASE_STORAGE_BUCKET 已设置');
    } catch (error) {
      console.log('❌ 设置 FIREBASE_STORAGE_BUCKET 失败:', error.message);
    }
  }
}

console.log('\n✅ 修复完成！');
console.log('💡 建议运行检查脚本验证修复结果:');
console.log('   node railway-env-check.js'); 