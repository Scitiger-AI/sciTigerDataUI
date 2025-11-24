"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  Spin,
  Typography,
  Button,
  Space,
  App,
} from 'antd';
import {
  ArrowLeftOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { DouyinVideo } from '@/types/douyin';
import DouyinVideoDetail from '@/components/douyin/DouyinVideoDetail';
import douyinService from '@/services/douyin';
import MainLayout from '@/layout/MainLayout';


const { Title } = Typography;

function DouyinVideoDetailPageContent() {
  const { message } = App.useApp();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [video, setVideo] = useState<DouyinVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 路由参数实际上是 aweme_id
  const awemeId = params.id as string;

  // 加载视频详情
  const loadVideoDetail = useCallback(async () => {
    try {
      setLoading(true);
      // 直接通过 aweme_id 获取视频详情
      try {
        const detailResponse = await douyinService.getVideoDetail(awemeId);
        if (detailResponse.success && detailResponse.data) {
          setVideo(detailResponse.data);
        } else {
          message.error('获取视频详情失败');
        }
      } catch (detailError: any) {
        console.error('获取视频详情失败:', detailError);
        // 如果直接获取详情失败，尝试从列表中找到
        let foundVideo: DouyinVideo | null = null;
        let page = 1;
        const pageSize = 50;

        while (!foundVideo && page <= 10) {
          try {
            const listResponse = await douyinService.getVideos({
              page,
              page_size: pageSize,
            });

            if (listResponse.success && listResponse.data) {
              foundVideo = listResponse.data.items.find((v) => v.aweme_id === awemeId) || null;

              if (foundVideo) {
                setVideo(foundVideo);
                break;
              }

              // 如果当前页没有找到，且还有更多数据，继续搜索
              if (listResponse.data.items.length < pageSize) {
                break; // 没有更多数据了
              }
              page++;
            } else {
              break;
            }
          } catch (listError) {
            console.error('搜索视频列表失败:', listError);
            break;
          }
        }

        if (!foundVideo) {
          message.error('视频不存在');
        }
      }
    } catch (error: any) {
      console.error('加载视频详情失败:', error);
      message.error('加载视频详情失败');
    } finally {
      setLoading(false);
    }
  }, [awemeId, message]);

  // 刷新数据
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadVideoDetail();
      message.success('数据刷新成功');
    } catch (error) {
      message.error('数据刷新失败');
    } finally {
      setRefreshing(false);
    }
  };

  // 根据来源决定返回路径（与微信模块实现一致）
  const handleGoBack = () => {
    const from = searchParams.get('from');
    const creatorId = searchParams.get('creatorId');
    const taskId = searchParams.get('taskId');
    const view = searchParams.get('view');

    // 如果来自创作者详情页，返回创作者详情页
    if (from === 'creator' && creatorId) {
      router.push(`/crawler-data/douyin/creators/${creatorId}?view=${view || 'creators'}`);
    } else if (from === 'task' && taskId) {
      // 如果来自任务详情页，返回任务详情页
      router.push(`/crawler-data/douyin/tasks/${taskId}?view=${view || 'tasks'}`);
    } else {
      // 否则返回视频列表（保留视图状态）
      const listView = view || 'videos';
      router.push(`/crawler-data/douyin?view=${listView}`);
    }
  };

  // 动态显示返回按钮文本
  const from = searchParams.get('from');
  const backButtonText = from === 'creator'
    ? '返回创作者详情'
    : from === 'task'
      ? '返回任务详情'
      : '返回列表';

  // 页面初始化
  useEffect(() => {
    if (awemeId) {
      loadVideoDetail();
    }
  }, [awemeId, loadVideoDetail]);

  if (loading) {
    return (
      <MainLayout>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
          }}
        >
          <Spin size="large" tip="加载中...">
            <div style={{ padding: '50px', background: '#f5f5f5', minWidth: '200px' }}>
              {/* 空内容区域 */}
            </div>
          </Spin>
        </div>
      </MainLayout>
    );
  }

  if (!video) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Title level={4}>视频不存在</Title>
          <Button type="primary" onClick={handleGoBack}>
            {backButtonText}
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        {/* 页面头部 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            padding: '24px 0',
          }}
        >
          <Space size="middle">
            <Button icon={<ArrowLeftOutlined />} onClick={handleGoBack}>
              {backButtonText}
            </Button>
            <Title level={3} style={{ margin: 0 }}>
              {video.title || video.desc || '视频详情'}
            </Title>
          </Space>

          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={refreshing}>
              刷新
            </Button>
          </Space>
        </div>

        {/* 视频详情 */}
        <Card>
          <DouyinVideoDetail
            video={video}
            loading={false}
            showActions={false}
            onRefresh={loadVideoDetail}
          />
        </Card>
      </div>
    </MainLayout>
  );
}


// 导出的主组件，使用 Suspense 包裹
export default function DouyinVideoDetailPage() {
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
      <DouyinVideoDetailPageContent />
    </Suspense>
  );
}

