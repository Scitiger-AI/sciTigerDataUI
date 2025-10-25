# Markdown 视频渲染支持 - 实施完成

## 📋 问题描述

之前在渲染 Markdown 内容时，HTML `<video>` 标签无法正常渲染，而是显示为纯文本代码。

**问题示例**：
```
<video controls width="100%" preload="metadata" style="max-width: 800px;">
  <source src="http://localhost:8010/static/videos/..." type="video/mp4">
  您的浏览器不支持视频播放
</video>
视频 1 | 3.63MB | f10002 | wxv_4221549364151238669
```

## 🛠️ 解决方案

### 1. 安装依赖包

新增了两个 rehype 插件：

```bash
npm install rehype-raw rehype-sanitize
```

- **rehype-raw**: 允许 react-markdown 解析和渲染 HTML 标签
- **rehype-sanitize**: 提供安全过滤，防止 XSS 攻击

### 2. 自定义安全配置

在 `src/components/ui/MarkdownRenderer.tsx` 中添加了自定义的 HTML 白名单配置：

```typescript
const customSanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'video',      // 视频标签
    'source',     // 视频源
    'audio',      // 音频标签
    'track',      // 字幕轨道
  ],
  attributes: {
    ...defaultSchema.attributes,
    video: [
      'controls',
      'width',
      'height',
      'preload',
      'style',
      'poster',
      'autoplay',
      'loop',
      'muted',
      'playsinline',
    ],
    source: ['src', 'type'],
    audio: ['controls', 'preload', 'autoplay', 'loop', 'muted'],
    track: ['kind', 'src', 'srclang', 'label', 'default'],
  },
};
```

### 3. 更新 ReactMarkdown 配置

在两处 ReactMarkdown 组件中添加了插件配置：

**位置 1**: ContentViewer 组件（Modal 弹窗视图）
**位置 2**: MarkdownRenderer 组件（主渲染器）

```typescript
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[
    rehypeRaw,                             // 解析 HTML 标签
    rehypeHighlight,
    [rehypeSanitize, customSanitizeSchema], // 安全过滤
  ]}
  components={{ ... }}
>
  {content}
</ReactMarkdown>
```

## ✅ 效果

修改后，Markdown 内容中的 HTML 视频标签将：

1. ✅ **正常渲染为视频播放器**，而不是纯文本
2. ✅ **保留所有视频属性**（controls、width、style 等）
3. ✅ **支持多种视频格式**（通过 `<source>` 标签）
4. ✅ **安全过滤**，只允许白名单中的标签和属性
5. ✅ **兼容现有功能**，不影响其他 Markdown 语法

## 🎯 受影响的页面

以下所有使用 MarkdownRenderer 的页面都将支持视频渲染：

- **文章详情页** - Markdown 原文 Tab
- **文章详情页** - AI去噪 Markdown Tab
- **文章详情页** - AI重写 Markdown Tab
- **所有使用 MarkdownRenderer 组件的地方**

## 🔒 安全性

### 防护措施

1. **白名单机制**: 只允许特定的 HTML 标签（video, source, audio, track）
2. **属性过滤**: 只允许安全的属性，自动过滤潜在危险的属性
3. **基于 defaultSchema**: 继承了 rehype-sanitize 的默认安全配置
4. **自动过滤脚本**: 自动过滤 `<script>` 等危险标签

### 允许的多媒体标签

- `<video>`: 视频播放器
- `<source>`: 视频/音频源
- `<audio>`: 音频播放器
- `<track>`: 字幕轨道

### 不允许的标签（自动过滤）

- `<script>`: JavaScript 脚本
- `<iframe>`: 内嵌框架（默认不允许，可按需添加）
- `<object>`, `<embed>`: 对象嵌入
- 其他潜在危险标签

## 📊 构建验证

构建测试通过：

```bash
✓ Compiled successfully
✓ Generating static pages (12/12)
✓ No linter errors
```

## 🔄 使用示例

现在在 Markdown 内容中可以直接使用视频标签：

```markdown
# 文章标题

这是一段文字内容。

<video controls width="100%" preload="metadata" style="max-width: 800px;">
  <source src="http://localhost:8010/static/videos/example.mp4" type="video/mp4">
  您的浏览器不支持视频播放
</video>

*视频描述文字*

继续其他内容...
```

## 📝 技术细节

### 工作原理

1. **Markdown 解析**: react-markdown 解析 Markdown 语法
2. **HTML 解析**: rehype-raw 识别并解析 HTML 标签
3. **安全过滤**: rehype-sanitize 根据白名单过滤标签和属性
4. **语法高亮**: rehype-highlight 处理代码块高亮
5. **渲染输出**: 最终渲染为 React 组件

### 插件执行顺序

```
remarkPlugins (Markdown AST 处理)
  └─ remarkGfm (GitHub Flavored Markdown)
      ↓
rehypePlugins (HTML AST 处理)
  ├─ rehypeRaw (解析 HTML)
  ├─ rehypeHighlight (代码高亮)
  └─ rehypeSanitize (安全过滤)
      ↓
React 组件渲染
```

## 🎉 总结

通过添加 `rehype-raw` 和 `rehype-sanitize` 插件，成功实现了：

- ✅ Markdown 内容中的视频正常渲染
- ✅ 保持了安全性（XSS 防护）
- ✅ 不影响现有功能
- ✅ 代码简洁，易于维护
- ✅ 符合 Markdown 规范（支持混合 HTML）

---

**修改时间**: 2025年10月24日  
**修改文件**: 
- `package.json` (新增依赖)
- `src/components/ui/MarkdownRenderer.tsx` (核心修改)

