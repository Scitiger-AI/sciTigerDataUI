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
import type { XhsTask, XhsNote } from '@/types/xiaohongshu';
import XhsTaskDetail from '@/components/xiaohongshu/XhsTaskDetail';
import XhsNoteCard from '@/components/xiaohongshu/XhsNoteCard';
import xiaohongshuService from '@/services/xiaohongshu';
import MainLayout from '@/layout/MainLayout';

const { Title, Text } = Typography;

function XhsTaskDetailPageContent() {
  const { message } = App.useApp();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [task, setTask] = useState<XhsTask | null>(null);
  const [notes, setNotes] = useState<XhsNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notesTotal, setNotesTotal] = useState(0);
  const [notesPage, setNotesPage] = useState(1);
  const [notesHasMore, setNotesHasMore] = useState(true);
  // 使用 ref 存储当前页码，避免在 useCallback 依赖中包含它
  const notesPageRef = useRef(1);
  // 无限滚动相关 - 哨兵元素 ref
  const notesSentinelRef = useRef<HTMLDivElement>(null);

  const taskId = params.id as string;

  // 加载任务详情
  const loadTaskDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await xiaohongshuService.getTaskDetail(taskId);
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

  // 加载任务笔记列表
  const loadTaskNotes = useCallback(async (append = false) => {
    if (!taskId) {
      return;
    }

    setNotesLoading(true);
    try {
      // 使用 ref 获取当前页码，避免依赖 notesPage 状态
      const currentPage = append ? notesPageRef.current + 1 : 1;

      // 直接使用 taskId 查询任务结果
      const response = await xiaohongshuService.getTaskResults(taskId, currentPage, 20);

      if (response.success && response.data) {
        const newNotes = response.data.items || [];
        const total = response.data.total || 0;
        setNotes(prev => append ? [...prev, ...newNotes] : newNotes);
        setNotesTotal(total);

        // 更新页码状态和 ref
        const nextPage = append ? currentPage : 1;
        setNotesPage(nextPage);
        notesPageRef.current = nextPage;

        // 判断是否还有更多数据
        const currentCount = append ? notes.length + newNotes.length : newNotes.length;
        setNotesHasMore(newNotes.length === 20 && currentCount < total);
      }
    } catch (error: any) {
      console.error('加载笔记列表失败:', error);
      message.error(error.message || '加载笔记列表失败');
    } finally {
      setNotesLoading(false);
    }
  }, [taskId, notes.length, message]);

  // 刷新数据
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // 刷新任务详情
      const response = await xiaohongshuService.getTaskDetail(taskId);
      if (response.success && response.data) {
        setTask(response.data);
        // 刷新笔记列表（重置页码并重新加载）
        setNotesPage(1);
        notesPageRef.current = 1;
        await loadTaskNotes(false);
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
    router.push(`/crawler-data/xiaohongshu?view=${viewParam}`);
  };

  // 处理笔记点击（携带来源信息）
  const handleNoteClick = useCallback((note: XhsNote) => {
    if (note.note_id) {
      const viewParam = searchParams.get('view') || 'tasks';
      router.push(`/crawler-data/xiaohongshu/notes/${note.note_id}?from=task&taskId=${taskId}&view=${viewParam}`);
    }
  }, [router, taskId, searchParams]);

  // 处理笔记删除
  const handleNoteDelete = useCallback((note: XhsNote) => {
    const noteId = note.note_id || note.id;
    if (!noteId) {
      message.error('笔记ID不存在');
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

  // 当任务数据加载完成后，加载笔记列表
  useEffect(() => {
    if (taskId && !loading) {
      // 重置页码
      setNotesPage(1);
      notesPageRef.current = 1;
      // 只依赖 taskId 和 loading，避免重复触发
      loadTaskNotes(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, loading]); // 只在 taskId 或 loading 变化时加载

  // 笔记列表 - 无限滚动观察器
  useEffect(() => {
    const sentinel = notesSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && notesHasMore && !notesLoading && taskId) {
          loadTaskNotes(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [notesHasMore, notesLoading, taskId, loadTaskNotes]);

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
          <XhsTaskDetail task={task} loading={false} />
        </Card>

        {/* 任务笔记列表 */}
        <Card title={`采集的笔记列表 (共 ${notesTotal} 篇)`}>
          {notes.length === 0 && !notesLoading ? (
            <Empty description="暂无笔记数据" />
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {notes.map((note) => (
                  <Col key={note.note_id || note.id} xs={24} sm={12} lg={8} xl={6}>
                    <div style={{ height: '100%' }}>
                      <XhsNoteCard
                        note={note}
                        onView={handleNoteClick}
                        onDelete={handleNoteDelete}
                        loading={notesLoading}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
              {/* 加载更多指示器 */}
              <div ref={notesSentinelRef} style={{ textAlign: 'center', padding: '20px' }}>
                {notesLoading && (
                  <Spin tip="加载中...">
                    <div style={{ height: '60px' }} />
                  </Spin>
                )}
                {!notesLoading && notesHasMore && notes.length > 0 && (
                  <Button onClick={() => loadTaskNotes(true)}>加载更多</Button>
                )}
                {!notesLoading && !notesHasMore && notes.length > 0 && (
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
export default function XhsTaskDetailPage() {
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
      <XhsTaskDetailPageContent />
    </Suspense>
  );
}
