import { useState, useCallback, useRef, useEffect } from 'react';
import { articleService } from '@/services/article';
import type {
  Article,
  ArticleQuery,
  ArticleContentFormat,
  ArticleContent,
} from '@/types/article';

interface UseArticlesOptions {
  initialQuery?: ArticleQuery;
  autoLoad?: boolean;
}

interface UseArticlesReturn {
  // 数据状态
  articles: Article[];
  loading: boolean;
  hasMore: boolean;
  total: number;
  currentQuery: ArticleQuery;
  
  // 操作方法
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  search: (query: ArticleQuery) => Promise<void>;
  getArticleDetail: (articleId: string) => Promise<Article | null>;
  getArticleContent: (articleId: string, format?: ArticleContentFormat) => Promise<ArticleContent | null>;
}

export default function useArticles(options: UseArticlesOptions = {}): UseArticlesReturn {
  const { initialQuery = {}, autoLoad = true } = options;
  
  // 状态管理
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentQuery, setCurrentQuery] = useState<ArticleQuery>(initialQuery);
  
  // 分页状态
  const currentPageRef = useRef(1);
  const isLoadingRef = useRef(false);

  // 加载文章列表
  const loadArticles = useCallback(async (query: ArticleQuery, append = false) => {
    if (isLoadingRef.current) return;
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      
      const response = await articleService.getArticles(query);
      
      if (response.success && response.data) {
        const { items, total: totalCount, page, total_pages } = response.data;
        
        if (append) {
          setArticles(prev => [...prev, ...items]);
        } else {
          setArticles(items);
        }
        
        setTotal(totalCount);
        setHasMore(page < total_pages);
        currentPageRef.current = page;
      }
    } catch (error) {
      console.error('加载文章列表失败:', error);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  // 加载更多
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    
    const nextPage = currentPageRef.current + 1;
    const query = {
      ...currentQuery,
      page: nextPage,
    };
    
    await loadArticles(query, true);
  }, [currentQuery, hasMore, loading, loadArticles]);

  // 刷新数据
  const refresh = useCallback(async () => {
    currentPageRef.current = 1;
    setHasMore(true);
    await loadArticles(currentQuery, false);
  }, [currentQuery, loadArticles]);

  // 搜索文章
  const search = useCallback(async (query: ArticleQuery) => {
    const searchQuery = {
      ...query,
      page: 1,
    };
    
    setCurrentQuery(searchQuery);
    currentPageRef.current = 1;
    setHasMore(true);
    await loadArticles(searchQuery, false);
  }, [loadArticles]);

  // 获取文章详情
  const getArticleDetail = useCallback(async (articleId: string): Promise<Article | null> => {
    try {
      const response = await articleService.getArticleDetail(articleId);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('获取文章详情失败:', error);
      return null;
    }
  }, []);

  // 获取文章内容
  const getArticleContent = useCallback(async (
    articleId: string, 
    format: ArticleContentFormat = 'markdown'
  ): Promise<ArticleContent | null> => {
    try {
      const content = await articleService.getArticleContent(articleId, format);
      return content;
    } catch (error) {
      console.error('获取文章内容失败:', error);
      return null;
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    if (autoLoad) {
      loadArticles(initialQuery, false);
    }
  }, []); // 只在组件挂载时执行一次

  return {
    articles,
    loading,
    hasMore,
    total,
    currentQuery,
    loadMore,
    refresh,
    search,
    getArticleDetail,
    getArticleContent,
  };
}

// 专门用于公众号文章列表的Hook
export function useAccountArticles(accountBiz: string, options: UseArticlesOptions = {}) {
  const accountQuery: ArticleQuery = {
    account_biz: accountBiz,
    is_crawled: true, // 只显示已爬取的文章
    sort_by: 'post_time',
    sort_order: 'desc',
    page_size: 20,
    ...options.initialQuery,
  };

  return useArticles({
    ...options,
    initialQuery: accountQuery,
  });
}
