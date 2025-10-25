import React, { useState, useEffect, useCallback } from 'react';
import {
  Collapse,
  Card,
  Row,
  Col,
  Image,
  Button,
  Space,
  Typography,
  Empty,
  Spin,
  Tag,
  App,
  Modal,
} from 'antd';
import {
  PictureOutlined,
  VideoCameraOutlined,
  DownloadOutlined,
  EyeOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { articleService } from '@/services/article';
import type { ArticleImage, ArticleVideo } from '@/types/article';

const { Text, Title } = Typography;
const { Panel } = Collapse;

interface ArticleMediaViewerProps {
  articleId: string;
}

const ArticleMediaViewer: React.FC<ArticleMediaViewerProps> = ({ articleId }) => {
  const { message: messageApi } = App.useApp();
  
  // 状态管理
  const [images, setImages] = useState<ArticleImage[]>([]);
  const [videos, setVideos] = useState<ArticleVideo[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<ArticleVideo | null>(null);

  // 加载图片列表
  const loadImages = useCallback(async () => {
    try {
      setImagesLoading(true);
      const response = await articleService.getArticleImages(articleId);
      if (response.success && response.data) {
        setImages(response.data);
      }
    } catch (error: any) {
      console.error('加载图片列表失败:', error);
      // 只在非404错误时显示错误消息
      if (error?.status !== 404) {
        messageApi.error('加载图片列表失败');
      }
    } finally {
      setImagesLoading(false);
    }
  }, [articleId, messageApi]);

  // 加载视频列表
  const loadVideos = useCallback(async () => {
    try {
      setVideosLoading(true);
      const response = await articleService.getArticleVideos(articleId);
      if (response.success && response.data) {
        setVideos(response.data);
      }
    } catch (error: any) {
      console.error('加载视频列表失败:', error);
      // 只在非404错误时显示错误消息
      if (error?.status !== 404) {
        messageApi.error('加载视频列表失败');
      }
    } finally {
      setVideosLoading(false);
    }
  }, [articleId, messageApi]);

  // 初始加载
  useEffect(() => {
    if (articleId) {
      loadImages();
      loadVideos();
    }
  }, [articleId, loadImages, loadVideos]);

  // 下载图片
  const handleDownloadImage = (image: ArticleImage) => {
    try {
      const link = document.createElement('a');
      link.href = image.api_url;
      link.download = `image_${image.id}.${image.api_url.split('.').pop()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      messageApi.success('开始下载图片');
    } catch (error) {
      console.error('下载图片失败:', error);
      messageApi.error('下载图片失败');
    }
  };

  // 下载视频
  const handleDownloadVideo = (video: ArticleVideo) => {
    try {
      const link = document.createElement('a');
      link.href = video.api_url;
      link.download = video.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      messageApi.success('开始下载视频');
    } catch (error) {
      console.error('下载视频失败:', error);
      messageApi.error('下载视频失败');
    }
  };

  // 预览视频
  const handlePreviewVideo = (video: ArticleVideo) => {
    setCurrentVideo(video);
    setVideoModalVisible(true);
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // 获取下载状态标签
  const getDownloadStatusTag = (status: string) => {
    switch (status) {
      case 'completed':
        return <Tag color="success" icon={<CheckCircleOutlined />}>已完成</Tag>;
      case 'pending':
        return <Tag color="warning" icon={<ClockCircleOutlined />}>待下载</Tag>;
      case 'failed':
        return <Tag color="error" icon={<CloseCircleOutlined />}>失败</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  // 获取视频格式标签
  const getFormatTag = (formatId: string) => {
    switch (formatId) {
      case 'f10002':
        return <Tag color="blue">超清</Tag>;
      case 'f10004':
        return <Tag color="cyan">流畅</Tag>;
      default:
        return <Tag>{formatId}</Tag>;
    }
  };

  // 图片面板内容
  const renderImagesPanel = () => {
    if (imagesLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="加载图片中..." />
        </div>
      );
    }

    if (images.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无图片资源"
        />
      );
    }

    return (
      <Row gutter={[16, 16]}>
        {images.map((image, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={image.id}>
            <Card
              hoverable
              styles={{ body: { padding: '12px' } }}
              cover={
                <div style={{ 
                  height: '200px', 
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f5f5f5'
                }}>
                  <Image
                    src={image.api_url}
                    alt={image.alt || `图片 ${index + 1}`}
                    style={{ 
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                    preview={{
                      mask: (
                        <Space direction="vertical" align="center">
                          <EyeOutlined style={{ fontSize: '24px' }} />
                          <Text style={{ color: 'white' }}>预览</Text>
                        </Space>
                      ),
                    }}
                  />
                </div>
              }
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Text strong>图片 {index + 1}</Text>
                  {getDownloadStatusTag(image.download_status)}
                </div>
                
                {image.width && image.height && (
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    尺寸: {image.width} × {image.height}
                  </Text>
                )}
                
                {image.alt && (
                  <Text 
                    type="secondary" 
                    style={{ fontSize: '12px' }}
                    ellipsis={{ tooltip: image.alt }}
                  >
                    {image.alt}
                  </Text>
                )}
                
                <Button
                  type="primary"
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownloadImage(image)}
                  block
                >
                  下载
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // 视频面板内容
  const renderVideosPanel = () => {
    if (videosLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="加载视频中..." />
        </div>
      );
    }

    if (videos.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无视频资源"
        />
      );
    }

    return (
      <Row gutter={[16, 16]}>
        {videos.map((video, index) => (
          <Col xs={24} sm={12} md={8} key={video.id}>
              <Card hoverable styles={{ body: { padding: '16px' } }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* 视频缩略图封面 */}
                <div 
                  style={{
                    height: '150px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    background: '#000',
                  }}
                  onClick={() => handlePreviewVideo(video)}
                >
                  {/* 视频元素用于显示第一帧 */}
                  <video
                    src={video.api_url}
                    preload="metadata"
                    muted
                    playsInline
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  
                  {/* 播放按钮覆盖层 */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0, 0, 0, 0.3)',
                      transition: 'background 0.3s',
                      pointerEvents: 'none',
                    }}
                  >
                    <PlayCircleOutlined
                      style={{
                        fontSize: '48px',
                        color: 'white',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                      }}
                    />
                  </div>
                </div>

                {/* 视频信息 */}
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Text strong>视频 {index + 1}</Text>
                    {getFormatTag(video.format_id)}
                  </div>
                  
                  <Text 
                    type="secondary" 
                    style={{ fontSize: '12px' }}
                    ellipsis={{ tooltip: video.filename }}
                  >
                    文件名: {video.filename}
                  </Text>
                  
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    大小: {formatFileSize(video.size)}
                  </Text>
                  
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    视频ID: {video.video_id}
                  </Text>
                </Space>

                {/* 操作按钮 */}
                <Space style={{ width: '100%' }}>
                  <Button
                    type="default"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handlePreviewVideo(video)}
                    style={{ flex: 1 }}
                  >
                    预览
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownloadVideo(video)}
                    style={{ flex: 1 }}
                  >
                    下载
                  </Button>
                </Space>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <>
      <Collapse
        defaultActiveKey={[]}
        style={{ marginBottom: '24px' }}
        items={[
          {
            key: 'images',
            label: (
              <Space>
                <PictureOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
                <Text strong>图片资源</Text>
                <Tag color="blue">{images.length}</Tag>
              </Space>
            ),
            extra: (
              <Button
                type="text"
                size="small"
                icon={<ReloadOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  loadImages();
                }}
                loading={imagesLoading}
              />
            ),
            children: renderImagesPanel(),
          },
          {
            key: 'videos',
            label: (
              <Space>
                <VideoCameraOutlined style={{ fontSize: '18px', color: '#52c41a' }} />
                <Text strong>视频资源</Text>
                <Tag color="green">{videos.length}</Tag>
              </Space>
            ),
            extra: (
              <Button
                type="text"
                size="small"
                icon={<ReloadOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  loadVideos();
                }}
                loading={videosLoading}
              />
            ),
            children: renderVideosPanel(),
          },
        ]}
      />

      {/* 视频预览模态框 */}
      <Modal
        title={
          <Space>
            <VideoCameraOutlined style={{ color: '#52c41a' }} />
            <Text strong>视频预览</Text>
          </Space>
        }
        open={videoModalVisible}
        onCancel={() => {
          setVideoModalVisible(false);
          setCurrentVideo(null);
        }}
        footer={[
          <Button key="close" onClick={() => setVideoModalVisible(false)}>
            关闭
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => currentVideo && handleDownloadVideo(currentVideo)}
          >
            下载视频
          </Button>,
        ]}
        width={800}
        centered
      >
        {currentVideo && (
          <div>
            {/* 视频信息 */}
            <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: '16px' }}>
              <div>
                <Text type="secondary">文件名：</Text>
                <Text>{currentVideo.filename}</Text>
              </div>
              <div>
                <Text type="secondary">大小：</Text>
                <Text>{formatFileSize(currentVideo.size)}</Text>
              </div>
              <div>
                <Text type="secondary">格式：</Text>
                {getFormatTag(currentVideo.format_id)}
              </div>
              <div>
                <Text type="secondary">视频ID：</Text>
                <Text copyable>{currentVideo.video_id}</Text>
              </div>
            </Space>

            {/* 视频播放器 */}
            <video
              src={currentVideo.api_url}
              controls
              style={{
                width: '100%',
                maxHeight: '500px',
                background: '#000',
                borderRadius: '8px',
              }}
              preload="metadata"
            >
              您的浏览器不支持视频播放
            </video>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ArticleMediaViewer;

