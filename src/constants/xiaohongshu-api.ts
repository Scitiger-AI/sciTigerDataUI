// 小红书API配置(仅用于服务端API路由)
export const XHS_API_CONFIG = {
  BASE_URL: process.env.SCITIGER_SPIDER_API_BASE_URL || 'http://127.0.0.1:8010',
} as const;

// 客户端API配置(通过Next.js API路由代理)
export const XHS_CLIENT_CONFIG = {
  BASE_URL: '/api/xiaohongshu', // 使用本地API路由
} as const;

// 小红书API端点(相对于 /api/xiaohongshu 代理路由)
export const XHS_API_ENDPOINTS = {
  // 任务管理
  TASKS: '/tasks',
  TASK_DETAIL: (taskId: string) => `/tasks/${taskId}`,
  TASK_RESULTS: (taskId: string) => `/tasks/${taskId}/results`,
  TASK_DELETE: (taskId: string) => `/tasks/${taskId}`,
  TASK_CANCEL: (taskId: string) => `/tasks/${taskId}/cancel`,

  // 笔记管理
  ARTICLES: '/articles',
  ARTICLE_DETAIL: (noteId: string) => `/articles/${noteId}`,
  ARTICLE_COMMENTS: (noteId: string) => `/articles/${noteId}/comments`,
  ARTICLE_DELETE: (noteId: string) => `/articles/${noteId}`,
  ARTICLE_DOWNLOAD: (noteId: string) => `/articles/${noteId}/download`,

  // 创作者管理
  CREATORS: '/creators',
  CREATOR_CREATE: '/creators',
  CREATOR_DETAIL: (userId: string) => `/creators/${userId}`,
  CREATOR_DELETE: (userId: string) => `/creators/${userId}`,

  // AI 功能
  ARTICLE_EXTRACT: (noteId: string) => `/articles/${noteId}/extract`,
  ARTICLE_DENOISE: (noteId: string) => `/articles/${noteId}/denoise`,
  ARTICLE_REWRITE: (noteId: string) => `/articles/${noteId}/rewrite`,
} as const;

// 默认分页配置
export const XHS_DEFAULT_PAGE_CONFIG = {
  PAGE: 1,
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
