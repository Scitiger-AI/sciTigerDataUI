"use client";

import http from '@/utils/http';
import { API_ENDPOINTS } from '@/constants/api';
import { ApiResponse } from '@/types/api';
import { LoginParams, LoginResponse, UserInfo, RegisterParams, RegisterResponse, RegisterResult, RefreshTokenResponse } from '@/types/user';
import { setAccessToken, setRefreshToken, setUserInfo, clearAuthStorage, getRefreshToken } from '@/utils/storage';

/**
 * 用户登录
 * @param params 登录参数
 * @returns 登录响应
 */
export const login = async (params: LoginParams): Promise<UserInfo> => {
  try {
    console.log('开始登录请求，参数：', params.username);
    const response = await http.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, params);
    const { success, results, message } = response.data;
    
    if (success && results) {
      console.log('登录成功，保存认证信息');
      
      // 存储认证信息 - 兼容两种响应格式
      const accessToken = results.access_token || results.tokens?.access;
      const refreshToken = results.refresh_token || results.tokens?.refresh;
      
      if (accessToken && refreshToken) {
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
      } else {
        throw new Error('登录响应中缺少访问令牌');
      }
      
      // 提取用户信息
      const { user } = results;
      
      // 构建用户信息对象
      const userInfo: UserInfo = {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        is_active: user.is_active,
        is_staff: user.is_staff || false,
        is_admin: user.is_admin || false,
        avatar: user.avatar || '',
        last_login: user.last_login,
      };
      
      // 存储用户信息
      console.log('存储用户信息:', userInfo);
      setUserInfo(userInfo);
      
      // 设置同步标记，确保其他标签页也能感知登录状态
      document.cookie = 'auth_sync_needed=true;path=/;max-age=60;SameSite=Lax';
      
      return userInfo;
    } else {
      console.error('登录失败:', message);
      throw new Error(message || '登录失败');
    }
  } catch (error: any) {
    console.error('登录请求异常:', error);
    throw error;
  }
};



/**
 * 用户注销
 */
export const logout = async (): Promise<void> => {
  try {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      // 调用后端注销接口，传递refresh token
      await http.post(API_ENDPOINTS.AUTH.LOGOUT, {
        refresh: refreshToken
      });
    }
  } catch (error) {
    console.error('注销失败:', error);
  } finally {
    // 无论是否成功都清除本地存储
    clearAuthStorage();
  }
};

/**
 * 刷新访问令牌
 * @returns 新的访问令牌
 */
export const refreshAccessToken = async (): Promise<string> => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('刷新令牌不存在');
    }

    const response = await http.post<RefreshTokenResponse>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      { refresh: refreshToken }
    );

    const { success, results, message } = response.data;
    if (success && results) {
      // 兼容两种响应格式
      const accessToken = results.access_token || results.tokens?.access;
      const newRefreshToken = results.refresh_token || results.tokens?.refresh;
      
      if (accessToken && newRefreshToken) {
        setAccessToken(accessToken);
        setRefreshToken(newRefreshToken);
        return accessToken;
      } else {
        throw new Error('刷新令牌响应格式错误');
      }
    } else {
      throw new Error(message || '刷新令牌失败');
    }
  } catch (error) {
    console.error('刷新令牌失败:', error);
    // 清除认证状态
    clearAuthStorage();
    throw error;
  }
};

/**
 * 获取用户个人资料
 * @returns 用户信息
 */
export const getProfile = async (): Promise<UserInfo> => {
  console.log('开始获取用户个人资料');
  try {
    const response = await http.get<ApiResponse<UserInfo>>(API_ENDPOINTS.AUTH.USER_INFO);
    const { success, results, message } = response.data;
    
    if (success && results) {
      console.log('获取个人资料成功:', results);
      // 更新本地存储的用户信息
      setUserInfo(results);
      return results;
    } else {
      console.error('获取个人资料失败:', message);
      throw new Error(message || '获取个人资料失败');
    }
  } catch (error) {
    console.error('获取个人资料请求异常:', error);
    throw error;
  }
};