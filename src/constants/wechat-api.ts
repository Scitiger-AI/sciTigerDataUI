// 公众号API配置（仅用于服务端API路由）
export const WECHAT_API_CONFIG = {
  BASE_URL: process.env.SCITIGER_SPIDER_API_BASE_URL || 'http://127.0.0.1:8010',
  API_KEY: process.env.SCITIGER_SPIDER_API_KEY || '',
} as const;

// 客户端API配置（通过Next.js API路由代理）
export const WECHAT_CLIENT_CONFIG = {
  BASE_URL: '/api/wechat', // 使用本地API路由
} as const;

// 公众号API端点（相对于 /api/wechat 代理路由）
export const WECHAT_API_ENDPOINTS = {
  // 公众号管理
  ACCOUNTS: '/accounts',
  ACCOUNT_DETAIL: (accountId: string) => `/accounts/${accountId}`,
  ACCOUNT_CREATE: '/accounts',
  ACCOUNT_UPDATE: (accountId: string) => `/accounts/${accountId}`,
  ACCOUNT_DELETE: (accountId: string) => `/accounts/${accountId}`,
} as const;

// 默认分页配置
export const DEFAULT_PAGE_CONFIG = {
  PAGE: 1,
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
