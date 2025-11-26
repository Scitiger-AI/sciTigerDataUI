// ============ 小红书笔记类型定义 ============

// 小红书笔记内容类型
export interface XhsNote {
  id: string;
  note_id: string;
  note_url?: string;
  title: string;
  desc: string;
  time: number; // 发布时间戳
  last_update_time: number;
  user_id: string;
  nickname: string;
  avatar?: string;

  // 内容类型
  type: 'normal' | 'video';

  // 互动数据
  liked_count: string | number;
  collected_count: string | number;
  comment_count: string | number;
  share_count: string | number;

  // 图片和视频
  image_list?: string[];
  video_url?: string;
  video_duration?: number;

  // 标签
  tag_list?: string[];
  tag_list_str?: string;

  // 位置信息
  ip_location?: string;

  // 采集信息
  task_id?: string;
  source_keyword?: string;
  crawl_time?: string;
  created_at?: string;
  updated_at?: string;

  // AI 处理状态（预留）
  ai_extracted?: boolean;
  ai_denoised?: boolean;
  ai_rewritten?: boolean;
}

// ============ 小红书评论类型定义 ============

// 小红书评论
export interface XhsComment {
  id: string;
  comment_id: string;
  note_id: string;
  content: string;
  create_time: number;
  ip_location?: string;

  // 用户信息
  user_id: string;
  nickname: string;
  avatar?: string;

  // 互动数据
  like_count: number | string;
  sub_comment_count: number;

  // 层级信息
  parent_comment_id?: string;
  sub_comments?: XhsComment[];

  crawl_time?: string;
}

// ============ 小红书创作者类型定义 ============

// 小红书创作者
export interface XhsCreator {
  id?: string;
  user_id: string;
  nickname: string;
  avatar?: string;
  desc?: string;
  gender?: string;
  ip_location?: string;

  // 统计数据
  fans: number;
  follows: number;
  interaction: number;
  notes_count: number;

  // 采集信息
  crawl_time?: string;
  created_at?: string;
  updated_at?: string;
}

// ============ 小红书任务类型定义 ============

// 任务状态
export type XhsTaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

// 任务类型
export type XhsTaskType = 'search' | 'detail' | 'creator';

// 调度类型
export type ScheduleType = 'immediate' | 'once' | 'cron';

// 排序类型
export type SortType = 'general' | 'popularity_descending' | 'time_descending';

// Cron 配置
export interface CronConfig {
  expression: string; // Cron 表达式，如 "0 9 * * *"
  timezone?: string; // 时区，默认 "Asia/Shanghai"
}

// 评论配置
export interface CommentConfig {
  enabled: boolean;
  max_per_note?: number; // 每个笔记最多爬取评论数 (0-1000)
  fetch_sub_comments?: boolean; // 是否爬取子评论
}

// 媒体下载配置
export interface MediaDownloadConfig {
  enabled: boolean;
  download_images?: boolean; // 是否下载图片
  download_videos?: boolean; // 是否下载视频
  save_path?: string | null; // 保存路径（null 使用默认路径）
  max_image_size_mb?: number; // 图片最大尺寸 MB (1-500)
  max_video_size_mb?: number; // 视频最大尺寸 MB (1-5000)
  image_format?: string; // 图片格式 (jpg/png/webp)
  video_format?: string; // 视频格式 (mp4/mov)
}

// ASR 配置
export interface ASRConfig {
  enabled: boolean;
  provider?: string; // ASR 提供商 (whisper/azure/aliyun)
  language?: string; // 语言 (zh/en)
  save_to_file?: boolean; // 是否保存为文件
}

// 去噪配置
export interface DenoiseConfig {
  enabled: boolean;
  save_to_file?: boolean;
}

// 重写配置
export interface RewriteConfig {
  enabled: boolean;
  save_to_file?: boolean;
}

// 后处理配置
export interface PostProcessingConfig {
  enabled: boolean;
  asr?: ASRConfig;
  denoise?: DenoiseConfig;
  rewrite?: RewriteConfig;
  extract_keywords?: boolean; // 是否提取关键词
  auto_classify?: boolean; // 是否自动分类
}

// 任务进度
export interface TaskProgress {
  current: number; // 当前进度
  total: number; // 总数
  percentage: number; // 百分比 (0-100)
}

// 结果摘要
export interface ResultsSummary {
  notes_count?: number; // 笔记数量
  creators_count?: number; // 创作者数量
  comments_count?: number; // 评论数量
  images_downloaded?: number; // 下载的图片数量
  videos_downloaded?: number; // 下载的视频数量
}

// 小红书任务（完整版）
export interface XhsTask {
  id: string; // 任务ID (UUID)
  name: string; // 任务名称
  task_type: XhsTaskType;
  status: XhsTaskStatus;
  schedule_type: ScheduleType;

  // 搜索任务参数
  keywords?: string;
  max_count?: number;
  start_page?: number;
  sort_type?: SortType;

  // 详情任务参数
  note_urls?: string[];

  // 创作者任务参数
  creator_urls?: string[];

  // 配置项
  comment_config: CommentConfig;
  media_download_config: MediaDownloadConfig;
  post_processing_config: PostProcessingConfig;

  // 调度配置
  scheduled_time?: string; // ISO 时间字符串（once 模式）
  cron_config?: CronConfig; // Cron 配置（cron 模式）
  enable_proxy?: boolean;
  enable_resume?: boolean;

  // 执行信息
  user_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  last_run_at?: string;
  next_run_at?: string;

  // 进度和结果
  progress?: TaskProgress;
  results_summary?: ResultsSummary;
  error_message?: string;

  // SocialDataCollector 关联
  social_collector_task_id?: string;
}

// ============ API 请求和响应类型 ============

