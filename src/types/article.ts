// 文章类型定义
export interface Article {
  id: string;
  url: string;
  title: string;
  author: string | null;
  nickname: string | null;
  publish_time: string | null;
  post_time: number;
  word_count: number;
  image_count: number;
  video_count: number;
  is_crawled: boolean;
  file_path?: string;
  markdown_path?: string;
  html_path?: string;
  ai_denoised: boolean;
  ai_rewritten: boolean;
  published_by?: string[];
  created_at: string;
  crawl_time?: string;
}

// 文章列表响应类型
export interface ArticleListResponse {
  success: boolean;
  message: string;
  data: {
    items: Article[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
  error_code: string | null;
}

// 文章详情响应类型
export interface ArticleDetailResponse {
  success: boolean;
  message: string;
  data: Article;
  error_code: string | null;
}

// 文章内容响应类型
export interface ArticleContentResponse {
  success: boolean;
  message: string;
  data: {
    content: string;
    format: string;
    article_id: string;
  };
  error_code: string | null;
}

// 文章查询参数类型
export interface ArticleQuery {
  account_id?: string;
  account_name?: string;
  account_biz?: string;
  keyword?: string;
  start_date?: string;
  end_date?: string;
  is_crawled?: boolean;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// 文章内容格式类型
export type ArticleContentFormat = 
  | 'markdown'
  | 'html'
  | 'text'
  | 'markdown_original'
  | 'text_original'
  | 'markdown_denoised'
  | 'text_denoised'
  | 'markdown_rewritten'
  | 'text_rewritten'
  | 'wechat_html';

// 微信内容主题类型
export type WechatTheme = 'default' | 'tech' | 'academic' | 'fresh';

// 微信主题选项
export const WECHAT_THEME_OPTIONS = [
  { label: '🎨 简洁清新（蓝色系）', value: 'default', description: '简洁清新的蓝色系主题' },
  { label: '💻 现代科技（深色代码块）', value: 'tech', description: '现代科技风格，适合技术文章' },
  { label: '📚 严谨学术（衬线字体）', value: 'academic', description: '严谨学术风格，适合学术文章' },
  { label: '🌿 清新活泼（绿色系）', value: 'fresh', description: '清新活泼的绿色系主题' },
] as const;

// 文章内容类型
export interface ArticleContent {
  content: string;
  format: ArticleContentFormat;
  article_id: string;
}

// AI去噪请求参数类型
export interface ArticleDenoiseRequest {
  force_reprocess?: boolean;
  save_to_file?: boolean;
}

// AI去噪响应数据类型
export interface ArticleDenoiseData {
  article_id: string;
  success: boolean;
  message: string;
  original_length?: number;
  cleaned_length?: number;
  reduction_rate?: number;
  markdown_file_path?: string;
  text_file_path?: string;
  processed_at?: string;
  processing_time?: number;
  model_used?: string;
  provider_used?: string;
  error_code?: string;
  error_details?: any;
}

// AI去噪响应类型
export interface ArticleDenoiseResponse {
  success: boolean;
  message: string;
  data: ArticleDenoiseData;
  error_code?: string;
}

// AI重写请求参数类型
export interface ArticleRewriteRequest {
  force_reprocess?: boolean;
  save_to_file?: boolean;
  auto_denoise?: boolean;
}

// AI重写响应数据类型
export interface ArticleRewriteData {
  article_id: string;
  success: boolean;
  message: string;
  original_length?: number;
  rewritten_length?: number;
  length_change_rate?: number;
  markdown_file_path?: string;
  text_file_path?: string;
  processed_at?: string;
  processing_time?: number;
  model_used?: string;
  provider_used?: string;
  auto_denoised?: boolean;
  denoise_processing_time?: number;
  error_code?: string;
  error_details?: any;
}

// AI重写响应类型
export interface ArticleRewriteResponse {
  success: boolean;
  message: string;
  data: ArticleRewriteData;
  error_code?: string;
}

// 文章API错误响应类型
export interface ArticleApiError {
  success: false;
  message: string;
  data: null;
  error_code: string;
  details?: {
    field: string;
    error: string;
  };
}

// 文章排序选项
export const ARTICLE_SORT_OPTIONS = [
  { label: '发布时间', value: 'post_time' },
  { label: '创建时间', value: 'created_at' },
  { label: '爬取时间', value: 'crawl_time' },
  { label: '字数', value: 'word_count' },
  { label: '图片数', value: 'image_count' },
  { label: '视频数', value: 'video_count' },
] as const;

// 文章排序方向选项
export const ARTICLE_SORT_ORDER_OPTIONS = [
  { label: '降序', value: 'desc' },
  { label: '升序', value: 'asc' },
] as const;

// 文章内容格式选项
export const ARTICLE_CONTENT_FORMAT_OPTIONS = [
  { label: 'Markdown（默认）', value: 'markdown' },
  { label: '原始HTML', value: 'html' },
  { label: '纯文本', value: 'text' },
  { label: '原始Markdown', value: 'markdown_original' },
  { label: '原始文本', value: 'text_original' },
  { label: 'AI去噪Markdown', value: 'markdown_denoised' },
  { label: 'AI去噪文本', value: 'text_denoised' },
  { label: 'AI重写Markdown', value: 'markdown_rewritten' },
  { label: 'AI重写文本', value: 'text_rewritten' },
  { label: '微信格式HTML', value: 'wechat_html' },
] as const;

// 文章删除请求参数类型
export interface ArticleDeleteRequest {
  delete_files?: boolean;
  force_delete?: boolean;
}

// 文章删除响应数据类型
export interface ArticleDeleteData {
  article_id: string;
  success: boolean;
  message: string;
  error_code: string | null;
  files_deleted: string[];
  files_failed: string[];
  total_files_processed: number;
  deleted_at: string | null;
  processing_time: number;
  error_details: any | null;
}

// 文章删除响应类型
export interface ArticleDeleteResponse {
  success: boolean;
  message: string;
  data: ArticleDeleteData;
  error_code: string | null;
}

// Markdown 转微信格式请求参数类型
export interface MarkdownToWechatRequest {
  markdown_content: string;
  theme?: WechatTheme;
}

// Markdown 转微信格式响应数据类型
export interface MarkdownToWechatData {
  html_content: string;
  theme: WechatTheme;
  content_length: number;
  html_length: number;
  processed_at: string;
}

// Markdown 转微信格式响应类型
export interface MarkdownToWechatResponse {
  success: boolean;
  message: string;
  data: MarkdownToWechatData;
  error_code: string | null;
}

// 文章图片类型定义
export interface ArticleImage {
  id: string;
  article_id: string;
  account_id: string;
  src: string;
  local_path: string;
  api_url: string;
  width: number;
  height: number;
  alt: string | null;
  download_status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

// 文章图片列表响应类型
export interface ArticleImagesResponse {
  success: boolean;
  message: string;
  data: ArticleImage[];
  error_code: string | null;
}

// 文章视频类型定义
export interface ArticleVideo {
  id: string;
  article_id: string;
  video_id: string;
  url: string;
  local_path: string;
  api_url: string;
  filename: string;
  size: number;
  format_id: string;
  index: number;
  success: boolean;
  collected_at: string;
  created_at: string;
}

// 文章视频列表响应类型
export interface ArticleVideosResponse {
  success: boolean;
  message: string;
  data: ArticleVideo[];
  error_code: string | null;
}
