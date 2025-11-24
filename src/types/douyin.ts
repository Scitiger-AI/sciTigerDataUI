// ============ 抖音视频类型定义 ============

// 下载的视频信息
export interface DownloadedVideo {
  remote_url: string;
  local_path: string;
  file_size: number;
  download_time: number;
  api_url: string;
}

// 下载的图片信息
export interface DownloadedImage {
  remote_url: string;
  local_path: string;
  file_size: number;
  download_time: number;
  api_url: string;
}

// 评论配置
export interface CommentConfig {
  enabled: boolean;
  max_per_note?: number;  // 每条内容最多评论数 (0-500)
  include_sub_comments?: boolean;  // 是否采集二级评论
  max_sub_per_comment?: number;  // 每条一级评论最多二级评论数 (0-50)
  sort_by?: 'hot' | 'time';  // 排序方式: hot(热度) | time(时间)
}

// 媒体下载配置
export interface MediaDownloadConfig {
  enabled: boolean;
  download_images?: boolean;  // 是否下载图片
  download_videos?: boolean;  // 是否下载视频
  save_path?: string | null;  // 保存基础路径
  max_image_size_mb?: number;  // 单张图片最大大小(MB)，范围1-500
  max_video_size_mb?: number;  // 单个视频最大大小(MB)，范围1-5000
  image_format?: string;  // 图片保存格式
  video_format?: string;  // 视频保存格式
}

// 抖音视频内容类型
export interface DouyinVideo {
  id?: string;
  aweme_id: string;
  aweme_type: number | string; // 后端返回数字或字符串
  title?: string;
  desc: string;
  create_time: number;
  user_id: string;
  sec_uid: string;
  short_user_id?: string | null; // 后端字段名
  short_id?: string; // 兼容前端旧字段
  user_unique_id?: string | null;
  user_signature?: string | null;
  nickname: string;
  avatar?: string;

  // 视频信息
  video_id?: string;
  video_type?: string; // 兼容字段，实际使用 aweme_type
  video_play_addr?: string;
  video_cover?: string;
  cover_url?: string; // 后端返回的封面图URL
  video_ratio?: string;
  video_duration?: number;
  video_publish_time?: number;
  video_cover_url?: string; // 兼容字段，实际使用 cover_url

  // 视频链接
  aweme_url?: string; // 视频页面链接
  video_download_url?: string; // 未下载时的视频链接
  downloaded_videos?: DownloadedVideo[]; // 已下载的视频列表
  downloaded_images?: DownloadedImage[]; // 已下载的图片列表

  // 互动数据（后端实际返回的字段）
  liked_count: number | string; // 点赞数（后端返回字符串）
  comment_count: number | string; // 评论数（后端返回字符串）
  share_count: number | string; // 分享数（后端返回字符串）
  collected_count: number | string; // 收藏数（后端字段名）
  collect_count?: number | string; // 兼容前端旧字段

  // 已废弃的字段（后端不提供）
  // aweme_view_count?: number; // 播放数（后端不提供）
  // download_count?: number; // 下载数（后端不提供）
  // forward_count?: number; // 转发数（后端不提供）

  // 标签和音乐
  tag_list?: string[];
  music_id?: string;
  music_title?: string;
  music_author?: string;
  music_download_url?: string; // 音乐下载链接
  note_download_url?: string; // 笔记下载链接

  // 位置信息
  ip_location?: string;

  // 采集信息
  task_id?: string;
  source_keyword?: string;
  crawler_type?: string; // 采集类型
  crawl_time?: string;
  created_at?: string;
  updated_at?: string;
  last_modify_ts?: number; // 最后修改时间戳

  // 媒体下载配置
  media_download_config?: MediaDownloadConfig;

  // 🆕 视频文案处理状态和数据
  transcript_info?: {
    has_transcript: boolean;
    source: string;
    transcript_text: string;
    transcript_segments?: Array<{
      begin_time: number;
      end_time: number;
      text: string;
      channel_id: number;
      emotion_value: number;
    }>;
    word_count: number;
    segment_count?: number;
    asr_metadata?: any;
    extracted_at: string;
    status: string;
  };

  denoised_transcript?: {
    has_denoised: boolean;
    denoised_text: string;
    denoised_length?: number;     // 去噪后字数(可选,后端提供)
    ai_denoise_metadata?: any;
    denoised_at: string;
  };

  rewritten_transcript?: {
    has_rewritten: boolean;
    rewritten_text: string;
    rewritten_length?: number;    // 重写后字数(可选,后端提供)
    ai_rewrite_metadata?: any;
    rewritten_at: string;
    style?: string;
  };

