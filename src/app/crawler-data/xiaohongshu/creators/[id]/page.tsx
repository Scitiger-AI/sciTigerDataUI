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
import type { XhsCreator, XhsNote, XhsNoteQuery } from '@/types/xiaohongshu';
import XhsCreatorDetail from '@/components/xiaohongshu/XhsCreatorDetail';
import XhsNoteCard from '@/components/xiaohongshu/XhsNoteCard';
import xiaohongshuService from '@/services/xiaohongshu';
import MainLayout from '@/layout/MainLayout';

const { Title, Text } = Typography;

function XhsCreatorDetailPageContent() {
  const { message, modal } = App.useApp();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [creator, setCreator] = useState<XhsCreator | null>(null);
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

  const userId = params.id as string;

  // 加载创作者详情
  const loadCreatorDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await xiaohongshuService.getCreatorDetail(userId);
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

  // 加载创作者笔记列表
  const loadCreatorNotes = useCallback(async (append = false, targetUserId?: string) => {
    const userIdToQuery = targetUserId || creator?.user_id;
    if (!userIdToQuery) {
      return;
    }

    setNotesLoading(true);
    try {
      // 使用 ref 获取当前页码，避免依赖 notesPage 状态
      const currentPage = append ? notesPageRef.current + 1 : 1;

      const query: XhsNoteQuery = {
        // 注意：后端可能不支持 user_id 查询参数
        // 如果不支持，这里会返回所有笔记
        // TODO: 后端需要添加 user_id 过滤支持
        keyword: undefined,
        note_type: undefined,
        sort_by: 'time',
        sort_order: 'desc',
        page: currentPage,
        page_size: 20,
      };

      const response = await xiaohongshuService.getNotes(query);

      if (response.success && response.data) {
        const newNotes = response.data.items || [];
        // 前端过滤：只保留该创作者的笔记
        const filteredNotes = newNotes.filter(note => note.user_id === userIdToQuery);

        setNotes(prev => append ? [...prev, ...filteredNotes] : filteredNotes);
        setNotesTotal(filteredNotes.length);

        // 更新页码状态和 ref
        const nextPage = append ? currentPage : 1;
        setNotesPage(nextPage);
        notesPageRef.current = nextPage;

        setNotesHasMore(filteredNotes.length === 20);
      }
    } catch (error: any) {
      console.error('加载笔记列表失败:', error);
      message.error(error.message || '加载笔记列表失败');
    } finally {
      setNotesLoading(false);
    }
  }, [creator?.user_id, message]);

  // 刷新数据
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // 刷新创作者详情
      const response = await xiaohongshuService.getCreatorDetail(userId);
      if (response.success && response.data) {
        setCreator(response.data);
        // 刷新笔记列表（重置页码并重新加载）
        if (response.data.user_id) {
          setNotesPage(1);
          notesPageRef.current = 1;
          await loadCreatorNotes(false, response.data.user_id);
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
    router.push(`/crawler-data/xiaohongshu?view=${viewParam}`);
  };

  // 处理笔记点击（携带来源信息）
  const handleNoteClick = useCallback((note: XhsNote) => {
    if (note.note_id) {
      const viewParam = searchParams.get('view') || 'creators';
      router.push(`/crawler-data/xiaohongshu/notes/${note.note_id}?from=creator&creatorId=${userId}&view=${viewParam}`);
    }
  }, [router, userId, searchParams]);

  // 处理笔记删除
  const handleNoteDelete = useCallback((note: XhsNote) => {
    const noteId = note.note_id || note.id;
    if (!noteId) {
      message.error('笔记ID不存在');
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
            <p style={{ marginBottom: 8 }}>确定要删除笔记吗？此操作不可恢复。</p>
            <p style={{ fontSize: '12px', color: '#999' }}>
              笔记标题: {note.title || note.desc || '无标题'}
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
            同时删除本地文件（图片和视频文件）
          </Checkbox>
        </Space>
      ),
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await xiaohongshuService.deleteNote(noteId, {
            delete_comments: deleteComments,
            delete_files: deleteFiles,
          });

          if (response.success) {
            message.success('笔记删除成功');
            // 从列表中移除
            setNotes(prev => prev.filter(n => (n.note_id || n.id) !== noteId));
            setNotesTotal(prev => Math.max(0, prev - 1));
          } else {
            message.error('删除笔记失败');
          }
        } catch (error: any) {
          console.error('删除笔记失败:', error);
          const errorMessage = error?.message || error?.data?.detail || '删除笔记时发生错误';
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

  // 当创作者数据加载完成后，加载笔记列表
  useEffect(() => {
    if (creator?.user_id) {
      // 重置页码
      setNotesPage(1);
      notesPageRef.current = 1;
      // 只依赖 user_id，不依赖 loadCreatorNotes，避免重复触发
      loadCreatorNotes(false, creator.user_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creator?.user_id]); // 只在 user_id 变化时加载

  // 笔记列表 - 无限滚动观察器
  useEffect(() => {
    const sentinel = notesSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && notesHasMore && !notesLoading && creator?.user_id) {
          loadCreatorNotes(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [notesHasMore, notesLoading, creator?.user_id, loadCreatorNotes]);

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
          <XhsCreatorDetail creator={creator} loading={false} />
        </Card>

        {/* 创作者笔记列表 */}
        <Card title={`笔记列表 (共 ${notesTotal} 篇)`}>
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
                  <Button onClick={() => loadCreatorNotes(true)}>加载更多</Button>
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
export default function XhsCreatorDetailPage() {
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
      <XhsCreatorDetailPageContent />
    </Suspense>
  );
}
