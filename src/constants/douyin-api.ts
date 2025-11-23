// 抖音API配置（仅用于服务端API路由）
export const DOUYIN_API_CONFIG = {
  BASE_URL: process.env.SCITIGER_SPIDER_API_BASE_URL || 'http://127.0.0.1:8010',
} as const;

// 客户端API配置（通过Next.js API路由代理）
export const DOUYIN_CLIENT_CONFIG = {
  BASE_URL: '/api/douyin', // 使用本地API路由
} as const;

// 抖音API端点（相对于 /api/douyin 代理路由）
export const DOUYIN_API_ENDPOINTS = {
  // 任务管理
  TASKS: '/tasks',
  TASK_DETAIL: (taskId: string) => `/tasks/${taskId}`,
  TASK_RESULTS: (taskId: string) => `/tasks/${taskId}/results`,  // 🆕 使用新的任务结果接口

  // 视频管理
  VIDEOS: '/videos',
  VIDEO_DETAIL: (awemeId: string) => `/videos/${awemeId}`,
  VIDEO_COMMENTS: (awemeId: string) => `/videos/${awemeId}/comments`,
  VIDEO_DELETE: (awemeId: string) => `/videos/${awemeId}`,
  VIDEO_DOWNLOAD: (awemeId: string) => `/videos/${awemeId}/download`,

  // 创作者管理
  CREATORS: '/creators',
  CREATOR_CREATE: '/creators',
  CREATOR_DETAIL: (userId: string) => `/creators/${userId}`,
  CREATOR_DELETE: (userId: string) => `/creators/${userId}`,

  // 任务管理
  TASK_DELETE: (taskId: string) => `/tasks/${taskId}`,

  // AI 功能（预留）
  VIDEO_EXTRACT_SCRIPT: (awemeId: string) => `/videos/${awemeId}/extract-script`,
  VIDEO_DENOISE: (awemeId: string) => `/videos/${awemeId}/denoise`,
  VIDEO_REWRITE: (awemeId: string) => `/videos/${awemeId}/rewrite`,
} as const;

// 默认分页配置
export const DOUYIN_DEFAULT_PAGE_CONFIG = {
  PAGE: 1,
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
