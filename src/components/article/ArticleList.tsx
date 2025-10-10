import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  DatePicker,
  App,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import ArticleCard from './ArticleCard';
import useArticles, { useAccountArticles } from '@/hooks/useArticles';
import { ARTICLE_SORT_OPTIONS, ARTICLE_SORT_ORDER_OPTIONS } from '@/types/article';
import type { Article, ArticleQuery } from '@/types/article';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

interface ArticleListProps {
  accountBiz?: string;
  accountName?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  onArticleClick?: (article: Article) => void;
  className?: string;
  style?: React.CSSProperties;
}

const ArticleList: React.FC<ArticleListProps> = ({
  accountBiz,
  accountName,
  showSearch = true,
  showFilters = true,
  onArticleClick,
  className,
  style,
}) => {
  const { message } = App.useApp();
  
  // 使用不同的Hook根据是否有accountBiz
  const articlesHook = accountBiz 
    ? useAccountArticles(accountBiz, { autoLoad: true })
    : useArticles({ autoLoad: true });

  const {
    articles,
    loading,
    hasMore,
    total,
    currentQuery,
    loadMore,
    refresh,
    search,
  } = articlesHook;

  // 搜索和筛选状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState('post_time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [isCrawledFilter, setIsCrawledFilter] = useState<boolean | undefined>(undefined);

  // 无限滚动相关
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 无限滚动观察器
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  // 构建查询参数
  const buildQuery = useCallback((): ArticleQuery => {
    const query: ArticleQuery = {
      keyword: searchKeyword.trim() || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      is_crawled: isCrawledFilter,
    };

    if (dateRange && dateRange[0] && dateRange[1]) {
      query.start_date = dateRange[0].startOf('day').toISOString();
      query.end_date = dateRange[1].endOf('day').toISOString();
    }

    return query;
  }, [searchKeyword, sortBy, sortOrder, dateRange, isCrawledFilter]);

  // 搜索处理
  const handleSearch = useCallback((keyword: string) => {
    const query = buildQuery();
    query.keyword = keyword.trim() || undefined;
    search(query);
  }, [buildQuery, search]);

  // 排序处理
  const handleSortChange = useCallback((field: string) => {
    setSortBy(field);
    const query = buildQuery();
    query.sort_by = field;
    search(query);
  }, [buildQuery, search]);

  // 排序方向处理
  const handleSortOrderChange = useCallback((order: 'asc' | 'desc') => {
    setSortOrder(order);
    const query = buildQuery();
    query.sort_order = order;
    search(query);
  }, [buildQuery, search]);

  // 日期范围处理
  const handleDateRangeChange = useCallback((dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setDateRange(dates);
    const query = buildQuery();
    if (dates && dates[0] && dates[1]) {
      query.start_date = dates[0].startOf('day').toISOString();
      query.end_date = dates[1].endOf('day').toISOString();
    } else {
      query.start_date = undefined;
      query.end_date = undefined;
    }
    search(query);
  }, [buildQuery, search]);

  // 采集状态筛选处理
  const handleCrawledFilterChange = useCallback((value: boolean | undefined) => {
    setIsCrawledFilter(value);
    const query = buildQuery();
    query.is_crawled = value;
    search(query);
  }, [buildQuery, search]);

  // 文章点击处理
  const handleArticleClick = useCallback((article: Article) => {
    if (onArticleClick) {
      onArticleClick(article);
    }
  }, [onArticleClick]);

  // 文章删除处理
  const handleArticleDelete = useCallback((articleId: string) => {
    // 删除成功后刷新列表
    refresh();
  }, [refresh]);

  // 清空筛选
  const handleClearFilters = useCallback(() => {
    setSearchKeyword('');
    setSortBy('post_time');
    setSortOrder('desc');
    setDateRange(null);
    setIsCrawledFilter(undefined);
    
    const query: ArticleQuery = {
      sort_by: 'post_time',
      sort_order: 'desc',
    };
    search(query);
  }, [search]);

  return (
    <div className={className} style={style}>
      {/* 搜索和筛选区域 */}
      {(showSearch || showFilters) && (
        <Card style={{ marginBottom: '24px' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* 标题和统计 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  <FileTextOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                  {accountName ? `${accountName} - 文章列表` : '文章列表'}
                </Title>
                <Text type="secondary">
                  总计: {total.toLocaleString()} 篇文章
                </Text>
              </div>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={refresh}
                  loading={loading}
                >
                  刷新
                </Button>
                <Button
                  icon={<FilterOutlined />}
                  onClick={handleClearFilters}
                >
                  清空筛选
                </Button>
              </Space>
            </div>

            {/* 搜索和筛选控件 */}
            <Row gutter={[16, 16]}>
              {showSearch && (
                <Col xs={24} sm={12} lg={8}>
                  <Search
                    placeholder="搜索文章标题"
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onSearch={handleSearch}
                  />
                </Col>
              )}
              
              {showFilters && (
                <>
                  <Col xs={24} sm={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      placeholder="排序字段"
                      value={sortBy}
                      onChange={handleSortChange}
                      options={[...ARTICLE_SORT_OPTIONS]}
                    />
                  </Col>
                  
                  <Col xs={24} sm={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      placeholder="排序方向"
                      value={sortOrder}
                      onChange={handleSortOrderChange}
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
                      onChange={handleCrawledFilterChange}
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
                      onChange={handleDateRangeChange}
                    />
                  </Col>
                </>
              )}
            </Row>
          </Space>
        </Card>
      )}

      {/* 文章列表 */}
      <div ref={listRef}>
        {articles.length === 0 && !loading ? (
          <Card>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无文章数据"
              style={{ padding: '60px 0' }}
            />
          </Card>
        ) : (
          <Row gutter={[16, 16]} align="stretch">
            {articles.map((article) => (
              <Col 
                key={article.id} 
                xs={24} 
                sm={12} 
                lg={8} 
                xl={6}
              >
                <div style={{ height: '100%' }}>
                  <ArticleCard
                    article={article}
                    onView={handleArticleClick}
                    onDelete={handleArticleDelete}
                    loading={loading}
                  />
                </div>
              </Col>
            ))}
          </Row>
        )}

        {/* 加载更多指示器 */}
        <div ref={sentinelRef} style={{ textAlign: 'center', padding: '20px' }}>
          {loading && (
            <Spin tip="加载中...">
              <div style={{ height: '60px' }} />
            </Spin>
          )}
          {!loading && hasMore && articles.length > 0 && (
            <Button onClick={loadMore}>加载更多</Button>
          )}
          {!loading && !hasMore && articles.length > 0 && (
            <Text type="secondary">已加载全部数据</Text>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleList;
