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
  is_crawled: boolean;
  file_path?: string;
  markdown_path?: string;
  html_path?: string;
  ai_denoised: boolean;
  ai_rewritten: boolean;
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
  | 'text_rewritten';

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
