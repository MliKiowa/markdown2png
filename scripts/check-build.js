#!/usr/bin/env node

/**
 * 简单的发布前检查脚本
 * 验证构建产物是否正确生成
 */

import fs from 'fs';
import path from 'path';

const distDir = './dist';
const requiredFiles = [
  'markdown.js',
  'markdown.d.ts',
  'markdown.js.map'
];

console.log('🔍 检查构建产物...');

// 检查 dist 目录是否存在
if (!fs.existsSync(distDir)) {
  console.error('❌ dist 目录不存在，请先运行 npm run build');
  process.exit(1);
}

// 检查必需文件
const missingFiles = requiredFiles.filter(file => {
  const filePath = path.join(distDir, file);
  return !fs.existsSync(filePath);
});

if (missingFiles.length > 0) {
  console.error('❌ 以下文件缺失:');
  missingFiles.forEach(file => console.error(`   - ${file}`));
  process.exit(1);
}

// 检查 JavaScript 文件是否可以导入
try {
  const jsFile = path.join(distDir, 'markdown.js');
  const content = fs.readFileSync(jsFile, 'utf8');
  
  if (!content.includes('export')) {
    console.error('❌ JavaScript 文件似乎没有正确的导出');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ 无法读取 JavaScript 文件:', error.message);
  process.exit(1);
}

// 检查类型定义文件
try {
  const dtsFile = path.join(distDir, 'markdown.d.ts');
  const content = fs.readFileSync(dtsFile, 'utf8');
  
  if (!content.includes('declare') && !content.includes('export')) {
    console.error('❌ 类型定义文件似乎不正确');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ 无法读取类型定义文件:', error.message);
  process.exit(1);
}

console.log('✅ 所有构建产物检查通过！');
console.log('📦 准备就绪，可以发布到 NPM');

// 显示文件大小信息
console.log('\n📊 文件大小信息:');
requiredFiles.forEach(file => {
  const filePath = path.join(distDir, file);
  const stats = fs.statSync(filePath);
  const sizeKB = (stats.size / 1024).toFixed(2);
  console.log(`   ${file}: ${sizeKB} KB`);
});