  // AI 处理状态（向后兼容，已废弃）
  ai_script_extracted?: boolean;  // 视频文案提取
  ai_denoised?: boolean;           // AI去噪
  ai_rewritten?: boolean;          // AI重写
  extracted_script?: string;       // 提取的文案
}


// ============ 抖音评论类型定义 ============

// 抖音评论
export interface DouyinComment {
  id?: string;
  comment_id: string;
  aweme_id: string;
  content: string;
  create_time: number;
  ip_location?: string;

  // 用户信息
  user_id: string;
  sec_uid: string;
  short_user_id?: string | null;
  nickname: string;
  avatar?: string; // 后端字段名
  avatar_thumb?: string; // 兼容前端旧字段

  // 互动数据
  like_count?: number; // 后端字段名
  digg_count?: number; // 兼容前端旧字段
  sub_comment_count?: number | string; // 后端字段名（子评论数）
  reply_comment_total?: number; // 兼容前端旧字段

  // 层级信息
  parent_comment_id?: string;
  sub_comments?: DouyinComment[];

  // 其他信息
  user_unique_id?: string | null;
  user_signature?: string | null;
  pictures?: string; // 评论图片
  last_modify_ts?: number; // 最后修改时间戳
  crawl_time?: string;
}

// ============ 抖音创作者类型定义 ============

// 抖音创作者
export interface DouyinCreator {
  id?: string;
  user_id: string;
  sec_uid?: string;
  short_id?: string;
  unique_id?: string;
  nickname: string;
  avatar?: string;
  avatar_168x168?: string;
  avatar_300x300?: string;
  desc?: string;                   // 简介（后端返回的字段名）
  signature?: string;              // 兼容字段，优先使用 desc
  gender?: string;
  ip_location?: string;

  // 统计数据
  fans: number;                    // 粉丝数
  follows?: number;                // 关注数
  interaction: number;             // 总获赞数
  videos_count: number;            // 视频数

  // 认证信息
  custom_verify?: string;
  enterprise_verify_reason?: string;

  // 采集信息
  crawl_time?: string;
  created_at?: string;
  updated_at?: string;
  last_modify_ts?: number;         // 最后修改时间戳
}

// ============ 抖音任务类型定义 ============

// 任务状态
export type DouyinTaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

// 任务类型
export type DouyinTaskType = 'search' | 'detail' | 'creator';

// 调度类型
export type DouyinScheduleType = 'immediate' | 'once' | 'cron';

// 抖音任务
export interface DouyinTask {
  id: string;  // 任务ID
  name: string;  // 任务名称
  task_type: DouyinTaskType;
  status: DouyinTaskStatus;

  // 调度配置
  schedule_type: DouyinScheduleType;
  scheduled_time: string | null;
  cron_expression: string | null;

  // 任务参数（根据任务类型不同而不同）
  keywords?: string;  // 搜索任务的关键词
  aweme_ids?: string[] | null;  // 详情任务的视频ID列表
  creator_id?: string;  // 创作者ID
  max_count?: number;  // 最大采集数量

  // 详细配置
  publish_time_type?: number;
  start_page?: number;
  comment_config?: {
    enabled: boolean;
    max_per_note?: number;
    include_sub_comments?: boolean;
    max_sub_per_comment?: number;
    sort_by?: string;
  };
  media_download_config?: {
    enabled: boolean;
    download_images?: boolean;
    download_videos?: boolean;
    save_path?: string;
    max_image_size_mb?: number;
    max_video_size_mb?: number;
    image_format?: string;
    video_format?: string;
  };
  enable_proxy?: boolean;
  enable_resume?: boolean;
  save_to_mongodb?: boolean;

  // 执行状态
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  error_message: string | null;  // 错误信息

  // 关联信息
  social_collector_task_id: string | null;  // 关联的采集任务ID

  // 结果统计
  results_summary: any;  // 结果统计（灵活类型）

