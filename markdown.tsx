import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

// Markdown 组件类型定义
interface MarkdownComponent {
    type: 'heading' | 'paragraph' | 'blockquote' | 'list' | 'code-block' | 'hr';
    level?: number; // 用于标题级别
    content: InlineElement[];
    items?: MarkdownComponent[]; // 用于列表项
    language?: string; // 用于代码块
}

interface InlineElement {
    type: 'text' | 'bold' | 'italic' | 'code' | 'link';
    content: string;
    url?: string; // 用于链接
}

// Markdown 解析器类
class MarkdownParser {
    private lines: string[];
    private currentIndex: number;

    constructor(markdown: string) {
        this.lines = markdown.split('\n');
        this.currentIndex = 0;
    }

    parse(): MarkdownComponent[] {
        const components: MarkdownComponent[] = [];

        while (this.currentIndex < this.lines.length) {
            const line = this.lines[this.currentIndex].trim();

            if (line === '') {
                this.currentIndex++;
                continue;
            }

            const component = this.parseLine(line);
            if (component) {
                components.push(component);
            }
            this.currentIndex++;
        }

        return components;
    }

    private parseLine(line: string): MarkdownComponent | null {
        // 解析标题
        if (line.startsWith('#')) {
            return this.parseHeading(line);
        }

        // 解析引用块
        if (line.startsWith('>')) {
            return this.parseBlockquote(line);
        }

        // 解析列表
        if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line)) {
            return this.parseList();
        }

        // 解析代码块
        if (line.startsWith('```')) {
            return this.parseCodeBlock();
        }

        // 解析水平线
        if (line.match(/^[-*_]{3,}$/)) {
            return { type: 'hr', content: [] };
        }

        // 默认解析为段落
        return this.parseParagraph(line);
    }

    private parseHeading(line: string): MarkdownComponent {
        const match = line.match(/^(#{1,6})\s(.+)$/);
        if (match) {
            const level = match[1].length;
            const content = this.parseInlineElements(match[2]);
            return { type: 'heading', level, content };
        }
        return { type: 'paragraph', content: this.parseInlineElements(line) };
    }

    private parseBlockquote(line: string): MarkdownComponent {
        const content = line.substring(1).trim();
        return { type: 'blockquote', content: this.parseInlineElements(content) };
    }

    private parseList(): MarkdownComponent {
        const items: MarkdownComponent[] = [];

        while (this.currentIndex < this.lines.length) {
            const line = this.lines[this.currentIndex].trim();

            if (line === '') {
                break;
            }

            if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line)) {
                const content = line.replace(/^[-*]\s|\d+\.\s/, '');
                items.push({
                    type: 'paragraph',
                    content: this.parseInlineElements(content)
                });
                this.currentIndex++;
            } else {
                break;
            }
        }

        this.currentIndex--; // 回退一行，因为外部循环会增加
        return { type: 'list', content: [], items };
    }

    private parseCodeBlock(): MarkdownComponent {
        const startLine = this.lines[this.currentIndex];
        const language = startLine.substring(3).trim();
        const codeLines: string[] = [];

        this.currentIndex++;

        while (this.currentIndex < this.lines.length) {
            const line = this.lines[this.currentIndex];
            if (line.trim() === '```') {
                break;
            }
            codeLines.push(line);
            this.currentIndex++;
        }

        return {
            type: 'code-block',
            content: [{ type: 'text', content: codeLines.join('\n') }],
            language
        };
    }

    private parseParagraph(line: string): MarkdownComponent {
        return { type: 'paragraph', content: this.parseInlineElements(line) };
    }

    private parseInlineElements(text: string): InlineElement[] {
        const elements: InlineElement[] = [];
        let remaining = text;

        while (remaining.length > 0) {
            // 解析粗体 **text**
            const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
            if (boldMatch) {
                elements.push({ type: 'bold', content: boldMatch[1] });
                remaining = remaining.substring(boldMatch[0].length);
                continue;
            }

            // 解析斜体 *text*
            const italicMatch = remaining.match(/^\*([^*]+)\*/);
            if (italicMatch) {
                elements.push({ type: 'italic', content: italicMatch[1] });
                remaining = remaining.substring(italicMatch[0].length);
                continue;
            }

            // 解析内联代码 `code`
            const codeMatch = remaining.match(/^`([^`]+)`/);
            if (codeMatch) {
                elements.push({ type: 'code', content: codeMatch[1] });
                remaining = remaining.substring(codeMatch[0].length);
                continue;
            }

            // 解析链接 [text](url)
            const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
            if (linkMatch) {
                elements.push({ type: 'link', content: linkMatch[1], url: linkMatch[2] });
                remaining = remaining.substring(linkMatch[0].length);
                continue;
            }

            // 普通文本
            const nextSpecialChar = remaining.search(/[\*`\[]/);
            if (nextSpecialChar === -1) {
                elements.push({ type: 'text', content: remaining });
                break;
            } else {
                if (nextSpecialChar > 0) {
                    elements.push({ type: 'text', content: remaining.substring(0, nextSpecialChar) });
                    remaining = remaining.substring(nextSpecialChar);
                } else {
                    // 如果找到特殊字符但无法匹配，作为普通文本处理
                    elements.push({ type: 'text', content: remaining.charAt(0) });
                    remaining = remaining.substring(1);
                }
            }
        }

        return elements;
    }
}

