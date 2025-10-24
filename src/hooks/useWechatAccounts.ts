"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { App } from 'antd';
import wechatService from '@/services/wechat';
import { DEFAULT_PAGE_CONFIG } from '@/constants/wechat-api';
import type {
  WechatAccount,
  WechatAccountQuery,
  CreateWechatAccountRequest,
  UpdateWechatAccountRequest,
} from '@/types/wechat';

interface UseWechatAccountsOptions {
  initialQuery?: WechatAccountQuery;
  pageSize?: number;
}

interface UseWechatAccountsResult {
  // 数据状态
  accounts: WechatAccount[];
  loading: boolean;
  hasMore: boolean;
  total: number;
  
  // 操作状态
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  
  // 查询状态
  currentQuery: WechatAccountQuery;
  
  // 操作方法
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  search: (query: WechatAccountQuery) => Promise<void>;
  createAccount: (data: CreateWechatAccountRequest) => Promise<WechatAccount | null>;
  updateAccount: (id: string, data: UpdateWechatAccountRequest) => Promise<WechatAccount | null>;
  deleteAccount: (id: string) => Promise<boolean>;
  getAccountDetail: (id: string) => Promise<WechatAccount | null>;
}

export const useWechatAccounts = (options: UseWechatAccountsOptions = {}): UseWechatAccountsResult => {
  const { message } = App.useApp();
  const {
    initialQuery = {},
    pageSize = DEFAULT_PAGE_CONFIG.PAGE_SIZE,
  } = options;

  // 状态管理
  const [accounts, setAccounts] = useState<WechatAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(DEFAULT_PAGE_CONFIG.PAGE);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentQuery, setCurrentQuery] = useState<WechatAccountQuery>(initialQuery);

  // 计算是否还有更多数据
  const hasMore = useMemo(() => {
    return currentPage < totalPages;
  }, [currentPage, totalPages]);

  // 加载公众号列表
  const loadAccounts = useCallback(async (
    query: WechatAccountQuery = {},
    page: number = DEFAULT_PAGE_CONFIG.PAGE,
    append: boolean = false
  ) => {
    setLoading(true);
    try {
      const response = await wechatService.getAccounts({
        ...query,
        page,
        page_size: pageSize,
      });

      if (response.success) {
        const newAccounts = response.data.items;
        setAccounts(prev => append ? [...prev, ...newAccounts] : newAccounts);
        setTotal(response.data.total);
        setCurrentPage(response.data.page);
        setTotalPages(response.data.total_pages);
      } else {
        message.error(response.message || '获取公众号列表失败');
      }
    } catch (error) {
      console.error('加载公众号列表失败:', error);
      message.error('加载公众号列表失败');
    } finally {
      setLoading(false);
    }
  }, [pageSize, message]);

  // 加载更多数据
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    const nextPage = currentPage + 1;
    await loadAccounts(currentQuery, nextPage, true);
  }, [loading, hasMore, currentPage, currentQuery, loadAccounts]);

  // 刷新数据
  const refresh = useCallback(async () => {
    setCurrentPage(DEFAULT_PAGE_CONFIG.PAGE);
    await loadAccounts(currentQuery, DEFAULT_PAGE_CONFIG.PAGE, false);
  }, [currentQuery, loadAccounts]);

  // 搜索
  const search = useCallback(async (query: WechatAccountQuery) => {
    setCurrentQuery(query);
    setCurrentPage(DEFAULT_PAGE_CONFIG.PAGE);
    await loadAccounts(query, DEFAULT_PAGE_CONFIG.PAGE, false);
  }, [loadAccounts]);

  // 创建公众号
  const createAccount = useCallback(async (data: CreateWechatAccountRequest): Promise<WechatAccount | null> => {
    setCreating(true);
    try {
      const response = await wechatService.createAccount(data);
      if (response.success) {
        message.success('公众号创建成功');
        // 刷新列表
        await refresh();
        return response.data;
      } else {
        message.error(response.message || '创建公众号失败');
        return null;
      }
    } catch (error: any) {
      console.error('创建公众号失败:', error);
      
      // 提取详细的错误信息
      let errorMessage = '创建公众号失败';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.detail) {
        errorMessage = typeof error.detail === 'string' 
          ? error.detail 
          : '创建公众号失败';
      } else if (error?.data?.detail) {
        errorMessage = typeof error.data.detail === 'string' 
          ? error.data.detail 
          : '创建公众号失败';
      }
      
      message.error(errorMessage);
      return null;
    } finally {
      setCreating(false);
    }
  }, [message, refresh]);

  // 更新公众号
  const updateAccount = useCallback(async (
    id: string, 
    data: UpdateWechatAccountRequest
  ): Promise<WechatAccount | null> => {
    setUpdating(true);
    try {
      const response = await wechatService.updateAccount(id, data);
      if (response.success) {
        message.success('公众号更新成功');
        // 更新本地状态
        setAccounts(prev => prev.map(account => 
          account.id === id ? response.data : account
        ));
        return response.data;
      } else {
        message.error(response.message || '更新公众号失败');
        return null;
      }
    } catch (error: any) {
      console.error('更新公众号失败:', error);
      
      // 提取详细的错误信息
      let errorMessage = '更新公众号失败';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.detail) {
        errorMessage = typeof error.detail === 'string' 
          ? error.detail 
          : '更新公众号失败';
      } else if (error?.data?.detail) {
        errorMessage = typeof error.data.detail === 'string' 
          ? error.data.detail 
          : '更新公众号失败';
      }
      
      message.error(errorMessage);
      return null;
    } finally {
      setUpdating(false);
    }
  }, [message]);

  // 删除公众号
  const deleteAccount = useCallback(async (id: string): Promise<boolean> => {
    setDeleting(true);
    try {
      const response = await wechatService.deleteAccount(id);
      if (response.success) {
        message.success('公众号删除成功');
        // 从本地状态中移除
        setAccounts(prev => prev.filter(account => account.id !== id));
        setTotal(prev => prev - 1);
        return true;
      } else {
        message.error(response.message || '删除公众号失败');
        return false;
      }
    } catch (error: any) {
      console.error('删除公众号失败:', error);
      
      // 提取详细的错误信息
      let errorMessage = '删除公众号失败';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.detail) {
        errorMessage = typeof error.detail === 'string' 
          ? error.detail 
          : '删除公众号失败';
      } else if (error?.data?.detail) {
        errorMessage = typeof error.data.detail === 'string' 
          ? error.data.detail 
          : '删除公众号失败';
      }
      
      message.error(errorMessage);
      return false;
    } finally {
      setDeleting(false);
    }
  }, [message]);

  // 获取公众号详情
  const getAccountDetail = useCallback(async (id: string): Promise<WechatAccount | null> => {
    try {
      const response = await wechatService.getAccountDetail(id);
      if (response.success) {
        return response.data;
      } else {
        message.error(response.message || '获取公众号详情失败');
        return null;
      }
    } catch (error: any) {
      console.error('获取公众号详情失败:', error);
      
      // 提取详细的错误信息
      let errorMessage = '获取公众号详情失败';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.detail) {
        errorMessage = typeof error.detail === 'string' 
          ? error.detail 
          : '获取公众号详情失败';
      } else if (error?.data?.detail) {
        errorMessage = typeof error.data.detail === 'string' 
          ? error.data.detail 
          : '获取公众号详情失败';
      }
      
      message.error(errorMessage);
      return null;
    }
  }, [message]);

  // 初始化加载
  useEffect(() => {
    loadAccounts(initialQuery);
  }, []);

  return {
    // 数据状态
    accounts,
    loading,
    hasMore,
    total,
    
    // 操作状态
    creating,
    updating,
    deleting,
    
    // 查询状态
    currentQuery,
    
    // 操作方法
    loadMore,
    refresh,
    search,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountDetail,
  };
};

export default useWechatAccounts;
