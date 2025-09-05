# GitHub Actions 自动发布说明

## 🚀 自动发布流程

这个项目配置了自动发布的 GitHub Actions 工作流，当您创建新的版本标签时会自动触发发布流程。

## 📋 使用步骤

### 1. 配置 NPM Token

在 GitHub 仓库中设置 NPM 访问令牌：

1. 登录 [npmjs.com](https://www.npmjs.com/)
2. 转到 Access Tokens 页面
3. 创建一个新的 **Automation** 类型的令牌
4. 在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加：
   - Name: `NPM_TOKEN`
   - Value: 您的 NPM 令牌

### 2. 创建发布

要发布新版本，只需创建一个标签：

```bash
# 确保代码已提交
git add .
git commit -m "准备发布 v1.0.1"

# 创建并推送标签
git tag v1.0.1
git push origin v1.0.1
```

### 3. 自动化流程

当标签被推送后，GitHub Actions 会自动：

1. ✅ 检出代码
2. ✅ 设置 Node.js 环境
3. ✅ 更新 package.json 中的版本号
4. ✅ 安装依赖
5. ✅ 构建项目
6. ✅ 运行测试（可选）
7. ✅ 创建 GitHub Release
8. ✅ 发布到 NPM
9. ✅ 上传构建产物

## 📦 支持的标签格式

- ✅ `v1.0.0` (推荐)
- ✅ `v1.0.0-beta.1`
- ✅ `v2.1.3`
- ✅ `v1.0.0-alpha.1`

## 🔧 自定义配置

### 修改发布条件

如果您想要修改触发发布的条件，可以编辑 `.github/workflows/release.yml` 文件中的 `on` 部分：

```yaml
on:
  push:
    tags:
      - 'v*.*.*'  # 修改这里的模式
```

### 添加更多检查

您可以在发布前添加更多检查步骤：

```yaml
- name: Lint code
  run: npm run lint

- name: Type check
  run: npm run type-check
```

## 📝 版本号管理

建议使用语义化版本号：

- **MAJOR** 版本：不兼容的 API 变更
- **MINOR** 版本：向下兼容的功能性新增
- **PATCH** 版本：向下兼容的问题修正

例如：
- `v1.0.0` → `v1.0.1` (修复 bug)
- `v1.0.1` → `v1.1.0` (新增功能)
- `v1.1.0` → `v2.0.0` (破坏性变更)

## 🛠️ 故障排除

### 发布失败

如果发布失败，请检查：

1. NPM_TOKEN 是否正确设置
2. NPM 包名是否可用
3. 构建是否成功
4. 测试是否通过

### 查看日志

在 GitHub 仓库的 Actions 标签页中可以查看详细的构建日志。

## 📁 包含的文件

最终的 NPM 包将包含：

- `dist/` - 编译后的 JavaScript 和类型定义文件
- `README.md` - 项目说明文档
- `LICENSE` - 许可证文件
- `package.json` - 包配置文件

## 🎯 最佳实践

1. **测试后发布**：确保在本地充分测试后再创建标签
2. **编写变更日志**：在 README 或单独的 CHANGELOG.md 中记录变更
3. **使用语义化版本**：遵循 semver 规范
4. **检查依赖**：定期更新和审核依赖包