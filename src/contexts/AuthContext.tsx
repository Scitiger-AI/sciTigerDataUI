"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserInfo, LoginParams } from '@/types/user';
import { getUserInfo, isAuthenticated, setUserInfo, getAccessToken, setAccessToken } from '@/utils/storage';
import { useRouter } from 'next/navigation';
import { App } from 'antd';
import { STORAGE_KEYS } from '@/constants/api';
import { login as apiLogin, logout as apiLogout, getProfile } from '@/services/auth';

// 认证上下文接口
interface AuthContextType {
  user: UserInfo | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isInitializing: boolean; // 新增：初始化状态
  login: (params: LoginParams) => Promise<void>;
  logout: () => Promise<void>;
  updateUserInfo: (userInfo: UserInfo) => void;
  refreshUserInfo: () => Promise<void>;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者属性接口
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 从cookie中读取access_token
 * @returns cookie中的access_token或null
 */
const getTokenFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(STORAGE_KEYS.ACCESS_TOKEN + '=')) {
      return cookie.substring(STORAGE_KEYS.ACCESS_TOKEN.length + 1);
    }
  }
  return null;
};

/**
 * 检查是否需要同步认证状态
 * @returns 是否需要同步
 */
const isAuthSyncNeeded = (): boolean => {
  if (typeof document === 'undefined') return false;
  
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(`${STORAGE_KEYS.AUTH_SYNC_NEEDED}=true`)) {
      // 找到后立即清除该cookie
      document.cookie = `${STORAGE_KEYS.AUTH_SYNC_NEEDED}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
      return true;
    }
  }
  return false;
};

// 认证提供者组件
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // 改为 false，避免初始加载状态
  const [isInitializing, setIsInitializing] = useState<boolean>(true); // 新增：区分初始化状态
  const router = useRouter();
  const { message } = App.useApp();

  // 清除所有认证数据的工具函数
  const clearAllAuthData = () => {
    console.log('🧹 清除所有认证数据...');
    
    // 清除状态
    setUser(null);
    
    // 清除localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_INFO);
      localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
      
      // 清除cookies
      document.cookie = `${STORAGE_KEYS.ACCESS_TOKEN}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
      document.cookie = `${STORAGE_KEYS.REFRESH_TOKEN}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
      document.cookie = `${STORAGE_KEYS.SESSION_ID}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
      document.cookie = `${STORAGE_KEYS.AUTH_SYNC_NEEDED}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
    }
  };

  // 从服务器获取用户信息
  const refreshUserInfo = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // 调用API获取用户信息
      const userInfo = await getProfile();
      // 更新状态和本地存储
      setUser(userInfo);
      setUserInfo(userInfo);
      console.log('✅ 用户信息已刷新', userInfo);
    } catch (error: any) {
      console.error('❌ 获取用户信息失败:', error);
      
      // 如果是401错误，说明token无效，清除所有认证数据
      if (error.response?.status === 401 || error.status === 401) {
        console.log('🔒 Token无效（401错误），清除所有认证数据');
        clearAllAuthData();
        // 如果当前不在登录页面，跳转到登录页面
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          const currentPath = window.location.pathname;
          router.push(`/login?from=${encodeURIComponent(currentPath)}`);
        }
        throw error; // 重新抛出错误，让调用方知道失败了
      }
      
      // 其他错误（如网络错误），尝试从本地存储恢复
      const localUserInfo = getUserInfo();
      if (localUserInfo) {
        console.log('⚠️ 网络错误，从本地存储恢复用户信息');
        setUser(localUserInfo);
      } else {
        // 如果本地也没有用户信息，清除所有数据
        console.log('❌ 本地也没有用户信息，清除所有数据');
        clearAllAuthData();
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 立即从本地存储恢复用户信息（同步操作）
  const restoreUserFromStorage = (): boolean => {
    try {
      console.log('🔍 检查认证状态...');
      
      // 检查认证状态的详细信息
      const localToken = getAccessToken();
      const userInfo = getUserInfo();
      const isAuth = isAuthenticated(); // 这个函数现在包含了token有效性验证
      
      console.log('📊 认证状态详情:', {
        localToken: localToken ? '存在' : '不存在',
        userInfo: userInfo ? '存在' : '不存在',
        isAuthenticated: isAuth
      });
      
      // 如果isAuthenticated返回false，说明token无效或已过期
      if (!isAuth) {
        console.log('❌ Token无效或已过期，清除所有认证数据');
        clearAllAuthData();
        return false;
      }
      
      // 检查是否已认证且有用户信息
      if (userInfo) {
        console.log('✅ 从本地存储恢复用户信息:', userInfo.username);
        setUser(userInfo);
        return true;
      } else {
        console.log('⚠️ 有token但没有用户信息，清除所有认证数据');
        clearAllAuthData();
        return false;
      }
    } catch (error) {
      console.error('❌ 恢复用户信息失败:', error);
      clearAllAuthData();
      return false;
    }
  };

  // 检查用户是否已登录，同时处理localStorage和Cookie不一致的情况
  useEffect(() => {
    // 首先尝试同步恢复用户状态
    const hasRestoredUser = restoreUserFromStorage();
    
    const checkAuth = async () => {
      // 只有在需要网络请求时才设置 isLoading
      try {
        // 标准的认证检查
        if (isAuthenticated()) {
          // 如果标记需要同步，或者从首页重定向过来，则刷新用户信息
          if (isAuthSyncNeeded() || !hasRestoredUser) {
            console.log('🔄 检测到同步标记或需要刷新，刷新用户信息...');
            setIsLoading(true); // 只在实际需要网络请求时设置加载状态
            try {
              await refreshUserInfo();
            } catch (error: any) {
              console.error('❌ 同步用户信息失败:', error);
              // 如果是认证错误，清除所有数据并标记为未初始化
              if (error.response?.status === 401 || error.status === 401) {
                console.log('🔒 认证失败（401错误），清除所有数据');
                clearAllAuthData();
                setIsInitializing(false);
                return;
              }
            } finally {
              setIsLoading(false);
            }
          }
          
          console.log('🔄 AuthContext: 设置 isInitializing = false (已登录用户)');
          setIsInitializing(false);
          return;
        }
        
        // 处理Cookie和localStorage不一致的情况
        const tokenFromCookie = getTokenFromCookie();
        const tokenFromLocalStorage = getAccessToken();
        
        // 如果Cookie中有token但localStorage中没有，或者没有用户信息
        if (tokenFromCookie && (!tokenFromLocalStorage || !getUserInfo())) {
          console.log('🔄 检测到认证状态不一致，尝试同步状态...');
          setIsLoading(true); // 只在实际需要网络请求时设置加载状态
          
          // 将Cookie中的token同步到localStorage
          if (tokenFromCookie && !tokenFromLocalStorage) {
            setAccessToken(tokenFromCookie);
          }
          
          // 尝试从服务器获取用户信息
          try {
            await refreshUserInfo();
          } catch (error: any) {
            console.error('❌ 自动同步用户信息失败:', error);
            // 如果是认证错误，清除所有数据
            if (error.response?.status === 401 || error.status === 401) {
              console.log('🔒 同步失败（401错误），清除所有数据');
              clearAllAuthData();
            }
          } finally {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('❌ 检查认证状态时出错:', error);
      } finally {
        console.log('🔄 AuthContext: 设置 isInitializing = false (异步检查完成)');
        setIsInitializing(false); // 初始化完成
      }
    };

    // 如果没有恢复用户状态，则执行异步检查
    if (!hasRestoredUser) {
      console.log('🔍 未恢复用户状态，执行异步检查...');
      checkAuth();
    } else {
      console.log('✅ 已恢复用户状态，直接结束初始化');
      setIsInitializing(false); // 如果已恢复用户状态，直接结束初始化
    }
    
    // 添加事件监听器，在页面加载和用户从其他页面返回时重新检查认证状态
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth();
      }
    };
    
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // 清理函数
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 登录方法
  const login = async (params: LoginParams): Promise<void> => {
    setIsLoading(true);
    try {
      // 调用真实API
      const userInfo = await apiLogin(params);
      setUser(userInfo);
      message.success('登录成功', 1);
      
      // 获取URL参数中的重定向路径
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get('from') || '/';
      
      // 使用router进行跳转
      setTimeout(() => {
        router.push(redirectTo);
      }, 500);
    } catch (error) {
      // 将错误向上抛出，由组件处理
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 注销方法
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // 调用真实API注销
      await apiLogout();
      setUser(null);
      message.success('已安全退出');
      router.push('/login');
    } catch (error) {
      console.error('注销失败:', error);
      // 即使API调用失败，也要清除本地状态
      setUser(null);
      message.success('已安全退出');
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  // 更新用户信息方法
  const updateUserInfo = (newUserInfo: UserInfo) => {
    setUser(newUserInfo);
    setUserInfo(newUserInfo); // 更新本地存储
  };

  // 上下文值
  const value = {
    user,
    isLoggedIn: !!user,
    isLoading,
    isInitializing,
    login,
    logout,
    updateUserInfo,
    refreshUserInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 使用认证上下文的钩子
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 