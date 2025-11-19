// 小红书API配置
export const XHS_API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_XHS_API_BASE_URL || 'http://127.0.0.1:8010',
} as const;

// 小红书API端点
export const XHS_API_ENDPOINTS = {
  // 任务管理
  TASKS: '/api/v1/xiaohongshu/tasks',
  TASK_DETAIL: (taskId: string) => `/api/v1/xiaohongshu/tasks/${taskId}`,
  TASK_RESULTS: (taskId: string) => `/api/v1/xiaohongshu/tasks/results/${taskId}`,

  // 笔记管理
  ARTICLES: '/api/v1/xiaohongshu/articles',
  ARTICLE_DETAIL: (noteId: string) => `/api/v1/xiaohongshu/articles/${noteId}`,
  ARTICLE_COMMENTS: (noteId: string) => `/api/v1/xiaohongshu/articles/${noteId}/comments`,

  // 创作者管理
  CREATORS: '/api/v1/xiaohongshu/creators',
  CREATOR_CREATE: '/api/v1/xiaohongshu/creators',
  CREATOR_DETAIL: (userId: string) => `/api/v1/xiaohongshu/creators/${userId}`,

  // AI 功能（预留）
  ARTICLE_EXTRACT: (noteId: string) => `/api/v1/xiaohongshu/articles/${noteId}/extract`,
  ARTICLE_DENOISE: (noteId: string) => `/api/v1/xiaohongshu/articles/${noteId}/denoise`,
  ARTICLE_REWRITE: (noteId: string) => `/api/v1/xiaohongshu/articles/${noteId}/rewrite`,
} as const;

// 默认分页配置
export const XHS_DEFAULT_PAGE_CONFIG = {
  PAGE: 1,
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