  // 时间信息
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
  last_run_at: string | null;
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

// 视频列表查询参数
export interface DouyinVideoQuery {
  keyword?: string;
  sec_uid?: string;                // 加密用户ID过滤（sec_uid）
  user_id?: string;                 // 用户ID过滤（user_id）
  author_user_id?: string;          // 作者用户ID过滤（author_user_id）
  task_id?: string;
  source_keyword?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

// 创作者列表查询参数
export interface DouyinCreatorQuery {
  keyword?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

// 评论列表查询参数
export interface DouyinCommentQuery {
  aweme_id: string;
  page?: number;
  page_size?: number;
}

// 任务列表查询参数
export interface DouyinTaskQuery {
  keyword?: string;  // 搜索任务名称
  task_type?: DouyinTaskType;  // 任务类型筛选
  status?: DouyinTaskStatus;  // 状态筛选
  schedule_type?: DouyinScheduleType;  // 调度类型筛选
  sort_by?: string;  // 排序字段
  sort_order?: 'asc' | 'desc';  // 排序方向
  page?: number;
  page_size?: number;
}

// 创建搜索任务请求
export interface CreateDouyinSearchTaskRequest {
  name: string;  // 任务名称
  task_type: 'search';
  keywords: string;
  publish_time_type?: number;  // 发布时间过滤: 0(不限) | 1(一天内) | 7(一周内) | 182(半年内)
  max_count?: number;  // 最大采集数量 (1-500)
  start_page?: number;  // 起始页码 (默认1)

  // 调度配置
  schedule_type?: DouyinScheduleType;  // 调度类型 (默认immediate)
  scheduled_time?: string;  // 指定执行时间 (schedule_type=once时必填)
  cron_expression?: string;  // Cron表达式 (schedule_type=cron时必填)

  comment_config?: CommentConfig;
  save_to_mongodb?: boolean;  // 是否保存到MongoDB (默认True)
  enable_resume?: boolean;  // 是否启用断点续爬 (默认True)
  enable_proxy?: boolean;  // 是否启用代理 (默认False)
  media_download_config?: MediaDownloadConfig;
}

// 创建详情任务请求
export interface CreateDouyinDetailTaskRequest {
  name: string;  // 任务名称
  task_type: 'detail';
  aweme_ids: string[];  // 视频ID列表（必填）
  max_count?: number;  // 最大采集数量 (1-500)
  start_page?: number;  // 起始页码 (默认1)

  // 调度配置
  schedule_type?: DouyinScheduleType;  // 调度类型 (默认immediate)
  scheduled_time?: string;  // 指定执行时间 (schedule_type=once时必填)
  cron_expression?: string;  // Cron表达式 (schedule_type=cron时必填)

  comment_config?: CommentConfig;
  save_to_mongodb?: boolean;  // 是否保存到MongoDB (默认True)
  enable_resume?: boolean;  // 是否启用断点续爬 (默认True)
  enable_proxy?: boolean;  // 是否启用代理 (默认False)
  media_download_config?: MediaDownloadConfig;
}

// 创建创作者任务请求（用于创建 creator 类型的采集任务）
export interface CreateDouyinCreatorTaskRequest {
  name: string;  // 任务名称
  task_type: 'creator';
  user_id: string;  // 用户ID（必填）
  max_count?: number;  // 最大采集数量 (1-500)
  start_page?: number;  // 起始页码 (默认1)

  // 调度配置
  schedule_type?: DouyinScheduleType;  // 调度类型 (默认immediate)
  scheduled_time?: string;  // 指定执行时间 (schedule_type=once时必填)
  cron_expression?: string;  // Cron表达式 (schedule_type=cron时必填)

