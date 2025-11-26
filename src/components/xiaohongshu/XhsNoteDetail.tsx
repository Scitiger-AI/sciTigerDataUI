"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Descriptions,
  Tag,
  Space,
  Typography,
  Avatar,
  Row,
  Col,
  Statistic,
  Divider,
  List,
  Spin,
  Empty,
  Button,
  Tooltip,
  Collapse,
  Card,
  Image,
} from 'antd';
import {
  PictureOutlined,
  PlayCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  HeartOutlined,
  CommentOutlined,
  ShareAltOutlined,
  StarOutlined,
  FileTextOutlined,
  DownloadOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import type { XhsNote, XhsComment, NoteContentInfo } from '@/types/xiaohongshu';
import xiaohongshuService from '@/services/xiaohongshu';
import { App } from 'antd';

const { Text, Paragraph, Title } = Typography;
const { Panel } = Collapse;

interface XhsNoteDetailProps {
  note: XhsNote | NoteContentInfo | null;
  loading?: boolean;
  showActions?: boolean;
  onRefresh?: () => void;
}

// 格式化数字
const formatNumber = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null || num === '') return '0';
  const numValue = typeof num === 'string' ? parseInt(num, 10) || 0 : num;
  if (numValue >= 10000) {
    return `${(numValue / 10000).toFixed(1)}万`;
  }
  return numValue.toLocaleString();
};