// 基于解析后的组件计算高度
const calculateContentHeight = (components: MarkdownComponent[]): number => {
    let height = 100; // 基础容器高度

    for (const component of components) {
        switch (component.type) {
            case 'heading':
                if (component.level === 1) {
                    height += 48 + 30 + 15 + 4; // H1: 字体大小 + margin + padding + border
                } else if (component.level === 2) {
                    height += 36 + 20 + 30; // H2: 字体大小 + margin
                } else {
                    height += 28 + 15 + 25; // H3+: 字体大小 + margin
                }
                break;
            case 'paragraph':
                const textLength = component.content.reduce((sum, el) => sum + el.content.length, 0);
                const estimatedLines = Math.max(1, Math.ceil(textLength / 50));
                height += estimatedLines * 20 * 1.8 + 25; // 行高 + margin
                break;
            case 'blockquote':
                const quoteTextLength = component.content.reduce((sum, el) => sum + el.content.length, 0);
                const quoteLines = Math.max(1, Math.ceil(quoteTextLength / 60));
                height += quoteLines * 24 + 40 + 25; // 行高 + padding + margin
                break;
            case 'list':
                if (component.items) {
                    height += component.items.length * (18 * 1.7 + 8) + 20; // 每项高度 + 整体margin
                }
                break;
            case 'code-block':
                const codeLines = component.content[0]?.content.split('\n').length || 1;
                height += codeLines * 16 * 1.4 + 40 + 25; // 代码行高 + padding + margin
                break;
            case 'hr':
                height += 20 + 20; // 线条高度 + margin
                break;
        }
    }

    return Math.max(height, 400);
};


// 渲染内联元素的辅助函数
const renderInlineElements = (elements: InlineElement[]): React.ReactNode[] => {
    return elements.map((element, index) => {
        const key = `inline-${index}`;
        switch (element.type) {
            case 'bold':
                return (
                    <span key={key} style={{ fontWeight: 'bold' }}>
                        {element.content}
                    </span>
                );
            case 'italic':
                return (
                    <span key={key} style={{ fontStyle: 'italic' }}>
                        {element.content}
                    </span>
                );
            case 'code':
                return (
                    <span key={key} style={{
                        backgroundColor: '#f1f5f9',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontSize: '16px',
                        color: '#e53e3e'
                    }}>
                        {element.content}
                    </span>
                );
            case 'link':
                return (
                    <span key={key} style={{
                        color: '#4299e1',
                        textDecoration: 'underline'
                    }}>
                        {element.content}
                    </span>
                );
            case 'text':
            default:
                return <span key={key}>{element.content}</span>;
        }
    });
};

// 渲染单个组件的函数
const renderComponent = (component: MarkdownComponent, index: number): React.ReactNode => {
    const key = `component-${index}`;

    switch (component.type) {
        case 'heading':
            const headingStyles = {
                1: {
                    fontSize: '48px',
                    fontWeight: 'bold',
                    marginBottom: '30px',
                    marginTop: '15px',
                    color: '#2d3748',
                    borderBottom: '4px solid #4299e1',
                    paddingBottom: '10px'
                },
                2: {
                    fontSize: '36px',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    marginTop: '30px',
                    color: '#4a5568'
                },
                3: {
                    fontSize: '28px',
                    fontWeight: 'bold',
                    marginBottom: '15px',
                    marginTop: '25px',
                    color: '#4a5568'
                }
            };

            const headingStyle = headingStyles[component.level as keyof typeof headingStyles] || headingStyles[3];

            return (
                <div key={key} style={Object.assign({}, headingStyle, { display: 'flex' })}>
                    {renderInlineElements(component.content)}
                </div>
            );

        case 'paragraph':
            return (
                <div key={key} style={{
                    display: 'flex',
                    fontSize: '20px',
                    lineHeight: '1.8',
                    marginBottom: '25px',
                    color: '#2d3748'
                }}>
                    {renderInlineElements(component.content)}
                </div>
            );

        case 'blockquote':
            return (
                <div key={key} style={{
                    display: 'flex',
                    borderLeft: '6px solid #4299e1',
                    backgroundColor: '#e6f3ff',
                    padding: '20px',
                    margin: '25px 0',
                    fontStyle: 'italic',
                    fontSize: '18px',
                    color: '#2c5282'
                }}>
                    {renderInlineElements(component.content)}
                </div>
            );

        case 'list':
            return (
                <div key={key} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    paddingLeft: '30px',
                    marginBottom: '25px'
                }}>
                    {component.items?.map((item, itemIndex) => (
                        <div key={`list-item-${itemIndex}`} style={{
                            display: 'flex',
                            fontSize: '18px',
                            lineHeight: '1.7',
                            marginBottom: '8px',
                            color: '#2d3748'
                        }}>
                            {renderInlineElements(item.content)}
                        </div>
                    ))}
                </div>
            );

        case 'code-block':
            return (
                <div key={key} style={{
                    display: 'flex',
                    backgroundColor: '#1a202c',
                    color: '#e2e8f0',
                    padding: '20px',
                    margin: '25px 0',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    lineHeight: '1.4'
                }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                        {component.content[0]?.content}
                    </pre>
                </div>
            );

        case 'hr':
            return (
                <div key={key} style={{
                    width: '100%',
                    height: '2px',
                    backgroundColor: '#e2e8f0',
                    margin: '20px 0',
                    border: 'none'
                }} />
            );

        default:
            return null;
    }
};