  comment_config?: CommentConfig;
  save_to_mongodb?: boolean;  // 是否保存到MongoDB (默认True)
  enable_resume?: boolean;  // 是否启用断点续爬 (默认True)
  enable_proxy?: boolean;  // 是否启用代理 (默认False)
  media_download_config?: MediaDownloadConfig;
}

// 创建/导入创作者账号请求（用于快速导入创作者信息，不是采集任务）
export interface CreateDouyinCreatorAccountRequest {
  user_id?: string;
  creator_url?: string;
  force_refresh?: boolean;
}

// 🆕 视频文案处理相关类型
export interface TranscriptExtractRequest {
  force_reprocess?: boolean;
}

export interface TranscriptExtractResponse {
  aweme_id: string;
  transcript_text: string;
  word_count: number;
  audio_duration: number;
  processing_time: number;
  cost: number;
}

export interface TranscriptGetResponse {
  type: 'original' | 'denoised' | 'rewritten';
  text: string;
  metadata: any;
}

export interface TranscriptDenoiseRequest {
  force_reprocess?: boolean;
  auto_extract?: boolean;
}

export interface TranscriptDenoiseResponse {
  aweme_id: string;
  original_text: string;
  denoised_text: string;
  original_length: number;
  denoised_length: number;
  reduction_rate: number;
  processing_time: number;
}

export interface TranscriptRewriteRequest {
  force_reprocess?: boolean;
  auto_denoise?: boolean;
  style?: 'natural' | 'formal' | 'casual';
}

export interface TranscriptRewriteResponse {
  aweme_id: string;
  source_text: string;
  rewritten_text: string;
  source_length: number;
  rewritten_length: number;
  length_change_rate: number;
  processing_time: number;
  style: string;
}

// AI 功能请求类型（已废弃，保留向后兼容）
export interface DouyinVideoExtractScriptRequest {
  aweme_id: string;
  force_reprocess?: boolean;
}

export interface DouyinVideoDenoiseRequest {
  aweme_id: string;
  force_reprocess?: boolean;
  save_to_file?: boolean;
}

export interface DouyinVideoRewriteRequest {
  aweme_id: string;
  force_reprocess?: boolean;
  save_to_file?: boolean;
  auto_denoise?: boolean;
}


// ============ 常量配置 ============

// 排序字段选项
export const DOUYIN_SORT_OPTIONS = [
  { label: '发布时间', value: 'create_time' },
  { label: '点赞数', value: 'liked_count' },
  { label: '评论数', value: 'comment_count' },
  { label: '分享数', value: 'share_count' },
  { label: '收藏数', value: 'collect_count' },
] as const;

// 排序方向选项
export const DOUYIN_SORT_ORDER_OPTIONS = [
  { label: '降序', value: 'desc' },
  { label: '升序', value: 'asc' },
] as const;

// 任务状态配置
export const DOUYIN_TASK_STATUS_CONFIG = {
  pending: { color: 'default', text: '等待执行' },
  running: { color: 'processing', text: '正在执行' },
  completed: { color: 'success', text: '已完成' },
  failed: { color: 'error', text: '执行失败' },
  cancelled: { color: 'warning', text: '已取消' },
} as const;

// 任务类型配置
export const DOUYIN_TASK_TYPE_CONFIG = {
  search: { color: 'blue', text: '关键词搜索' },
  detail: { color: 'green', text: '视频详情' },
  creator: { color: 'purple', text: '创作者主页' },
} as const;

// 创作者排序选项
export const DOUYIN_CREATOR_SORT_OPTIONS = [
  { label: '粉丝数', value: 'fans' },
  { label: '关注数', value: 'follows' },
  { label: '获赞数', value: 'interaction' },
  { label: '视频数', value: 'videos_count' },
] as const;

// 搜索排序类型
export const DOUYIN_SEARCH_SORT_OPTIONS = [
  { label: '综合排序', value: 0 },
  { label: '最多点赞', value: 1 },
  { label: '最新发布', value: 2 },
] as const;

// 发布时间筛选
export const DOUYIN_PUBLISH_TIME_OPTIONS = [
  { label: '不限', value: 0 },
  { label: '一天内', value: 1 },
  { label: '一周内', value: 7 },
  { label: '半年内', value: 182 },
] as const;

// 评论排序方式选项
export const DOUYIN_COMMENT_SORT_OPTIONS = [
  { label: '按热度', value: 'hot' },
  { label: '按时间', value: 'time' },
] as const;

// 图片格式选项
export const DOUYIN_IMAGE_FORMAT_OPTIONS = [
  { label: 'JPG', value: 'jpg' },
  { label: 'PNG', value: 'png' },
  { label: 'WEBP', value: 'webp' },
] as const;

// 视频格式选项
export const DOUYIN_VIDEO_FORMAT_OPTIONS = [
  { label: 'MP4', value: 'mp4' },
  { label: 'FLV', value: 'flv' },
] as const;

// 调度类型选项
export const DOUYIN_SCHEDULE_TYPE_OPTIONS = [
  { label: '立即执行', value: 'immediate' },
  { label: '定时执行', value: 'once' },
  { label: '周期执行', value: 'cron' },
] as const;

// 调度类型配置
export const DOUYIN_SCHEDULE_TYPE_CONFIG = {
  immediate: { color: 'red', text: '立即执行' },
  once: { color: 'blue', text: '定时执行' },
  cron: { color: 'purple', text: '周期执行' },
} as const;

// 任务排序选项
export const DOUYIN_TASK_SORT_OPTIONS = [
  { label: '创建时间', value: 'created_at' },
  { label: '完成时间', value: 'completed_at' },
  { label: '视频数', value: 'results_summary.notes_count' },
  { label: '评论数', value: 'results_summary.comments_count' },
] as const;
