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
  Tabs,
  Card,
} from 'antd';
import {
  PlayCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  HeartOutlined,
  CommentOutlined,
  ShareAltOutlined,
  StarOutlined,
  FileTextOutlined,
  RobotOutlined,
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons';
import type { DouyinVideo, DouyinComment } from '@/types/douyin';
import douyinService from '@/services/douyin';
import { App } from 'antd';

const { Text, Paragraph, Title } = Typography;
const { Panel } = Collapse;

interface DouyinVideoDetailProps {
  video: DouyinVideo | null;
  loading?: boolean;
  showActions?: boolean;
  onRefresh?: () => void;  // 刷新回调,用于下载完成后刷新视频详情
}

// 格式化数字（支持字符串和数字类型）
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

// 获取视频播放URL
const getVideoUrl = (video: DouyinVideo): string | null => {
  // 优先使用已下载的视频
  if (video.downloaded_videos && video.downloaded_videos.length > 0) {
    return video.downloaded_videos[0].api_url;
  }
  // 否则使用视频下载链接（通过后端代理）
  if (video.video_download_url) {
    // 使用后端代理接口，解决防盗链问题
    // 前端 /api/douyin/proxy/video -> 后端 /api/v1/douyin/proxy/video
    return `/api/douyin/proxy/video?url=${encodeURIComponent(video.video_download_url)}`;
  }
  return null;
};

const DouyinVideoDetail: React.FC<DouyinVideoDetailProps> = ({
  video,
  loading = false,
  showActions = true,
  onRefresh,
}) => {
  const { message } = App.useApp();
  const [comments, setComments] = useState<DouyinComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsHasMore, setCommentsHasMore] = useState(true);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('script');

  // 加载评论
  const loadComments = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (!video?.aweme_id) return;

      try {
        setCommentsLoading(true);
        const response = await douyinService.getVideoComments({
          aweme_id: video.aweme_id,
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
    [video?.aweme_id, message]
  );

  // 初始化加载评论
  useEffect(() => {
    if (video?.aweme_id) {
      loadComments(1, false);
    }
  }, [video?.aweme_id, loadComments]);

  // 评论滚动加载
  useEffect(() => {
    const container = commentsContainerRef.current;
    if (!container || !commentsHasMore || commentsLoading) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // 距离底部100px时加载
      if (scrollHeight - scrollTop - clientHeight < 100) {
        loadComments(commentsPage + 1, true);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [commentsHasMore, commentsLoading, commentsPage, loadComments]);

  if (!video) return null;

  const videoUrl = getVideoUrl(video);
  const shortUserId = video.short_user_id || video.short_id;
  const coverUrl = video.cover_url || video.video_cover_url;

  return (
    <div style={{ marginTop: '20px' }}>
      {/* 可折叠的信息区域 */}
      <Collapse
        defaultActiveKey={[]}
        style={{ marginBottom: '24px' }}
        items={[
          {
            key: 'info',
            label: (
              <Space>
                <Text strong>基本信息、互动数据、采集信息</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  (点击展开/折叠)
                </Text>
              </Space>
            ),
            children: (
              <div>
                {/* 基本信息 */}
                <Descriptions
                  title="基本信息"
                  bordered
                  column={2}
                  size="small"
                  style={{ marginBottom: '24px' }}
                >
                  <Descriptions.Item label="视频ID" span={2}>
                    <Space>
                      <Text code style={{ wordBreak: 'break-all' }}>
                        {video.aweme_id || '-'}
                      </Text>
                      {video.downloaded_videos && video.downloaded_videos.length > 0 && (
                        <Tag color="green">已下载</Tag>
                      )}
                    </Space>
                  </Descriptions.Item>

                  <Descriptions.Item label="作者昵称">
                    <Space>
                      <Avatar src={video.avatar} icon={<UserOutlined />} size={24} />
                      {video.nickname || '-'}
                    </Space>
                  </Descriptions.Item>

                  <Descriptions.Item label="用户ID">
                    <Text code>{video.user_id || '-'}</Text>
                  </Descriptions.Item>

                  <Descriptions.Item label="唯一ID">
                    <Text code>{video.user_unique_id || '-'}</Text>
                  </Descriptions.Item>

                  <Descriptions.Item label="短ID">
                    <Text code>{shortUserId || '-'}</Text>
                  </Descriptions.Item>

                  <Descriptions.Item label="视频类型">
                    <Tag>{video.aweme_type || '-'}</Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="发布时间">
                    <Space>
                      <CalendarOutlined style={{ color: '#1890ff' }} />
                      {video.create_time ? formatTime(video.create_time) : '-'}
                    </Space>
                  </Descriptions.Item>

                  <Descriptions.Item label="发布位置">
                    {video.ip_location ? (
                      <Space>
                        <EnvironmentOutlined style={{ color: '#52c41a' }} />
                        {video.ip_location}
                      </Space>
                    ) : (
                      '-'
                    )}
                  </Descriptions.Item>

                  {video.sec_uid && (
                    <Descriptions.Item label="Sec UID">
                      <Text code style={{ wordBreak: 'break-all' }}>
                        {video.sec_uid}
                      </Text>
                    </Descriptions.Item>
                  )}

                  {video.user_signature && (
                    <Descriptions.Item label="用户签名">
                      {video.user_signature}
                    </Descriptions.Item>
                  )}

                  {video.aweme_url && (
                    <Descriptions.Item label="视频链接" span={2}>
                      <a href={video.aweme_url} target="_blank" rel="noopener noreferrer">
                        {video.aweme_url}
                      </a>
                    </Descriptions.Item>
                  )}

                  {video.crawler_type && (
                    <Descriptions.Item label="采集类型">
                      <Tag color="purple">{video.crawler_type}</Tag>
                    </Descriptions.Item>
                  )}

                  {video.last_modify_ts && (
                    <Descriptions.Item label="最后修改时间">
                      {formatTime(video.last_modify_ts / 1000)}
                    </Descriptions.Item>
                  )}
                </Descriptions>

                {/* 互动数据统计 */}
                <Descriptions
                  title="互动数据"
                  bordered
                  column={4}
                  size="small"
                  style={{ marginBottom: '24px' }}
                >
                  <Descriptions.Item label="点赞数">
                    <Statistic
                      value={formatNumber(video.liked_count)}
                      prefix={<HeartOutlined />}
                      valueStyle={{ fontSize: '16px', color: '#ff4d4f' }}
                    />
                  </Descriptions.Item>

                  <Descriptions.Item label="评论数">
                    <Statistic
                      value={formatNumber(video.comment_count)}
                      prefix={<CommentOutlined />}
                      valueStyle={{ fontSize: '16px', color: '#52c41a' }}
                    />
                  </Descriptions.Item>

                  <Descriptions.Item label="分享数">
                    <Statistic
                      value={formatNumber(video.share_count)}
                      prefix={<ShareAltOutlined />}
                      valueStyle={{ fontSize: '16px', color: '#fa8c16' }}
                    />
                  </Descriptions.Item>

                  <Descriptions.Item label="收藏数">
                    <Statistic
                      value={formatNumber(video.collected_count || video.collect_count)}
                      prefix={<StarOutlined />}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Descriptions.Item>
                </Descriptions>

                {/* 采集信息 */}
                <Descriptions
                  title="采集信息"
                  bordered
                  column={2}
                  size="small"
                  style={{ marginBottom: '24px' }}
                >
                  {video.task_id && (
                    <Descriptions.Item label="任务ID">
                      <Text code>{video.task_id}</Text>
                    </Descriptions.Item>
                  )}

                  {video.source_keyword && (
                    <Descriptions.Item label="来源关键词">
                      <Tag color="purple">{video.source_keyword}</Tag>
                    </Descriptions.Item>
                  )}

                  {video.crawl_time && (
                    <Descriptions.Item label="采集时间">
                      {new Date(video.crawl_time).toLocaleString('zh-CN')}
                    </Descriptions.Item>
                  )}

                  {video.created_at && (
                    <Descriptions.Item label="创建时间">
                      {new Date(video.created_at).toLocaleString('zh-CN')}
                    </Descriptions.Item>
                  )}

                  {video.media_download_config && (
                    <Descriptions.Item label="媒体下载配置" span={2}>
                      <Space direction="vertical" size="small">
                        <Text>
                          启用: {video.media_download_config.enabled ? '是' : '否'}
                        </Text>
                        <Text>保存路径: {video.media_download_config.save_path}</Text>
                        <Text>
                          最大图片大小: {video.media_download_config.max_image_size_mb}MB
                        </Text>
                        <Text>
                          最大视频大小: {video.media_download_config.max_video_size_mb}MB
                        </Text>
                      </Space>
                    </Descriptions.Item>
                  )}

                  {video.downloaded_videos && video.downloaded_videos.length > 0 && (
                    <Descriptions.Item label="已下载视频" span={2}>
                      <Space direction="vertical" size="small">
                        {video.downloaded_videos.map((v, idx) => (
                          <div key={idx}>
                            <Text>
                              文件大小: {(v.file_size / 1024 / 1024).toFixed(2)}MB
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              下载时间: {formatTime(v.download_time / 1000)}
                            </Text>
                          </div>
                        ))}
                      </Space>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </div>
            ),
          },
        ]}
      />

      {/* 主要内容区域：两列布局 */}
      <Row gutter={24}>
        {/* 左侧：视频 + 评论 */}
        <Col xs={24} lg={10}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* 视频播放器 */}
            <Card
              title="视频"
              size="small"
              extra={
                videoUrl && (!video.downloaded_videos || video.downloaded_videos.length === 0) && (
                  <Tooltip title="将视频下载到服务器存储,下载后可直接播放">
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlayCircleOutlined />}
                      onClick={async () => {
                        try {
                          message.loading({ content: '正在请求服务器下载视频...', key: 'downloadVideo' });
                          const response = await douyinService.downloadVideo(video.aweme_id);
                          if (response.success) {
                            message.success({ content: '服务器下载成功', key: 'downloadVideo' });
                            // 调用刷新回调,而不是整页刷新
                            if (onRefresh) {
                              onRefresh();
                            }
                          } else {
                            message.error({ content: response.message || '下载失败', key: 'downloadVideo' });
                          }
                        } catch (error) {
                          message.error({ content: '下载失败', key: 'downloadVideo' });
                        }
                      }}
                    >
                      下载到服务器
                    </Button>
                  </Tooltip>
                )
              }
            >
              {videoUrl ? (
                <div style={{ width: '100%', textAlign: 'center' }}>
                  <video
                    controls
                    style={{
                      maxWidth: '100%',
                      maxHeight: '600px',
                      borderRadius: '8px',
                    }}
                    src={videoUrl}
                    poster={coverUrl}
                    // @ts-ignore
                    referrerPolicy="no-referrer"
                  >
                    您的浏览器不支持视频播放
                  </video>
                </div>
              ) : (
                <Empty
                  description="暂无视频链接"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>

            {/* 评论列表 */}
            <Card
              title={`评论列表 (${commentsTotal})`}
              size="small"
              style={{ maxHeight: '600px', display: 'flex', flexDirection: 'column' }}
              styles={{ body: { flex: 1, overflow: 'hidden', padding: 0 } }}
            >
              <div
                ref={commentsContainerRef}
                style={{
                  height: '600px',
                  overflowY: 'auto',
                  padding: '16px',
                }}
              >
                {commentsLoading && comments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <Spin />
                  </div>
                ) : comments.length === 0 ? (
                  <Empty description="暂无评论" />
                ) : (
                  <>
                    <List
                      dataSource={comments}
                      renderItem={(comment) => (
                        <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                src={comment.avatar || comment.avatar_thumb}
                                icon={<UserOutlined />}
                              />
                            }
                            title={
                              <Space>
                                <Text strong>{comment.nickname}</Text>
                                {comment.ip_location && (
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    {comment.ip_location}
                                  </Text>
                                )}
                              </Space>
                            }
                            description={
                              <>
                                <div style={{ marginBottom: 8, marginTop: 8 }}>
                                  {comment.content}
                                </div>
                                <Space size="small">
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    {formatTime(comment.create_time)}
                                  </Text>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    <HeartOutlined style={{ marginRight: 4 }} />
                                    {formatNumber(
                                      comment.like_count ?? comment.digg_count ?? 0
                                    )}
                                  </Text>
                                  {(comment.sub_comment_count ||
                                    comment.reply_comment_total) && (
                                      <Text type="secondary" style={{ fontSize: 12 }}>
                                        <CommentOutlined style={{ marginRight: 4 }} />
                                        {formatNumber(
                                          comment.sub_comment_count ??
                                          comment.reply_comment_total ??
                                          0
                                        )}{' '}
                                        条回复
                                      </Text>
                                    )}
                                </Space>
                              </>
                            }
                          />
                        </List.Item>
                      )}
                    />
                    {commentsLoading && comments.length > 0 && (
                      <div style={{ textAlign: 'center', padding: 16 }}>
                        <Spin size="small" />
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          加载中...
                        </Text>
                      </div>
                    )}
                    {!commentsHasMore && comments.length > 0 && (
                      <div style={{ textAlign: 'center', padding: 16 }}>
                        <Text type="secondary">没有更多评论了</Text>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </Space>
        </Col>

        {/* 右侧：文案内容展示区 */}
        <Col xs={24} lg={14}>
          <Card title="文案内容" size="small" style={{ height: '100%' }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'script',
                  label: (
                    <Space>
                      <FileTextOutlined />
                      视频文案
                    </Space>
                  ),
                  children: (
                    <div style={{ padding: '16px 0', minHeight: '200px' }}>
                      <Empty
                        description="暂无视频文案"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    </div>
                  ),
                },
                {
                  key: 'denoise',
                  label: (
                    <Space>
                      <RobotOutlined />
                      AI去噪
                    </Space>
                  ),
                  children: (
                    <div style={{ padding: '16px 0', minHeight: '200px' }}>
                      <Empty
                        description="暂无AI去噪内容"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    </div>
                  ),
                },
                {
                  key: 'rewrite',
                  label: (
                    <Space>
                      <RobotOutlined />
                      AI重写
                    </Space>
                  ),
                  children: (
                    <div style={{ padding: '16px 0', minHeight: '200px' }}>
                      <Empty
                        description="暂无AI重写内容"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DouyinVideoDetail;
