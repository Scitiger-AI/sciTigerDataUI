"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Input, 
  Select, 
  Space, 
  Typography, 
  Spin, 
  Empty,
  Modal,
  App,
  Segmented,
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  WechatOutlined,
  ExclamationCircleOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import MainLayout from '@/layout/MainLayout';
import WechatAccountCard from '@/components/wechat/WechatAccountCard';
import WechatAccountForm from '@/components/wechat/WechatAccountForm';
import WechatAccountDetail from '@/components/wechat/WechatAccountDetail';
import ArticleCard from '@/components/article/ArticleCard';
import useWechatAccounts from '@/hooks/useWechatAccounts';
import useArticles from '@/hooks/useArticles';
import { VERIFY_STATUS_OPTIONS, CUSTOMER_TYPE_OPTIONS } from '@/types/wechat';
import { ARTICLE_SORT_OPTIONS, ARTICLE_SORT_ORDER_OPTIONS } from '@/types/article';
import type { WechatAccount, WechatAccountQuery } from '@/types/wechat';
import type { Article, ArticleQuery } from '@/types/article';
import { useRouter, useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

export default function WechatPage() {
  const { modal } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 视图模式：'accounts' | 'articles'
  // 从 URL 参数初始化视图模式
  const [viewMode, setViewMode] = useState<'accounts' | 'articles'>(() => {
    const viewParam = searchParams.get('view');
    return viewParam === 'articles' ? 'articles' : 'accounts';
  });
  
  // 公众号数据管理
  const {
    accounts,
    loading: accountsLoading,
    hasMore: accountsHasMore,
    total: accountsTotal,
    creating,
    updating,
    deleting,
    currentQuery: accountsQuery,
    loadMore: loadMoreAccounts,
    refresh: refreshAccounts,
    search: searchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountDetail,
  } = useWechatAccounts();

  // 文章数据管理
  const {
    articles,
    loading: articlesLoading,
    hasMore: articlesHasMore,
    total: articlesTotal,
    currentQuery: articlesQuery,
    loadMore: loadMoreArticles,
    refresh: refreshArticles,
    search: searchArticles,
  } = useArticles({ autoLoad: true });

  // 公众号视图 - UI状态管理
  const [searchKeyword, setSearchKeyword] = useState('');
  const [verifyStatusFilter, setVerifyStatusFilter] = useState<string | undefined>();
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<WechatAccount | null>(null);
  const [viewingAccount, setViewingAccount] = useState<WechatAccount | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 文章视图 - UI状态管理
  const [articleSearchKeyword, setArticleSearchKeyword] = useState('');
  const [accountBizFilter, setAccountBizFilter] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState('post_time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [isCrawledFilter, setIsCrawledFilter] = useState<boolean | undefined>(undefined);

  // 无限滚动相关
  const accountsListRef = useRef<HTMLDivElement>(null);
  const accountsSentinelRef = useRef<HTMLDivElement>(null);
  const articlesListRef = useRef<HTMLDivElement>(null);
  const articlesSentinelRef = useRef<HTMLDivElement>(null);

  // 监听 URL 参数变化，同步视图模式
  useEffect(() => {
    const viewParam = searchParams.get('view');
    const newViewMode = viewParam === 'articles' ? 'articles' : 'accounts';
    if (newViewMode !== viewMode) {
      setViewMode(newViewMode);
    }
  }, [searchParams, viewMode]);

  // 公众号视图 - 无限滚动观察器
  useEffect(() => {
    if (viewMode !== 'accounts') return;
    
    const sentinel = accountsSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && accountsHasMore && !accountsLoading) {
          loadMoreAccounts();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [viewMode, accountsHasMore, accountsLoading, loadMoreAccounts]);

  // 文章视图 - 无限滚动观察器
  useEffect(() => {
    if (viewMode !== 'articles') return;
    
    const sentinel = articlesSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && articlesHasMore && !articlesLoading) {
          loadMoreArticles();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [viewMode, articlesHasMore, articlesLoading, loadMoreArticles]);

  // ============ 公众号视图 - 处理函数 ============
  
  // 搜索处理
  const handleSearch = useCallback((keyword: string) => {
    const query: WechatAccountQuery = {
      keyword: keyword.trim() || undefined,
      verify_status: verifyStatusFilter,
      customer_type: customerTypeFilter,
    };
    searchAccounts(query);
  }, [verifyStatusFilter, customerTypeFilter, searchAccounts]);

  // 认证状态筛选处理
  const handleVerifyStatusChange = useCallback((value: string | undefined) => {
    setVerifyStatusFilter(value);
    const query: WechatAccountQuery = {
      keyword: searchKeyword.trim() || undefined,
      verify_status: value,
      customer_type: customerTypeFilter,
    };
    searchAccounts(query);
  }, [searchKeyword, customerTypeFilter, searchAccounts]);

  // 客户类型筛选处理
  const handleCustomerTypeChange = useCallback((value: string | undefined) => {
    setCustomerTypeFilter(value);
    const query: WechatAccountQuery = {
      keyword: searchKeyword.trim() || undefined,
      verify_status: verifyStatusFilter,
      customer_type: value,
    };
    searchAccounts(query);
  }, [searchKeyword, verifyStatusFilter, searchAccounts]);

  // 创建公众号
  const handleCreate = useCallback(async (data: any) => {
    const result = await createAccount(data);
    if (result) {
      setFormOpen(false);
    }
  }, [createAccount]);

  // 编辑公众号
  const handleEdit = useCallback((account: WechatAccount) => {
    setEditingAccount(account);
    setFormOpen(true);
  }, []);

  // 更新公众号
  const handleUpdate = useCallback(async (data: any) => {
    if (!editingAccount) return;
    const result = await updateAccount(editingAccount.id, data);
    if (result) {
      setFormOpen(false);
      setEditingAccount(null);
    }
  }, [editingAccount, updateAccount]);

  // 查看详情
  const handleView = useCallback(async (account: WechatAccount) => {
    setDetailLoading(true);
    setDetailOpen(true);
    setViewingAccount(account);
    
    try {
      const detail = await getAccountDetail(account.id);
      if (detail) {
        setViewingAccount(detail);
      }
    } finally {
      setDetailLoading(false);
    }
  }, [getAccountDetail]);

  // 删除公众号
  const handleDelete = useCallback((account: WechatAccount) => {
    modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除公众号"${account.nick_name}"吗？此操作不可恢复。`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        await deleteAccount(account.id);
      },
    });
  }, [deleteAccount, modal]);

  // 关闭表单
  const handleFormClose = useCallback(() => {
    setFormOpen(false);
    setEditingAccount(null);
  }, []);

  // 关闭详情
  const handleDetailClose = useCallback(() => {
    setDetailOpen(false);
    setViewingAccount(null);
  }, []);

  // ============ 文章视图 - 处理函数 ============
  
  // 构建文章查询参数
  const buildArticleQuery = useCallback((): ArticleQuery => {
    const query: ArticleQuery = {
      keyword: articleSearchKeyword.trim() || undefined,
      account_biz: accountBizFilter,
      sort_by: sortBy,
      sort_order: sortOrder,
      is_crawled: isCrawledFilter,
    };

    if (dateRange && dateRange[0] && dateRange[1]) {
      query.start_date = dateRange[0].startOf('day').toISOString();
      query.end_date = dateRange[1].endOf('day').toISOString();
    }

    return query;
  }, [articleSearchKeyword, accountBizFilter, sortBy, sortOrder, dateRange, isCrawledFilter]);

  // 文章搜索处理
  const handleArticleSearch = useCallback((keyword: string) => {
    const query = buildArticleQuery();
    query.keyword = keyword.trim() || undefined;
    searchArticles(query);
  }, [buildArticleQuery, searchArticles]);

  // 公众号筛选处理
  const handleAccountBizChange = useCallback((value: string | undefined) => {
    setAccountBizFilter(value);
    const query = buildArticleQuery();
    query.account_biz = value;
    searchArticles(query);
  }, [buildArticleQuery, searchArticles]);

  // 排序处理
  const handleArticleSortChange = useCallback((field: string) => {
    setSortBy(field);
    const query = buildArticleQuery();
    query.sort_by = field;
    searchArticles(query);
  }, [buildArticleQuery, searchArticles]);

  // 排序方向处理
  const handleArticleSortOrderChange = useCallback((order: 'asc' | 'desc') => {
    setSortOrder(order);
    const query = buildArticleQuery();
    query.sort_order = order;
    searchArticles(query);
  }, [buildArticleQuery, searchArticles]);

  // 日期范围处理
  const handleArticleDateRangeChange = useCallback((dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setDateRange(dates);
    const query = buildArticleQuery();
    if (dates && dates[0] && dates[1]) {
      query.start_date = dates[0].startOf('day').toISOString();
      query.end_date = dates[1].endOf('day').toISOString();
    } else {
      query.start_date = undefined;
      query.end_date = undefined;
    }
    searchArticles(query);
  }, [buildArticleQuery, searchArticles]);

  // 采集状态筛选处理
  const handleArticleCrawledFilterChange = useCallback((value: boolean | undefined) => {
    setIsCrawledFilter(value);
    const query = buildArticleQuery();
    query.is_crawled = value;
    searchArticles(query);
  }, [buildArticleQuery, searchArticles]);

  // 清空文章筛选
  const handleArticleClearFilters = useCallback(() => {
    setArticleSearchKeyword('');
    setAccountBizFilter(undefined);
    setSortBy('post_time');
    setSortOrder('desc');
    setDateRange(null);
    setIsCrawledFilter(undefined);
    
    const query: ArticleQuery = {
      sort_by: 'post_time',
      sort_order: 'desc',
    };
    searchArticles(query);
  }, [searchArticles]);

  // 切换视图模式（同步更新 URL）
  const handleViewModeChange = useCallback((value: string | number) => {
    const newViewMode = value as 'accounts' | 'articles';
    setViewMode(newViewMode);
    
    // 更新 URL 参数
    const params = new URLSearchParams(searchParams.toString());
    if (newViewMode === 'articles') {
      params.set('view', 'articles');
    } else {
      params.delete('view'); // 默认视图不需要参数
    }
    
    const queryString = params.toString();
    router.push(`/crawler-data/wechat${queryString ? '?' + queryString : ''}`);
  }, [router, searchParams]);

  // 查看文章详情
  const handleArticleView = useCallback((article: Article) => {
    router.push(`/crawler-data/wechat/articles/${article.id}`);
  }, [router]);

  // 删除文章后刷新
  const handleArticleDelete = useCallback(() => {
    refreshArticles();
  }, [refreshArticles]);

  return (
    <MainLayout fullWidth>
      <div style={{ padding: '24px' }}>
        {/* 页面标题和操作栏 */}
        <Card>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Title level={2} style={{ margin: 0, marginBottom: '8px' }}>
                  <WechatOutlined style={{ color: '#52c41a', marginRight: '12px' }} />
                  公众号数据管理
                </Title>
                <Text type="secondary">
                  {viewMode === 'accounts' 
                    ? '管理公众号账号信息，支持创建、编辑、删除和查看详情' 
                    : '浏览和管理所有公众号文章，支持搜索和筛选'}
                </Text>
                <div style={{ marginTop: '8px' }}>
                  <Text strong>
                    {viewMode === 'accounts' 
                      ? `总计: ${accountsTotal.toLocaleString()} 个公众号` 
                      : `总计: ${articlesTotal.toLocaleString()} 篇文章`}
                  </Text>
                </div>
              </div>
              <Space>
                {/* 视图切换 */}
                <Segmented
                  value={viewMode}
                  onChange={handleViewModeChange}
                  options={[
                    {
                      label: (
                        <Space>
                          <AppstoreOutlined />
                          <span>账号视图</span>
                        </Space>
                      ),
                      value: 'accounts',
                    },
                    {
                      label: (
                        <Space>
                          <FileTextOutlined />
                          <span>文章视图</span>
                        </Space>
                      ),
                      value: 'articles',
                    },
                  ]}
                />
                <Button
                  icon={<ReloadOutlined />}
                  onClick={viewMode === 'accounts' ? refreshAccounts : refreshArticles}
                  loading={viewMode === 'accounts' ? accountsLoading : articlesLoading}
                >
                  刷新
                </Button>
                {viewMode === 'accounts' && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setFormOpen(true)}
                  >
                    创建公众号
                  </Button>
                )}
                {viewMode === 'articles' && (
                  <Button
                    icon={<FilterOutlined />}
                    onClick={handleArticleClearFilters}
                  >
                    清空筛选
                  </Button>
                )}
              </Space>
            </div>
          </div>

          {/* 搜索和筛选 - 公众号视图 */}
          {viewMode === 'accounts' && (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={8}>
                <Search
                  placeholder="搜索公众号名称、描述或标识"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onSearch={handleSearch}
                />
              </Col>
            </Row>
          )}

          {/* 搜索和筛选 - 文章视图 */}
          {viewMode === 'articles' && (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={8}>
                <Search
                  placeholder="搜索文章标题"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  value={articleSearchKeyword}
                  onChange={(e) => setArticleSearchKeyword(e.target.value)}
                  onSearch={handleArticleSearch}
                />
              </Col>
              
              <Col xs={24} sm={6} lg={4}>
                <Select
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="选择公众号"
                  allowClear
                  showSearch
                  value={accountBizFilter}
                  onChange={handleAccountBizChange}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={[
                    ...accounts.map(acc => ({
                      label: acc.nick_name,
                      value: acc.biz,
                    }))
                  ]}
                />
              </Col>
              
              <Col xs={24} sm={6} lg={4}>
                <Select
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="排序字段"
                  value={sortBy}
                  onChange={handleArticleSortChange}
                  options={[...ARTICLE_SORT_OPTIONS]}
                />
              </Col>
              
              <Col xs={24} sm={6} lg={4}>
                <Select
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="排序方向"
                  value={sortOrder}
                  onChange={handleArticleSortOrderChange}
                  options={[...ARTICLE_SORT_ORDER_OPTIONS]}
                />
              </Col>
              
              <Col xs={24} sm={6} lg={4}>
                <Select
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="采集状态"
                  allowClear
                  value={isCrawledFilter}
                  onChange={handleArticleCrawledFilterChange}
                  options={[
                    { label: '已采集', value: true },
                    { label: '未采集', value: false },
                  ]}
                />
              </Col>
              
              <Col xs={24} sm={12} lg={8}>
                <RangePicker
                  style={{ width: '100%' }}
                  size="large"
                  placeholder={['开始日期', '结束日期']}
                  value={dateRange}
                  onChange={handleArticleDateRangeChange}
                />
              </Col>
            </Row>
          )}
        </Card>

        {/* 公众号账号视图 */}
        {viewMode === 'accounts' && (
          <div ref={accountsListRef} style={{ marginTop: '24px' }}>
            {accounts.length === 0 && !accountsLoading ? (
              <Card>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无公众号数据"
                  style={{ padding: '60px 0' }}
                >
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
                    创建第一个公众号
                  </Button>
                </Empty>
              </Card>
            ) : (
              <Row gutter={[16, 16]}>
                {accounts.map((account) => (
                  <Col key={account.id} xs={24} sm={12} lg={8} xl={6}>
                    <WechatAccountCard
                      account={account}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      loading={deleting}
                    />
                  </Col>
                ))}
              </Row>
            )}

            {/* 加载更多指示器 */}
            <div ref={accountsSentinelRef} style={{ textAlign: 'center', padding: '20px' }}>
              {accountsLoading && (
                <Spin tip="加载中...">
                  <div style={{ height: '60px' }} />
                </Spin>
              )}
              {!accountsLoading && accountsHasMore && accounts.length > 0 && (
                <Button onClick={loadMoreAccounts}>加载更多</Button>
              )}
              {!accountsLoading && !accountsHasMore && accounts.length > 0 && (
                <Text type="secondary">已加载全部数据</Text>
              )}
            </div>
          </div>
        )}

        {/* 文章列表视图 */}
        {viewMode === 'articles' && (
          <div ref={articlesListRef} style={{ marginTop: '24px' }}>
            {articles.length === 0 && !articlesLoading ? (
              <Card>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无文章数据"
                  style={{ padding: '60px 0' }}
                />
              </Card>
            ) : (
              <Row gutter={[16, 16]}>
                {articles.map((article) => (
                  <Col key={article.id} xs={24} sm={12} lg={8} xl={6}>
                    <div style={{ height: '100%' }}>
                      <ArticleCard
                        article={article}
                        onView={handleArticleView}
                        onDelete={handleArticleDelete}
                        loading={articlesLoading}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            )}

            {/* 加载更多指示器 */}
            <div ref={articlesSentinelRef} style={{ textAlign: 'center', padding: '20px' }}>
              {articlesLoading && (
                <Spin tip="加载中...">
                  <div style={{ height: '60px' }} />
                </Spin>
              )}
              {!articlesLoading && articlesHasMore && articles.length > 0 && (
                <Button onClick={loadMoreArticles}>加载更多</Button>
              )}
              {!articlesLoading && !articlesHasMore && articles.length > 0 && (
                <Text type="secondary">已加载全部数据</Text>
              )}
            </div>
          </div>
        )}

        {/* 创建/编辑表单 */}
        <WechatAccountForm
          open={formOpen}
          onCancel={handleFormClose}
          onSubmit={editingAccount ? handleUpdate : handleCreate}
          initialData={editingAccount}
          loading={creating || updating}
        />

        {/* 详情弹窗 */}
        <WechatAccountDetail
          open={detailOpen}
          onCancel={handleDetailClose}
          account={viewingAccount}
          loading={detailLoading}
        />
      </div>
    </MainLayout>
  );
}