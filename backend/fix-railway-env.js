#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// 读取serviceAccountKey.json
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

// 处理私钥 - 将\n转换为实际的换行符
const privateKey = serviceAccount.private_key.replace(/\\n/g, '\n');

console.log('Setting Firebase environment variables on Railway...');

// 设置所有Firebase环境变量
const envVars = {
  'FIREBASE_PROJECT_ID': serviceAccount.project_id,
  'FIREBASE_PRIVATE_KEY': privateKey,
  'FIREBASE_CLIENT_EMAIL': serviceAccount.client_email,
  'FIREBASE_CLIENT_ID': serviceAccount.client_id,
  'FIREBASE_AUTH_URI': serviceAccount.auth_uri,
  'FIREBASE_TOKEN_URI': serviceAccount.token_uri,
  'FIREBASE_AUTH_PROVIDER_X509_CERT_URL': serviceAccount.auth_provider_x509_cert_url,
  'FIREBASE_CLIENT_X509_CERT_URL': serviceAccount.client_x509_cert_url
};

// 设置每个环境变量
Object.entries(envVars).forEach(([key, value]) => {
  try {
    console.log(`Setting ${key}...`);
    execSync(`railway variables --set "${key}=${value}"`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error setting ${key}:`, error.message);
  }
});

console.log('Firebase environment variables set successfully!');
console.log('Railway will automatically redeploy the application.'); 