export const BeautifulMarkdown = ({
    components,
    fontFamily = 'Chinese Font, Arial, sans-serif'
}: {
    components: MarkdownComponent[];
    fontFamily?: string;
}) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            fontFamily,
            lineHeight: 1.6,
            padding: '20px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
            {components.map((component, index) => renderComponent(component, index))}
        </div>
    );
};
export type FontConfig = Parameters<typeof satori>[1]["fonts"];
export async function markdownToPngBuffer(
    markdown: string,
    fonts: FontConfig,
    width = 1000
): Promise<Buffer> {
    const parser = new MarkdownParser(markdown);
    const components = parser.parse();

    // 自动生成 fontFamily 字符串
    const fontNames = fonts.map(font => font.name).join(', ');
    const fontFamily = fontNames ? `${fontNames}, Arial, sans-serif` : 'Arial, sans-serif';

    const reactNode = <BeautifulMarkdown components={components} fontFamily={fontFamily} />;
    const dynamicHeight = calculateContentHeight(components);

    const svg = await satori(reactNode, {
        width,
        height: dynamicHeight,
        fonts,
    });

    const resvg = new Resvg(Buffer.from(svg), {
        background: "rgba(255, 255, 255, 1)",
        fitTo: { mode: "width", value: width },
    });

    const pngData = resvg.render();
    return pngData.asPng();
}

// const md = `
// # 🎨 你好，世界

// This is a **markdown** text with some *italic* and a [link](https://example.com).

// > 这是一个引用块，展示了美化后的样式效果。

// ## 特性列表
// - ✨ 美观的渐变背景
// - 🎯 现代化的排版设计
// - 🌈 丰富的颜色搭配
// - 📱 响应式布局

// 这里有一些内联代码: \`console.log('Hello World!')\`

// ### 代码示例

// \`\`\`javascript
// function hello() {
//     console.log("Hello, World!");
//     return "Beautiful Markdown";
// }
// \`\`\`

// ---

// **感谢使用我们的 Markdown 解析器！**
// `;

// const loadChineseFont = (): Buffer => {
//     const fonts = [
//         "C:/Windows/Fonts/msyh.ttf", // 微软雅黑
//         "C:/Windows/Fonts/simhei.ttf", // 黑体
//         "C:/Windows/Fonts/simsun.ttc", // 宋体
//         "C:/Windows/Fonts/arial.ttf", // Arial
//     ];
//     for (const font of fonts) {
//         try {
//             return fs.readFileSync(font);
//         } catch { }
//     }
//     throw new Error("未找到支持中文的字体");
// };
// const loadEmojiFont = (): Buffer | null => {
//     const emojiFonts = [
//         "C:/Windows/Fonts/seguiemj.ttf", // Windows Emoji 字体
//         "C:/Windows/Fonts/NotoColorEmoji.ttf", // Noto Color Emoji
//         "C:/Windows/Fonts/AppleColorEmoji.ttc", // Apple Color Emoji (如果有的话)
//     ];

//     for (const font of emojiFonts) {
//         try {
//             return fs.readFileSync(font);
//         } catch { }
//     }
//     return null;
// };
// const pngBuffer = await markdownToPngBuffer(md, [
//     {
//         name: "Emoji Font",
//         data: loadEmojiFont()!,
//         weight: 400,
//         style: "normal",
//     }, {
//         name: "Chinese Font",
//         data: loadChineseFont(),
//         weight: 400,
//         style: "normal",
//     }
// ]);
// fs.writeFileSync("beautiful_markdown.png", pngBuffer);