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
  Modal,
  Checkbox,
} from 'antd';
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { DouyinCreator, DouyinVideo, DouyinVideoQuery } from '@/types/douyin';
import DouyinCreatorDetail from '@/components/douyin/DouyinCreatorDetail';
import DouyinVideoCard from '@/components/douyin/DouyinVideoCard';
import douyinService from '@/services/douyin';
import MainLayout from '@/layout/MainLayout';

const { Title, Text } = Typography;

function DouyinCreatorDetailPageContent() {
  const { message, modal } = App.useApp();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [creator, setCreator] = useState<DouyinCreator | null>(null);
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

  const userId = params.id as string;

  // 加载创作者详情
  const loadCreatorDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await douyinService.getCreatorDetail(userId);
      if (response.success && response.data) {
        setCreator(response.data);
      } else {
        message.error('获取创作者详情失败');
      }
    } catch (error: any) {
      console.error('加载创作者详情失败:', error);
      message.error(error.message || '加载创作者详情失败');
    } finally {
      setLoading(false);
    }
  }, [userId, message]);

  // 加载创作者视频列表
  const loadCreatorVideos = useCallback(async (append = false, secUid?: string) => {
    const targetSecUid = secUid || creator?.sec_uid;
    if (!targetSecUid) {
      return;
    }

    setVideosLoading(true);
    try {
      // 使用 ref 获取当前页码，避免依赖 videosPage 状态
      const currentPage = append ? videosPageRef.current + 1 : 1;
      
      const query: DouyinVideoQuery = {
        sec_uid: targetSecUid,
        sort_by: 'create_time',
        sort_order: 'desc',
        page: currentPage,
        page_size: 20,
      };

      const response = await douyinService.getVideos(query);

      if (response.success && response.data) {
        const newVideos = response.data.items || [];
        setVideos(prev => append ? [...prev, ...newVideos] : newVideos);
        setVideosTotal(response.data.total || 0);
        
        // 更新页码状态和 ref
        const nextPage = append ? currentPage : 1;
        setVideosPage(nextPage);
        videosPageRef.current = nextPage;
        
        setVideosHasMore(newVideos.length === 20);
      }
    } catch (error: any) {
      console.error('加载视频列表失败:', error);
      message.error(error.message || '加载视频列表失败');
    } finally {
      setVideosLoading(false);
    }
  }, [creator?.sec_uid, message]);

  // 刷新数据
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // 刷新创作者详情
      const response = await douyinService.getCreatorDetail(userId);
      if (response.success && response.data) {
        setCreator(response.data);
        // 刷新视频列表（重置页码并重新加载）
        if (response.data.sec_uid) {
          setVideosPage(1);
          videosPageRef.current = 1;
          await loadCreatorVideos(false, response.data.sec_uid);
        }
        message.success('数据刷新成功');
      } else {
        message.error('获取创作者详情失败');
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
    // 从 URL 参数获取视图模式，如果没有则默认为 'creators'
    const viewParam = searchParams.get('view') || 'creators';
    router.push(`/crawler-data/douyin?view=${viewParam}`);
  };

  // 处理视频点击（携带来源信息）
  const handleVideoClick = useCallback((video: DouyinVideo) => {
    if (video.aweme_id) {
      const viewParam = searchParams.get('view') || 'creators';
      router.push(`/crawler-data/douyin/videos/${video.aweme_id}?from=creator&creatorId=${userId}&view=${viewParam}`);
    }
  }, [router, userId, searchParams]);

  // 处理视频删除
  const handleVideoDelete = useCallback((video: DouyinVideo) => {
    const awemeId = video.aweme_id || video.id;
    if (!awemeId) {
      message.error('视频ID不存在');
      return;
    }

    let deleteComments = true;
    let deleteFiles = false;

    modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <p style={{ marginBottom: 8 }}>确定要删除视频吗？此操作不可恢复。</p>
            <p style={{ fontSize: '12px', color: '#999' }}>
              视频标题: {video.title || video.desc || '无标题'}
            </p>
          </div>
          <Checkbox 
            defaultChecked={true}
            onChange={(e) => { deleteComments = e.target.checked; }}
          >
            同时删除关联的评论数据
          </Checkbox>
          <Checkbox 
            defaultChecked={false}
            onChange={(e) => { deleteFiles = e.target.checked; }}
          >
            同时删除本地文件（视频和图片文件）
          </Checkbox>
        </Space>
      ),
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await douyinService.deleteVideo(awemeId, {
            delete_comments: deleteComments,
            delete_files: deleteFiles,
          });

          if (response.success) {
            message.success('视频删除成功');
            // 从列表中移除
            setVideos(prev => prev.filter(v => (v.aweme_id || v.id) !== awemeId));
            setVideosTotal(prev => Math.max(0, prev - 1));
          } else {
            message.error(response.message || '删除视频失败');
          }
        } catch (error: any) {
          console.error('删除视频失败:', error);
          const errorMessage = error?.message || error?.data?.detail || '删除视频时发生错误';
          message.error(errorMessage);
        }
      },
    });
  }, [modal, message]);

  // 页面初始化
  useEffect(() => {
    if (userId) {
      loadCreatorDetail();
    }
  }, [userId, loadCreatorDetail]);

  // 当创作者数据加载完成后，加载视频列表
  useEffect(() => {
    if (creator?.sec_uid) {
      // 重置页码
      setVideosPage(1);
      videosPageRef.current = 1;
      // 只依赖 sec_uid，不依赖 loadCreatorVideos，避免重复触发
      loadCreatorVideos(false, creator.sec_uid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creator?.sec_uid]); // 只在 sec_uid 变化时加载

  // 视频列表 - 无限滚动观察器
  useEffect(() => {
    const sentinel = videosSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && videosHasMore && !videosLoading && creator?.sec_uid) {
          loadCreatorVideos(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [videosHasMore, videosLoading, creator?.sec_uid, loadCreatorVideos]);

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

  if (!creator) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Title level={4}>创作者不存在</Title>
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
              {creator.nickname} - 详情管理
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

        {/* 创作者详细信息 */}
        <Card title="创作者信息" style={{ marginBottom: '24px' }}>
          <DouyinCreatorDetail creator={creator} loading={false} />
        </Card>

        {/* 创作者视频列表 */}
        <Card title={`视频列表 (共 ${videosTotal} 个)`}>
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
                  <Button onClick={() => loadCreatorVideos(true)}>加载更多</Button>
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
export default function DouyinCreatorDetailPage() {
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
      <DouyinCreatorDetailPageContent />
    </Suspense>
  );
}

