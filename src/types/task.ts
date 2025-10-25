"use client";

// 任务类型
export type TaskType = 'account_full' | 'account_incremental' | 'single_article';

// 调度类型
export type ScheduleType = 'immediate' | 'once' | 'cron';

// 任务状态
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

// 采集任务基础接口
export interface CrawlTask {
  id: string;
  name: string;
  description?: string;
  task_type: TaskType;
  status: TaskStatus;
  
  // 公众号标识参数
  account_identifier?: string;
  biz?: string;
  wxid?: string;
  nick_name?: string;
  url?: string;
  
  // 爬取配置参数
  max_pages: number;
  enable_denoise: boolean;
  enable_rewrite?: boolean;
  remove_watermark?: boolean;
  enable_proxy: boolean;
  collect_videos?: boolean;
  
  // 调度配置参数
  schedule_type: ScheduleType;
  scheduled_time?: string;
  cron_expression?: string;
  
  // 执行信息
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  
  // 统计信息
  articles_fetched: number;
  articles_crawled: number;
  articles_skipped: number;
  
  // 结果和错误信息
  result?: any;
  error_message?: string;
  
  // 其他执行参数
  priority?: number;
  retry_count?: number;
  max_retries?: number;
}

// 创建任务的请求参数
export interface CreateTaskRequest {
  name: string;
  description?: string;
  task_type: TaskType;
  
  // 公众号标识参数（至少提供一种）
  biz?: string;
  wxid?: string;
  url?: string;
  nick_name?: string;
  
  // 爬取配置参数
  max_pages?: number;
  enable_denoise?: boolean;
  enable_rewrite?: boolean;
  remove_watermark?: boolean;
  enable_proxy?: boolean;
  collect_videos?: boolean;
  
  // 调度配置参数
  schedule_type?: ScheduleType;
  scheduled_time?: string;
  cron_expression?: string;
}

// 更新任务的请求参数
export interface UpdateTaskRequest {
  name?: string;
  description?: string;
  status?: TaskStatus;
  max_pages?: number;
  enable_denoise?: boolean;
  enable_rewrite?: boolean;
  remove_watermark?: boolean;
  enable_proxy?: boolean;
  collect_videos?: boolean;
}

// 任务列表查询参数
export interface TaskListParams {
  page?: number;
  page_size?: number;
  status?: TaskStatus;
  task_type?: TaskType;
  schedule_type?: ScheduleType;
  biz?: string;
}

// 任务列表响应
export interface TaskListResponse {
  success: boolean;
  message: string;
  data: {
    items: CrawlTask[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    pagination?: {
      current_page: number;
      page_size: number;
      total_items: number;
      total_pages: number;
      has_next: boolean;
      has_previous: boolean;
    };
    filters_applied?: {
      status?: string;
      task_type?: string;
      schedule_type?: string;
      biz?: string;
    };
  };
  error_code?: string;
}

// 任务详情响应
export interface TaskDetailResponse {
  success: boolean;
  message: string;
  data: CrawlTask;
  error_code?: string;
}

// 创建任务响应
export interface CreateTaskResponse {
  success: boolean;
  message: string;
  data: CrawlTask;
  error_code?: string;
}

// 执行任务响应
export interface ExecuteTaskResponse {
  success: boolean;
  message: string;
  data: string; // task_id
  error_code?: string;
}

// 删除任务响应
export interface DeleteTaskResponse {
  success: boolean;
  message: string;
  data: string; // task_id
  error_code?: string;
}

// 任务表单数据接口
export interface TaskFormData {
  name: string;
  description: string;
  task_type: TaskType;
  url?: string; // 单篇文章采集时需要
  max_pages: number;
  enable_denoise: boolean;
  enable_rewrite?: boolean;
  enable_proxy: boolean;
  collect_videos?: boolean;
  schedule_type: ScheduleType;
  scheduled_time?: any; // dayjs.Dayjs 对象
  cron_expression?: string;
}

// 任务类型选项配置
export const TASK_TYPE_OPTIONS = [
  { value: 'account_full', label: '完整采集' },
  { value: 'account_incremental', label: '增量采集' },
  { value: 'single_article', label: '单篇文章' },
] as const;

// 调度类型选项配置
export const SCHEDULE_TYPE_OPTIONS = [
  { value: 'immediate', label: '立即采集' },
  { value: 'once', label: '定时采集' },
  { value: 'cron', label: '自动任务' },
] as const;

// 任务状态配置
export const TASK_STATUS_CONFIG = {
  pending: { color: 'default', text: '等待执行' },
  running: { color: 'processing', text: '正在执行' },
  completed: { color: 'success', text: '已完成' },
  failed: { color: 'error', text: '执行失败' },
  cancelled: { color: 'warning', text: '已取消' },
} as const;

// 任务类型配置
export const TASK_TYPE_CONFIG = {
  account_full: { color: 'blue', text: '完整采集' },
  account_incremental: { color: 'green', text: '增量采集' },
  single_article: { color: 'orange', text: '单篇文章' },
} as const;

// 调度类型配置
export const SCHEDULE_TYPE_CONFIG = {
  immediate: { color: 'red', text: '立即采集' },
  once: { color: 'blue', text: '定时采集' },
  cron: { color: 'purple', text: '自动任务' },
} as const;
