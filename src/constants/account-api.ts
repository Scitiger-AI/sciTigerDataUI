// 账号管理 API 配置（仅用于服务端 API 路由）
export const ACCOUNT_API_CONFIG = {
  BASE_URL: process.env.SCITIGER_SPIDER_API_BASE_URL || 'http://127.0.0.1:8010',
} as const;

// 客户端 API 配置（通过 Next.js API 路由代理）
export const ACCOUNT_CLIENT_CONFIG = {
  BASE_URL: '/api/accounts', // 使用本地 API 路由
} as const;

// 账号管理 API 端点（相对于 /api/accounts 代理路由）
// 路径映射说明：
// - 前端请求: /api/accounts/accounts -> 代理转换 -> 后端: /api/v1/accounts
// - 前端请求: /api/accounts/accounts/{id} -> 代理转换 -> 后端: /api/v1/accounts/{id}
export const ACCOUNT_API_ENDPOINTS = {
  // 账号列表和统计
  ACCOUNTS: '/accounts',  // 完整路径: /api/accounts/accounts -> /api/v1/accounts
  ACCOUNT_DETAIL: (accountId: string) => `/accounts/${accountId}`,
  ACCOUNT_STATS: '/accounts/stats/summary',

  // 账号操作
  ACCOUNT_UPDATE: (accountId: string) => `/accounts/${accountId}`,
  ACCOUNT_DELETE: (accountId: string) => `/accounts/${accountId}`,

  // 健康检查
  HEALTH_CHECK: (accountId: string) => `/accounts/${accountId}/health-check`,
  BATCH_HEALTH_CHECK: '/accounts/health-check/batch',
} as const;

// 默认分页配置
export const ACCOUNT_DEFAULT_PAGE_CONFIG = {
  PAGE: 1,
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