// 格式化时间戳
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const XhsNoteDetail: React.FC<XhsNoteDetailProps> = ({
  note,
  loading = false,
  showActions = true,
  onRefresh,
}) => {
  const { message } = App.useApp();
  const [comments, setComments] = useState<XhsComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsHasMore, setCommentsHasMore] = useState(true);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [processingDenoise, setProcessingDenoise] = useState(false);
  const [processingRewrite, setProcessingRewrite] = useState(false);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  // 加载评论
  const loadComments = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (!note?.note_id) return;

      try {
        setCommentsLoading(true);
        const response = await xiaohongshuService.getNoteComments({
          note_id: note.note_id,
          page,
          page_size: 50,
        });

        if (response.success && response.data) {
          const newComments = response.data.items || [];
          if (append) {
            setComments((prev) => [...prev, ...newComments]);
          } else {
            setComments(newComments);
          }
          setCommentsTotal(response.data.total || 0);
          setCommentsHasMore(
            response.data.page < response.data.total_pages
          );
          setCommentsPage(page);
        }
      } catch (error: any) {
        console.error('加载评论失败:', error);
        message.error('加载评论失败');
      } finally {
        setCommentsLoading(false);
      }
    },
    [note?.note_id, message]
  );

  // 初始化加载评论
  useEffect(() => {
    if (note?.note_id) {
      loadComments(1, false);
    }
  }, [note?.note_id, loadComments]);

  // 评论滚动加载
  useEffect(() => {
    const container = commentsContainerRef.current;
    if (!container || !commentsHasMore || commentsLoading) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < 100) {
        loadComments(commentsPage + 1, true);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [commentsHasMore, commentsLoading, commentsPage, loadComments]);

  // 处理下载
  const handleDownload = async () => {
    if (!note?.note_id) return;
    try {
      message.loading('正在下载笔记内容...', 0);
      await xiaohongshuService.downloadNote(note.note_id);
      message.destroy();
      message.success('下载成功');
      onRefresh?.();
    } catch (error: any) {
      message.destroy();
      message.error(error.response?.data?.message || '下载失败');
    }
  };

  // 处理去噪
  const handleDenoise = async () => {
    if (!note?.note_id) return;
    try {
      setProcessingDenoise(true);
      message.loading('正在进行内容去噪...', 0);
      await xiaohongshuService.denoiseNote({
        note_id: note.note_id,
        force_reprocess: false,
        save_to_file: true,
      });
      message.destroy();
      message.success('去噪成功');
      onRefresh?.();
    } catch (error: any) {
      message.destroy();
      message.error(error.response?.data?.message || '去噪失败');
    } finally {
      setProcessingDenoise(false);
    }
  };

  // 处理重写
  const handleRewrite = async () => {
    if (!note?.note_id) return;
    try {
      setProcessingRewrite(true);
      message.loading('正在进行内容重写...', 0);
      await xiaohongshuService.rewriteNote({
        note_id: note.note_id,
        force_reprocess: false,
        save_to_file: true,
        auto_denoise: true,
      });
      message.destroy();
      message.success('重写成功');
      onRefresh?.();
    } catch (error: any) {
      message.destroy();
      message.error(error.response?.data?.message || '重写失败');
    } finally {
      setProcessingRewrite(false);
    }
  };

  if (!note) return null;

  const noteContent = note as NoteContentInfo;
  const hasDenoised = noteContent.denoised_content?.has_denoised;
  const hasRewritten = noteContent.rewritten_content?.has_rewritten;

  return (
    <div style={{ marginTop: '20px' }}>
      {/* 操作按钮栏 */}
      {showActions && (
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleDownload}>
              下载内容
            </Button>
            <Button
              icon={<FileTextOutlined />}
              onClick={handleDenoise}
              loading={processingDenoise}
              disabled={hasDenoised}
            >
              {hasDenoised ? '已去噪' : '内容去噪'}
            </Button>
            <Button
              icon={<SyncOutlined />}
              onClick={handleRewrite}
              loading={processingRewrite}
              disabled={hasRewritten}
            >
              {hasRewritten ? '已重写' : '内容重写'}
            </Button>
            {onRefresh && (
              <Button icon={<SyncOutlined />} onClick={onRefresh}>
                刷新
              </Button>
            )}
          </Space>
        </Card>
      )}

      {/* 互动数据统计 */}
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="点赞"
              value={formatNumber(note.liked_count)}
              prefix={<HeartOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="收藏"
              value={formatNumber(note.collected_count)}
              prefix={<StarOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="评论"
              value={formatNumber(note.comment_count)}
              prefix={<CommentOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="分享"
              value={formatNumber(note.share_count)}
              prefix={<ShareAltOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
        </Row>
      </Card>

      {/* 笔记内容 */}
      <Card title="笔记内容" size="small" style={{ marginBottom: '16px' }}>
        <Title level={4}>{note.title}</Title>
        <Paragraph style={{ marginTop: '16px', whiteSpace: 'pre-wrap' }}>
          {note.desc}
        </Paragraph>

        {/* 图片展示 */}
        {note.image_list && note.image_list.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <Image.PreviewGroup>
              {note.image_list.map((url, index) => (
                <Image
                  key={index}
                  src={url}
                  alt={`图片${index + 1}`}
                  style={{ marginRight: '8px', marginBottom: '8px' }}
                  width={200}
                />
              ))}
            </Image.PreviewGroup>
          </div>
        )}

        {/* 视频展示 */}
        {note.type === 'video' && note.video_url && (
          <div style={{ marginTop: '16px' }}>
            <video
              controls
              style={{ width: '100%', maxWidth: '800px' }}
              poster={note.image_list?.[0]}
            >
              <source src={note.video_url} type="video/mp4" />
              您的浏览器不支持视频播放
            </video>
          </div>
        )}

        {/* 标签 */}
        {note.tag_list && note.tag_list.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <Text type="secondary">标签：</Text>
            <Space wrap>
              {note.tag_list.map((tag, index) => (
                <Tag key={index} color="blue">
                  #{tag}
                </Tag>
              ))}
            </Space>
          </div>
        )}
      </Card>

      {/* 去噪/重写内容对比 */}
      {(hasDenoised || hasRewritten) && (
        <Collapse
          items={[
            hasDenoised && {
              key: 'denoised',
              label: (
                <Space>
                  <Text strong>去噪后内容</Text>
                  <Tag color="cyan">AI处理</Tag>
                </Space>
              ),
              children: (
                <div>
                  <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                    {noteContent.denoised_content?.denoised_text}
                  </Paragraph>
                  {noteContent.denoised_content?.ai_denoise_metadata && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      处理时间: {noteContent.denoised_content.ai_denoise_metadata.processing_time}ms
                    </Text>
                  )}
                </div>
              ),
            },
            hasRewritten && {
              key: 'rewritten',
              label: (
                <Space>
                  <Text strong>重写后内容</Text>
                  <Tag color="purple">AI处理</Tag>
                </Space>
              ),
              children: (
                <div>
                  {noteContent.rewritten_content?.rewritten_title && (
                    <Title level={5}>{noteContent.rewritten_content.rewritten_title}</Title>
                  )}
                  <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                    {noteContent.rewritten_content?.rewritten_text}
                  </Paragraph>
                  {noteContent.rewritten_content?.ai_rewrite_metadata && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      处理时间: {noteContent.rewritten_content.ai_rewrite_metadata.processing_time}ms
                    </Text>
                  )}
                </div>
              ),
            },
          ].filter(Boolean) as any[]}
          style={{ marginBottom: '16px' }}
        />
      )}

      {/* 可折叠的详细信息 */}
      <Collapse
        defaultActiveKey={[]}
        items={[
          {
            key: 'info',
            label: (
              <Space>
                <Text strong>详细信息</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  (点击展开/折叠)
                </Text>
              </Space>
            ),
            children: (
              <Descriptions
                bordered
                column={2}
                size="small"
              >
                <Descriptions.Item label="笔记ID" span={2}>
                  <Text code style={{ wordBreak: 'break-all' }}>
                    {note.note_id}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="作者">
                  <Space>
                    <Avatar src={note.avatar} icon={<UserOutlined />} size={24} />
                    <Text strong>{note.nickname}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="类型">
                  <Tag color={note.type === 'video' ? 'red' : 'blue'}>
                    {note.type === 'video' ? '视频' : '图文'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="发布时间">
                  <Space>
                    <CalendarOutlined />
                    {formatTime(note.time)}
                  </Space>
                </Descriptions.Item>
                {note.ip_location && (
                  <Descriptions.Item label="IP位置">
                    <Space>
                      <EnvironmentOutlined />
                      {note.ip_location}
                    </Space>
                  </Descriptions.Item>
                )}
                {note.crawl_time && (
                  <Descriptions.Item label="采集时间" span={2}>
                    {note.crawl_time}
                  </Descriptions.Item>
                )}
              </Descriptions>
            ),
          },
        ]}
        style={{ marginBottom: '16px' }}
      />

      {/* 评论区域 */}
      <Card
        title={
          <Space>
            <Text strong>评论列表</Text>
            <Text type="secondary">({commentsTotal})</Text>
          </Space>
        }
        size="small"
      >
        <div
          ref={commentsContainerRef}
          style={{
            maxHeight: '600px',
            overflowY: 'auto',
          }}
        >
          {comments.length === 0 && !commentsLoading ? (
            <Empty description="暂无评论" />
          ) : (
            <List
              dataSource={comments}
              loading={commentsLoading}
              renderItem={(comment) => (
                <List.Item key={comment.comment_id}>
                  <List.Item.Meta
                    avatar={<Avatar src={comment.avatar} icon={<UserOutlined />} />}
                    title={
                      <Space>
                        <Text strong>{comment.nickname}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {formatTime(comment.create_time)}
                        </Text>
                      </Space>
                    }
                    description={
                      <div>
                        <Paragraph style={{ marginBottom: '8px' }}>
                          {comment.content}
                        </Paragraph>
                        <Space>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            <HeartOutlined /> {formatNumber(comment.like_count)}
                          </Text>
                          {comment.sub_comment_count > 0 && (
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              <CommentOutlined /> {formatNumber(comment.sub_comment_count)}
                            </Text>
                          )}
                        </Space>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
          {commentsLoading && commentsPage > 1 && (
            <div style={{ textAlign: 'center', padding: '12px' }}>
              <Spin />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default XhsNoteDetail;
