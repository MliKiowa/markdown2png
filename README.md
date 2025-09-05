# markdown2png

一个强大的 Markdown 转 PNG 图片生成库，支持丰富的 Markdown 语法和美观的渲染效果。

## ✨ 特性

- 📝 **完整的 Markdown 支持**: 标题、段落、引用、列表、代码块、链接等
- 🎨 **美观的视觉效果**: 现代化的设计风格，支持语法高亮
- 🌍 **多语言支持**: 支持中文、英文、表情符号等多种字符
- ⚡ **高性能渲染**: 基于 Satori 和 Resvg 的高效 SVG 到 PNG 转换
- 🔧 **可定制化**: 支持自定义字体、宽度等配置选项
- 📐 **自适应高度**: 根据内容自动计算合适的图片高度

## 📦 安装

```bash
npm install markdown2png
```

## 🚀 使用方法

### 基础用法

```typescript
import { markdownToPngBuffer } from 'markdown2png';
import fs from 'fs';

const markdown = `
# 🎨 Hello World

This is a **markdown** text with some *italic* and a [link](https://example.com).

> 这是一个引用块，展示了美化后的样式效果。

## 特性列表
- ✨ 美观的渐变背景
- 🎯 现代化的排版设计  
- 🌈 丰富的颜色搭配

\`\`\`javascript
function hello() {
    console.log("Hello, World!");
    return "Beautiful Markdown";
}
\`\`\`
`;

// 加载字体（Windows 示例）
const loadFont = (path: string): Buffer => {
    try {
        return fs.readFileSync(path);
    } catch {
        throw new Error(`Font not found: ${path}`);
    }
};

const fonts = [
    {
        name: "Chinese Font",
        data: loadFont("C:/Windows/Fonts/msyh.ttf"), // 微软雅黑
        weight: 400,
        style: "normal",
    },
    {
        name: "Emoji Font", 
        data: loadFont("C:/Windows/Fonts/seguiemj.ttf"), // Emoji 字体
        weight: 400,
        style: "normal",
    }
];

// 生成 PNG
const pngBuffer = await markdownToPngBuffer(markdown, fonts, 1000);
fs.writeFileSync("output.png", pngBuffer);
```

### 高级配置

```typescript
// 自定义宽度
const pngBuffer = await markdownToPngBuffer(markdown, fonts, 1200);

// 使用多种字体
const fonts = [
    {
        name: "Noto Sans",
        data: loadFont("/path/to/NotoSans-Regular.ttf"),
        weight: 400,
        style: "normal",
    },
    {
        name: "Noto Sans",
        data: loadFont("/path/to/NotoSans-Bold.ttf"),
        weight: 700, 
        style: "normal",
    }
];
```

## 🎯 支持的 Markdown 语法

### 标题
```markdown
# H1 标题
## H2 标题  
### H3 标题
```

### 文本样式
```markdown
**粗体文本**
*斜体文本*
`内联代码`
[链接文本](https://example.com)
```

### 引用块
```markdown
> 这是一个引用块
> 支持多行引用
```

### 列表
```markdown
- 无序列表项 1
- 无序列表项 2

1. 有序列表项 1
2. 有序列表项 2
```

### 代码块
```markdown
\`\`\`javascript
function example() {
    console.log("Hello World");
}
\`\`\`
```

### 分隔线
```markdown
---
```

## 🛠️ API 参考

### `markdownToPngBuffer(markdown, fonts, width?)`

**参数:**
- `markdown` (string): 要转换的 Markdown 文本
- `fonts` (Array): 字体配置数组
  - `name` (string): 字体名称
  - `data` (Buffer): 字体文件数据
  - `weight` (number): 字体粗细 (100-900)
  - `style` (string): 字体样式 ("normal" | "italic")
- `width` (number, 可选): 图片宽度，默认 1000px

**返回值:**
- `Promise<Buffer>`: PNG 图片的 Buffer 数据

## 📋 系统要求

- Node.js 16+
- 支持的字体格式: TTF, OTF, TTC

## 🌍 字体建议

### Windows
- 中文: `C:/Windows/Fonts/msyh.ttf` (微软雅黑)
- 英文: `C:/Windows/Fonts/arial.ttf` (Arial)
- Emoji: `C:/Windows/Fonts/seguiemj.ttf` (Segoe UI Emoji)

### macOS
- 中文: `/System/Library/Fonts/PingFang.ttc` (苹方)
- 英文: `/System/Library/Fonts/Helvetica.ttc` (Helvetica)
- Emoji: `/System/Library/Fonts/Apple Color Emoji.ttc`

### Linux
- 中文: 安装 `fonts-noto-cjk`
- 英文: 安装 `fonts-liberation`
- Emoji: 安装 `fonts-noto-color-emoji`

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 🚀 发布新版本

查看 [RELEASE.md](RELEASE.md) 了解如何发布新版本。

快速发布命令：
```bash
# 发布补丁版本 (1.0.0 -> 1.0.1)
npm run release patch

# 发布次要版本 (1.0.0 -> 1.1.0)  
npm run release minor

# 发布主要版本 (1.0.0 -> 2.0.0)
npm run release major
```

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Satori](https://github.com/vercel/satori) - SVG 渲染引擎
- [Resvg](https://github.com/RazrFalcon/resvg) - SVG 到 PNG 转换

---

如果这个项目对您有帮助，请给个 ⭐ Star 支持一下！