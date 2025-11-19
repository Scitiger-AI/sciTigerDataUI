// 抖音API配置
export const DOUYIN_API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_DOUYIN_API_BASE_URL || 'http://127.0.0.1:8010',
} as const;

// 抖音API端点
export const DOUYIN_API_ENDPOINTS = {
  // 任务管理
  TASKS: '/api/v1/douyin/tasks',
  TASK_DETAIL: (taskId: string) => `/api/v1/douyin/tasks/${taskId}`,
  TASK_RESULTS: (taskId: string) => `/api/v1/douyin/tasks/results/${taskId}`,

  // 视频管理
  VIDEOS: '/api/v1/douyin/videos',
  VIDEO_DETAIL: (awemeId: string) => `/api/v1/douyin/videos/${awemeId}`,
  VIDEO_COMMENTS: (awemeId: string) => `/api/v1/douyin/videos/${awemeId}/comments`,
  VIDEO_DELETE: (awemeId: string) => `/api/v1/douyin/videos/${awemeId}`,

  // 创作者管理
  CREATORS: '/api/v1/douyin/creators',
  CREATOR_CREATE: '/api/v1/douyin/creators',
  CREATOR_DETAIL: (userId: string) => `/api/v1/douyin/creators/${userId}`,
  CREATOR_DELETE: (userId: string) => `/api/v1/douyin/creators/${userId}`,

  // 任务管理
  TASK_DELETE: (taskId: string) => `/api/v1/douyin/tasks/${taskId}`,

  // AI 功能（预留）
  VIDEO_EXTRACT_SCRIPT: (awemeId: string) => `/api/v1/douyin/videos/${awemeId}/extract-script`,
  VIDEO_DENOISE: (awemeId: string) => `/api/v1/douyin/videos/${awemeId}/denoise`,
  VIDEO_REWRITE: (awemeId: string) => `/api/v1/douyin/videos/${awemeId}/rewrite`,
} as const;

// 默认分页配置
export const DOUYIN_DEFAULT_PAGE_CONFIG = {
  PAGE: 1,
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
