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

  // AI 处理状态（预留）
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

// 抖音任务
export interface DouyinTask {
  task_id: string;
  task_type: DouyinTaskType;
  status: DouyinTaskStatus;
  platform?: string;

  // 搜索任务参数
  keywords?: string;
  max_count?: number;
  sort_type?: number;
  publish_time?: number;

  // 详情任务参数
  aweme_ids?: string[];
  aweme_urls?: string[];

  // 创作者任务参数
  user_id?: string;
  creator_url?: string;

  // 评论配置
  comment_config?: {
    enabled: boolean;
    max_per_video?: number;
    max_per_note?: number;
    include_sub_comments?: boolean;
    max_sub_per_comment?: number;
    sort_by?: string;
  };

  // 执行信息
  created_at?: string;
  updated_at?: string;
  started_at?: string;
  completed_at?: string | null;

  // 进度信息
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };

  // 消息和错误
  message?: string;
  error?: string | null;

  // 结果统计
  results_summary?: {
    notes_count: number;
    comments_count: number;
    creators_count: number;
  };

  // 任务配置
  config?: {
    task_type: string;
    keywords?: string | null;
    publish_time_type?: number;
    aweme_ids?: string[] | null;
    user_id?: string | null;
    max_count?: number;
    start_page?: number;
    comment_config?: {
      enabled: boolean;
      max_per_note?: number;
      include_sub_comments?: boolean;
      max_sub_per_comment?: number;
      sort_by?: string;
    };
    save_to_mongodb?: boolean;
    enable_resume?: boolean;
    enable_proxy?: boolean;
    media_download_config?: {
      enabled: boolean;
      download_images?: boolean;
      download_videos?: boolean;
      save_path?: string | null;
      max_image_size_mb?: number;
      max_video_size_mb?: number;
      image_format?: string;
      video_format?: string;
    };
  };

  // 统计信息（兼容旧字段）
  total_videos?: number;
  crawled_videos?: number;
  failed_videos?: number;
  error_message?: string;
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
  status?: DouyinTaskStatus;
  page?: number;
  page_size?: number;
}

// 创建搜索任务请求
export interface CreateDouyinSearchTaskRequest {
  task_type: 'search';
  keywords: string;
  publish_time_type?: number;  // 发布时间过滤: 0(不限) | 1(一天内) | 7(一周内) | 182(半年内)
  max_count?: number;  // 最大采集数量 (1-500)
  start_page?: number;  // 起始页码 (默认1)
  comment_config?: CommentConfig;
  save_to_mongodb?: boolean;  // 是否保存到MongoDB (默认True)
  enable_resume?: boolean;  // 是否启用断点续爬 (默认True)
  enable_proxy?: boolean;  // 是否启用代理 (默认False)
  media_download_config?: MediaDownloadConfig;
}

// 创建详情任务请求
export interface CreateDouyinDetailTaskRequest {
  task_type: 'detail';
  aweme_ids: string[];  // 视频ID列表（必填）
  max_count?: number;  // 最大采集数量 (1-500)
  start_page?: number;  // 起始页码 (默认1)
  comment_config?: CommentConfig;
  save_to_mongodb?: boolean;  // 是否保存到MongoDB (默认True)
  enable_resume?: boolean;  // 是否启用断点续爬 (默认True)
  enable_proxy?: boolean;  // 是否启用代理 (默认False)
  media_download_config?: MediaDownloadConfig;
}

// 创建创作者任务请求（用于创建 creator 类型的采集任务）
export interface CreateDouyinCreatorTaskRequest {
  task_type: 'creator';
  user_id: string;  // 用户ID（必填）
  max_count?: number;  // 最大采集数量 (1-500)
  start_page?: number;  // 起始页码 (默认1)
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

// AI 功能请求类型（预留）
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
  { label: '互动数', value: 'interaction' },
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
