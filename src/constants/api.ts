// API基础URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

// WebSocket基础URL
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://127.0.0.1:8081';

// 租户ID
export const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || '1f7433fe-cd15-4440-b7be-76ea45141864';

// API端点
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/api/platform/auth/login/',
    LOGOUT: '/api/platform/auth/logout/',
    REFRESH_TOKEN: '/api/platform/auth/refresh-token/',
    PROFILE: '/api/platform/auth/users/userInfo/',
    USER_INFO: '/api/platform/auth/users/userInfo/',
    CHANGE_PASSWORD: '/api/platform/auth/users/{user_id}/change_password/',
  },
  // 用户相关
  USER: {
    INFO: '/api/platform/auth/users/userInfo/',
    UPDATE: '/api/platform/auth/users/{user_id}/',
    UPDATE_SETTINGS: '/api/platform/auth/settings/',
  },
};

// WebSocket端点
export const WS_ENDPOINTS = {
};

// 本地存储键名
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'scitiger_data_ui_access_token',
  REFRESH_TOKEN: 'scitiger_data_ui_refresh_token',
  USER_INFO: 'scitiger_data_ui_user_info',
  SESSION_ID: 'scitiger_data_ui_session_id',
  AUTH_SYNC_NEEDED: 'scitiger_data_ui_auth_sync_needed',
}; 