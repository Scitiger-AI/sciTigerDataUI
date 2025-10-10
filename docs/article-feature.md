# 文章管理功能说明

## 功能概述

本文档描述了新增的文章管理功能，该功能允许用户查看和管理公众号已采集的文章。

## 功能特性

### 1. 文章列表展示
- 在公众号详情页面显示该公众号的所有已采集文章
- 支持卡片式展示，包含文章标题、作者、发布时间、字数、图片数等信息
- 支持无限滚动加载更多文章
- 提供搜索和筛选功能

### 2. 文章详情页面
- 点击文章卡片可进入文章详情页面
- 显示文章的完整信息
- 支持多种内容格式的展示：
  - Markdown原文
  - AI去噪Markdown
  - 原始HTML
  - 原始文本
- 提供全屏查看和复制功能

### 3. 搜索和筛选
- 按文章标题搜索
- 按发布时间排序
- 按采集状态筛选
- 按日期范围筛选

## 技术实现

### 文件结构

```
src/
├── types/
│   └── article.ts                    # 文章相关类型定义
├── services/
│   └── article.ts                    # 文章API服务
├── hooks/
│   └── useArticles.ts               # 文章数据管理Hook
├── components/
│   ├── article/
│   │   ├── ArticleCard.tsx          # 文章卡片组件
│   │   ├── ArticleList.tsx          # 文章列表组件
│   │   └── ArticleDetail.tsx        # 文章详情组件
│   └── ui/
│       └── MarkdownRenderer.tsx     # Markdown渲染组件
└── app/
    └── crawler-data/
        └── wechat/
            └── [id]/
                └── article/
                    └── [articleId]/
                        └── page.tsx  # 文章详情页面
```

### 核心组件说明

#### ArticleCard
- 展示文章的基本信息
- 支持点击查看详情和访问原文
- 显示文章状态标签（已采集、AI去噪等）

#### ArticleList
- 文章列表容器组件
- 支持搜索、筛选、排序功能
- 实现无限滚动加载
- 可配置显示选项

#### ArticleDetail
- 文章详情展示组件
- 支持多种内容格式切换
- 提供全屏查看和复制功能
- 显示文章完整元信息

#### MarkdownRenderer
- Markdown内容渲染组件
- 支持代码高亮
- 提供全屏查看模式
- 支持多种内容格式

### API接口

#### 文章列表接口
```
GET /api/v1/articles/
参数:
- account_biz: 公众号BIZ参数
- keyword: 搜索关键词
- start_date: 开始日期
- end_date: 结束日期
- is_crawled: 是否已采集
- page: 页码
- page_size: 每页数量
- sort_by: 排序字段
- sort_order: 排序方向
```

#### 文章详情接口
```
GET /api/v1/articles/{article_id}
```

#### 文章内容接口
```
GET /api/v1/articles/{article_id}/content?format={format}
支持的格式:
- markdown: 默认Markdown格式
- html: 原始HTML格式
- text: 纯文本格式
- markdown_original: 原始Markdown
- text_original: 原始文本
- markdown_denoised: AI去噪Markdown
- text_denoised: AI去噪文本
```

## 使用方法

### 1. 查看文章列表
1. 进入公众号详情页面
2. 在"已采集文章"部分查看文章列表
3. 使用搜索框搜索特定文章
4. 使用筛选器按条件筛选文章

### 2. 查看文章详情
1. 点击文章卡片进入详情页面
2. 在标签页中切换不同的内容格式
3. 使用"全屏查看"按钮查看完整内容
4. 使用"复制内容"按钮复制文章内容

### 3. 访问原文
1. 在文章卡片或详情页面点击"原文"按钮
2. 系统会在新标签页中打开微信原文链接

## 样式和主题

- 使用Ant Design 5.0组件库
- 支持深色/浅色主题切换
- 代码高亮使用GitHub风格
- 响应式设计，支持移动端

## 依赖包

- `react-markdown`: Markdown渲染
- `remark-gfm`: GitHub风格Markdown支持
- `rehype-highlight`: 代码高亮
- `dayjs`: 日期处理

## 注意事项

1. 文章内容需要后端API支持
2. 确保API接口返回正确的数据格式
3. 大文件内容可能需要优化加载性能
4. 代码高亮样式已包含在全局CSS中