// 基础响应类型
export interface BaseResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  error_code?: string | null;
}

// 分页响应类型
export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// 笔记列表查询参数
export interface XhsNoteQuery {
  keyword?: string;
  user_id?: string;
  note_type?: string;
  task_id?: string;
  source_keyword?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

// 创作者列表查询参数
export interface XhsCreatorQuery {
  keyword?: string;
  sort_by?: string;
  page?: number;
  page_size?: number;
}

// 评论列表查询参数
export interface XhsCommentQuery {
  note_id: string;
  page?: number;
  page_size?: number;
}

// 任务列表查询参数
export interface XhsTaskQuery {
  status?: XhsTaskStatus;
  task_type?: XhsTaskType;
  keyword?: string; // 任务名称关键词搜索
  sort_by?: string; // 排序字段（created_at/updated_at）
  sort_order?: 'asc' | 'desc'; // 排序方向
  page?: number;
  page_size?: number;
}

// 创建任务统一请求类型
export interface CreateXhsTaskRequest {
  name: string; // 任务名称（必填）
  task_type: XhsTaskType;
  schedule_type?: ScheduleType; // 调度类型（默认 immediate）

  // 搜索任务参数
  keywords?: string;
  max_count?: number; // 最大爬取数量 (1-1000)
  start_page?: number; // 起始页码
  sort_type?: SortType; // 排序类型

  // 详情任务参数
  note_urls?: string[];

  // 创作者任务参数
  creator_urls?: string[];

  // 调度配置
  scheduled_time?: string; // 定时执行时间（ISO 8601 格式，用于 once 模式）
  cron_config?: CronConfig; // Cron 配置（用于 cron 模式）

  // 功能配置
  comment_config?: CommentConfig;
  media_download_config?: MediaDownloadConfig;
  post_processing_config?: PostProcessingConfig;

  // 其他配置
  enable_proxy?: boolean;
  enable_resume?: boolean;
  save_to_mongodb?: boolean;
}

// ============ 内容处理结果类型 ============

// 去噪元数据
export interface DenoiseMetadata {
  model?: string;
  processing_time?: number;
  removed_sections?: string[];
  changes_summary?: string;
}

// 去噪后的内容
export interface DenoisedContent {
  has_denoised: boolean;
  denoised_text?: string;
  ai_denoise_metadata?: DenoiseMetadata;
  denoised_at?: string;
}

// 重写元数据
export interface RewriteMetadata {
  model?: string;
  processing_time?: number;
  original_length?: number;
  rewritten_length?: number;
}

// 重写后的内容
export interface RewrittenContent {
  has_rewritten: boolean;
  rewritten_text?: string;
  rewritten_title?: string;
  ai_rewrite_metadata?: RewriteMetadata;
  rewritten_at?: string;
}

// 笔记内容详情（包含处理结果）
export interface NoteContentInfo extends XhsNote {
  // 去噪结果
  denoised_content?: DenoisedContent;

  // 重写结果
  rewritten_content?: RewrittenContent;

  // 关键词提取
  extracted_keywords?: string[];
  keywords_extracted_at?: string;

  // 自动分类
  auto_category?: string;
  classified_at?: string;
}

// AI 功能请求类型
export interface XhsNoteDenoiseRequest {
  note_id: string;
  force_reprocess?: boolean;
  save_to_file?: boolean;
}

export interface XhsNoteRewriteRequest {
  note_id: string;
  force_reprocess?: boolean;
  save_to_file?: boolean;
  auto_denoise?: boolean;
}

// ============ 常量配置 ============

// 调度类型选项
export const SCHEDULE_TYPE_OPTIONS = [
  { label: '立即执行', value: 'immediate' as ScheduleType },
  { label: '定时执行', value: 'once' as ScheduleType },
  { label: '周期执行', value: 'cron' as ScheduleType },
] as const;

// 排序类型选项
export const SORT_TYPE_OPTIONS = [
  { label: '综合排序', value: 'general' as SortType },
  { label: '最热排序', value: 'popularity_descending' as SortType },
  { label: '最新排序', value: 'time_descending' as SortType },
] as const;

// 笔记类型选项
export const XHS_NOTE_TYPE_OPTIONS = [
  { label: '全部', value: undefined },
  { label: '图文', value: 'normal' },
  { label: '视频', value: 'video' },
] as const;

// 排序字段选项
export const XHS_SORT_OPTIONS = [
  { label: '发布时间', value: 'time' },
  { label: '点赞数', value: 'liked_count' },
  { label: '收藏数', value: 'collected_count' },
  { label: '评论数', value: 'comment_count' },
  { label: '更新时间', value: 'last_update_time' },
] as const;

// 排序方向选项
export const XHS_SORT_ORDER_OPTIONS = [
  { label: '降序', value: 'desc' },
  { label: '升序', value: 'asc' },
] as const;

// 任务状态配置
export const XHS_TASK_STATUS_CONFIG = {
  pending: { color: 'default', text: '等待执行' },
  running: { color: 'processing', text: '正在执行' },
  completed: { color: 'success', text: '已完成' },
  failed: { color: 'error', text: '执行失败' },
  cancelled: { color: 'warning', text: '已取消' },
} as const;

// 任务类型配置
export const XHS_TASK_TYPE_CONFIG = {
  search: { color: 'blue', text: '关键词搜索' },
  detail: { color: 'green', text: '笔记详情' },
  creator: { color: 'purple', text: '创作者主页' },
} as const;

// 创作者排序选项
export const XHS_CREATOR_SORT_OPTIONS = [
  { label: '粉丝数', value: 'fans' },
  { label: '关注数', value: 'follows' },
  { label: '互动数', value: 'interaction' },
  { label: '笔记数', value: 'notes_count' },
] as const;
