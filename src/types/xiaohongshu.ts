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

// 小红书任务
export interface XhsTask {
  task_id: string;
  task_type: XhsTaskType;
  status: XhsTaskStatus;

  // 搜索任务参数
  keywords?: string;
  max_count?: number;
  sort?: string;
  note_type?: number;

  // 详情任务参数
  note_ids?: string[];
  note_urls?: string[];

  // 创作者任务参数
  user_id?: string;
  creator_url?: string;

  // 评论配置
  comment_config?: {
    enabled: boolean;
    max_per_note?: number;
  };

  // 执行信息
  created_at?: string;
  started_at?: string;
  completed_at?: string;

  // 统计信息
  total_notes?: number;
  crawled_notes?: number;
  failed_notes?: number;

  error_message?: string;
  progress?: number;
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
  page?: number;
  page_size?: number;
}

// 创建搜索任务请求
export interface CreateXhsSearchTaskRequest {
  task_type: 'search';
  keywords: string;
  max_count?: number;
  sort?: string;
  note_type?: number;
  comment_config?: {
    enabled: boolean;
    max_per_note?: number;
  };
}

// 创建详情任务请求
export interface CreateXhsDetailTaskRequest {
  task_type: 'detail';
  note_ids?: string[];
  note_urls?: string[];
  comment_config?: {
    enabled: boolean;
    max_per_note?: number;
  };
}

// 创建创作者任务请求
export interface CreateXhsCreatorTaskRequest {
  user_id?: string;
  creator_url?: string;
  force_refresh?: boolean;
}

// AI 功能请求类型（预留）
export interface XhsNoteExtractRequest {
  note_id: string;
  force_reprocess?: boolean;
}

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
