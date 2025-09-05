#!/usr/bin/env node

/**
 * 发布新版本的便捷脚本
 * 使用方式: npm run release patch|minor|major
 */

import { execSync } from 'child_process';
import fs from 'fs';

// 获取版本类型参数
const versionType = process.argv[2];
const validTypes = ['patch', 'minor', 'major'];

if (!versionType || !validTypes.includes(versionType)) {
  console.error('❌ 请指定版本类型: patch, minor, 或 major');
  console.error('使用方式: npm run release patch');
  process.exit(1);
}

try {
  console.log(`🚀 准备发布 ${versionType} 版本...`);
  
  // 检查是否有未提交的更改
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.error('❌ 存在未提交的更改，请先提交所有更改');
      console.log('未提交的文件:');
      console.log(status);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 无法检查 Git 状态');
    process.exit(1);
  }
  
  // 运行构建和检查
  console.log('🔨 构建项目...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('🔍 检查构建产物...');
  execSync('npm run check-build', { stdio: 'inherit' });
  
  // 更新版本号
  console.log(`📝 更新版本号 (${versionType})...`);
  execSync(`npm version ${versionType} --no-git-tag-version`, { stdio: 'inherit' });
  
  // 获取新版本号
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const newVersion = packageJson.version;
  const tagName = `v${newVersion}`;
  
  console.log(`✅ 新版本: ${newVersion}`);
  
  // 提交更改
  console.log('📝 提交版本更改...');
  execSync('git add package.json', { stdio: 'inherit' });
  execSync(`git commit -m "chore: bump version to ${newVersion}"`, { stdio: 'inherit' });
  
  // 创建标签
  console.log(`🏷️  创建标签 ${tagName}...`);
  execSync(`git tag ${tagName}`, { stdio: 'inherit' });
  
  // 推送到远程
  console.log('⬆️  推送到远程仓库...');
  execSync('git push origin main', { stdio: 'inherit' });
  execSync(`git push origin ${tagName}`, { stdio: 'inherit' });
  
  console.log('🎉 发布成功！');
  console.log(`📦 GitHub Actions 将自动构建和发布版本 ${newVersion}`);
  console.log(`🔗 查看发布状态: https://github.com/MliKiowa/markdown2png/actions`);
  
} catch (error) {
  console.error('❌ 发布过程中出现错误:');
  console.error(error.message);
  process.exit(1);
}