"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  Spin,
  Typography,
  Button,
  Space,
  Row,
  Col,
  Empty,
  App,
} from 'antd';
import {
  ArrowLeftOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { DouyinTask, DouyinVideo } from '@/types/douyin';
import DouyinTaskDetail from '@/components/douyin/DouyinTaskDetail';
import DouyinVideoCard from '@/components/douyin/DouyinVideoCard';
import douyinService from '@/services/douyin';
import MainLayout from '@/layout/MainLayout';

const { Title, Text } = Typography;

function DouyinTaskDetailPageContent() {
  const { message } = App.useApp();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [task, setTask] = useState<DouyinTask | null>(null);
  const [videos, setVideos] = useState<DouyinVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [videosTotal, setVideosTotal] = useState(0);
  const [videosPage, setVideosPage] = useState(1);
  const [videosHasMore, setVideosHasMore] = useState(true);
  // 使用 ref 存储当前页码，避免在 useCallback 依赖中包含它
  const videosPageRef = useRef(1);
  // 无限滚动相关 - 哨兵元素 ref
  const videosSentinelRef = useRef<HTMLDivElement>(null);

  const taskId = params.id as string;

  // 加载任务详情
  const loadTaskDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await douyinService.getTaskDetail(taskId);
      if (response.success && response.data) {
        setTask(response.data);
      } else {
        message.error('获取任务详情失败');
      }
    } catch (error: any) {
      console.error('加载任务详情失败:', error);
      message.error(error.message || '加载任务详情失败');
    } finally {
      setLoading(false);
    }
  }, [taskId, message]);

  // 加载任务视频列表
  const loadTaskVideos = useCallback(async (append = false) => {
    if (!taskId) {
      return;
    }

    setVideosLoading(true);
    try {
      // 使用 ref 获取当前页码，避免依赖 videosPage 状态
      const currentPage = append ? videosPageRef.current + 1 : 1;

      // 🆕 直接使用 taskId (sciTigerSpider 的任务 ID)
      // 新接口内部会自动通过 social_collector_task_id 查询快照
      const response = await douyinService.getTaskResults(taskId, currentPage, 20);

      if (response.success && response.data) {
        const newVideos = response.data.items || [];
        const total = response.data.total || 0;
        setVideos(prev => append ? [...prev, ...newVideos] : newVideos);
        setVideosTotal(total);

        // 更新页码状态和 ref
        const nextPage = append ? currentPage : 1;
        setVideosPage(nextPage);
        videosPageRef.current = nextPage;

        // 判断是否还有更多数据
        const currentCount = append ? videos.length + newVideos.length : newVideos.length;
        setVideosHasMore(newVideos.length === 20 && currentCount < total);
      }
    } catch (error: any) {
      console.error('加载视频列表失败:', error);
      message.error(error.message || '加载视频列表失败');
    } finally {
      setVideosLoading(false);
    }
  }, [taskId, videos.length, message]);

  // 刷新数据
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // 刷新任务详情
      const response = await douyinService.getTaskDetail(taskId);
      if (response.success && response.data) {
        setTask(response.data);
        // 刷新视频列表（重置页码并重新加载）
        setVideosPage(1);
        videosPageRef.current = 1;
        await loadTaskVideos(false);
        message.success('数据刷新成功');
      } else {
        message.error('获取任务详情失败');
      }
    } catch (error: any) {
      console.error('刷新数据失败:', error);
      message.error(error.message || '数据刷新失败');
    } finally {
      setRefreshing(false);
    }
  };

  // 返回列表页（保留视图状态）
  const handleGoBack = () => {
    // 从 URL 参数获取视图模式，如果没有则默认为 'tasks'
    const viewParam = searchParams.get('view') || 'tasks';
    router.push(`/crawler-data/douyin?view=${viewParam}`);
  };

  // 处理视频点击（携带来源信息）
  const handleVideoClick = useCallback((video: DouyinVideo) => {
    if (video.aweme_id) {
      const viewParam = searchParams.get('view') || 'tasks';
      router.push(`/crawler-data/douyin/videos/${video.aweme_id}?from=task&taskId=${taskId}&view=${viewParam}`);
    }
  }, [router, taskId, searchParams]);

  // 处理视频删除
  const handleVideoDelete = useCallback((video: DouyinVideo) => {
    const awemeId = video.aweme_id || video.id;
    if (!awemeId) {
      message.error('视频ID不存在');
      return;
    }

    // 简单的删除确认
    message.info('删除功能待实现');
  }, [message]);

  // 页面初始化
  useEffect(() => {
    if (taskId) {
      loadTaskDetail();
    }
  }, [taskId, loadTaskDetail]);

  // 当任务数据加载完成后，加载视频列表
  useEffect(() => {
    if (taskId && !loading) {
      // 重置页码
      setVideosPage(1);
      videosPageRef.current = 1;
      // 只依赖 taskId 和 loading，避免重复触发
      loadTaskVideos(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, loading]); // 只在 taskId 或 loading 变化时加载

  // 视频列表 - 无限滚动观察器
  useEffect(() => {
    const sentinel = videosSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && videosHasMore && !videosLoading && taskId) {
          loadTaskVideos(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [videosHasMore, videosLoading, taskId, loadTaskVideos]);

  if (loading) {
    return (
      <MainLayout>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}>
          <Spin size="large" tip="加载中...">
            <div style={{ padding: '50px', background: '#f5f5f5', minWidth: '200px' }}>
              {/* 空内容区域 */}
            </div>
          </Spin>
        </div>
      </MainLayout>
    );
  }

  if (!task) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Title level={4}>任务不存在</Title>
          <Button type="primary" onClick={handleGoBack}>
            返回列表
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        {/* 页面头部 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          padding: '24px 0'
        }}>
          <Space size="middle">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleGoBack}
            >
              返回列表
            </Button>
            <Title level={3} style={{ margin: 0 }}>
              任务详情 - {task.name}
            </Title>
          </Space>

          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={refreshing}
            >
              刷新
            </Button>
          </Space>
        </div>

        {/* 任务详细信息 */}
        <Card title="任务信息" style={{ marginBottom: '24px' }}>
          <DouyinTaskDetail task={task} loading={false} />
        </Card>

        {/* 任务视频列表 */}
        <Card title={`采集的视频列表 (共 ${videosTotal} 个)`}>
          {videos.length === 0 && !videosLoading ? (
            <Empty description="暂无视频数据" />
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {videos.map((video) => (
                  <Col key={video.aweme_id || video.id} xs={24} sm={12} lg={8} xl={6}>
                    <div style={{ height: '100%' }}>
                      <DouyinVideoCard
                        video={video}
                        onView={handleVideoClick}
                        onDelete={handleVideoDelete}
                        loading={videosLoading}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
              {/* 加载更多指示器 */}
              <div ref={videosSentinelRef} style={{ textAlign: 'center', padding: '20px' }}>
                {videosLoading && (
                  <Spin tip="加载中...">
                    <div style={{ height: '60px' }} />
                  </Spin>
                )}
                {!videosLoading && videosHasMore && videos.length > 0 && (
                  <Button onClick={() => loadTaskVideos(true)}>加载更多</Button>
                )}
                {!videosLoading && !videosHasMore && videos.length > 0 && (
                  <Text type="secondary">已加载全部数据</Text>
                )}
              </div>
            </>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}

// 导出的主组件，使用 Suspense 包裹
export default function DouyinTaskDetailPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}>
          <Spin size="large" tip="加载中...">
            <div style={{ padding: '50px', background: '#f5f5f5', minWidth: '200px' }}>
              {/* 空内容区域 */}
            </div>
          </Spin>
        </div>
      </MainLayout>
    }>
      <DouyinTaskDetailPageContent />
    </Suspense>
  );
}

