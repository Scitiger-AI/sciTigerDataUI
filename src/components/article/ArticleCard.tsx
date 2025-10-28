import React, { useState } from 'react';
import { Card, Typography, Space, Tag, Button, Tooltip, Divider, App, Checkbox } from 'antd';
import {
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  EyeOutlined,
  PictureOutlined,
  FileWordOutlined,
  RobotOutlined,
  LinkOutlined,
  DeleteOutlined,
  RetweetOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import type { Article } from '@/types/article';
import { articleService } from '@/services/article';

const { Title, Text, Paragraph } = Typography;

interface ArticleCardProps {
  article: Article;
  onView?: (article: Article) => void;
  onDelete?: (articleId: string) => void;
  loading?: boolean;
  showActions?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onView,
  onDelete,
  loading = false,
  showActions = true,
}) => {
  const { modal, message } = App.useApp();
  const [deleting, setDeleting] = useState(false);
  // 格式化发布时间
  const formatPublishTime = (publishTime: string | null, postTime?: number) => {
    try {
      let date: Date | null = null;
      
      // 优先使用可靠的 Unix 时间戳
      if (postTime) {
        date = new Date(postTime * 1000);
        // 验证时间戳是否有效
        if (isNaN(date.getTime())) {
          date = null;
        }
      }
      
      // 如果 post_time 不可用或无效，尝试解析 publish_time
      if (!date && publishTime && publishTime !== 'null') {
        // 尝试解析中文日期格式: "2025年09月26日 09:50"
        const chineseDateMatch = publishTime.match(/(\d{4})年(\d{2})月(\d{2})日\s+(\d{2}):(\d{2})/);
        
        if (chineseDateMatch) {
          const [, year, month, day, hour, minute] = chineseDateMatch;
          date = new Date(
            parseInt(year),
            parseInt(month) - 1, // 月份从0开始
            parseInt(day),
            parseInt(hour),
            parseInt(minute)
          );
        } else {
          // 尝试直接解析（适用于 ISO 格式等标准格式）
          date = new Date(publishTime);
        }
        
        // 验证日期是否有效
        if (isNaN(date.getTime())) {
          date = null;
        }
      }
      
      // 如果所有尝试都失败，返回未知时间
      if (!date) {
        return '未知时间';
      }
      
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '未知时间';
    }
  };

  // 格式化字数
  const formatWordCount = (count: number) => {
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万`;
    }
    return count.toLocaleString();
  };


  // 处理查看详情
  const handleView = () => {
    if (onView) {
      onView(article);
    }
  };

  // 处理外部链接
  const handleExternalLink = () => {
    if (article.url) {
      window.open(article.url, '_blank');
    }
  };

  // 处理删除
  const handleDelete = () => {
    let deleteFiles = true;

    modal.confirm({
      title: '确认删除',
      content: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>确定要删除文章《{article.title}》吗？</div>
          <Checkbox 
            defaultChecked={true}
            onChange={(e) => { deleteFiles = e.target.checked; }}
          >
            同时删除本地文件（HTML、Markdown、图片等）
          </Checkbox>
        </Space>
      ),
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          setDeleting(true);
          const response = await articleService.deleteArticle(article.id, {
            delete_files: deleteFiles,
            force_delete: false,
          });

          if (response.success) {
            // 检查是否有部分文件删除失败
            if (response.data.files_failed && response.data.files_failed.length > 0) {
              message.warning({
                content: `文章删除成功，但有 ${response.data.files_failed.length} 个文件删除失败`,
                duration: 5,
              });
            } else {
              message.success('文章删除成功');
            }
            
            // 通知父组件刷新列表
            if (onDelete) {
              onDelete(article.id);
            }
          } else {
            message.error(response.message || '删除失败');
          }
        } catch (error: any) {
          console.error('删除文章失败:', error);
          const errorMessage = error?.message || error?.data?.message || '删除文章时发生错误';
          message.error(errorMessage);
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  return (
    <Card
      hoverable
      loading={loading}
      style={{ 
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      styles={{ 
        body: {
          padding: '16px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }
      }}
      actions={
        showActions
          ? [
              <Tooltip key="view" title="查看详情">
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={handleView}
                  size="small"
                  disabled={deleting}
                >
                  详情
                </Button>
              </Tooltip>,
              <Tooltip key="link" title="查看原文">
                <Button
                  type="text"
                  icon={<LinkOutlined />}
                  onClick={handleExternalLink}
                  size="small"
                  disabled={!article.url || deleting}
                >
                  原文
                </Button>
              </Tooltip>,
              <Tooltip key="delete" title="删除文章">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                  size="small"
                  loading={deleting}
                  disabled={deleting}
                >
                  删除
                </Button>
              </Tooltip>,
            ]
          : undefined
      }
    >
      {/* 文章标题 - 固定高度 */}
      <div style={{ 
        marginBottom: '12px',
        minHeight: '48px', // 确保至少两行标题的高度
        display: 'flex',
        alignItems: 'flex-start'
      }}>
        <Title level={5} style={{ 
          margin: 0, 
          lineHeight: 1.4,
          height: '48px', // 固定高度，约两行文字
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          <Tooltip title={article.title}>
            {article.title}
          </Tooltip>
        </Title>
      </div>

      {/* 文章信息 - 主要内容区域 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {/* 作者和公众号 */}
          <Space size="small" wrap>
            <Space size={4}>
              <UserOutlined style={{ color: '#1890ff' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {article.author || '未知作者'}
              </Text>
            </Space>
            <Text type="secondary" style={{ fontSize: '12px' }}>·</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {article.nickname}
            </Text>
          </Space>

          {/* 发布时间 */}
          <Space size={4}>
            <CalendarOutlined style={{ color: '#52c41a' }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {formatPublishTime(article.publish_time, article.post_time)}
            </Text>
          </Space>

          {/* 统计信息 */}
          <Space size="middle" wrap>
            <Space size={4}>
              <FileWordOutlined style={{ color: '#fa8c16' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {formatWordCount(article.word_count)}字
              </Text>
            </Space>
            <Space size={4}>
              <PictureOutlined style={{ color: '#eb2f96' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {article.image_count}图
              </Text>
            </Space>
            <Space size={4}>
              <VideoCameraOutlined style={{ color: '#52c41a' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {article.video_count}视频
              </Text>
            </Space>
          </Space>

          {/* 状态标签 */}
          <Space size="small" wrap>
            {article.is_crawled && (
              <Tag color="green">
                <FileTextOutlined /> 已采集
              </Tag>
            )}
            {article.ai_denoised && (
              <Tag color="purple">
                <RobotOutlined /> AI去噪
              </Tag>
            )}
            {article.ai_rewritten && (
              <Tag color="magenta">
                <RobotOutlined /> AI重写
              </Tag>
            )}
            {!article.is_crawled && (
              <Tag color="orange">
                未采集
              </Tag>
            )}
          </Space>

          {/* 二次发布信息 */}
          {article.published_by && article.published_by.length > 0 && (
            <div style={{ marginTop: '4px' }}>
              <Space size={4} wrap>
                <RetweetOutlined style={{ color: '#722ed1', fontSize: '12px' }} />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  已发布至：
                </Text>
                {article.published_by.map((account, index) => (
                  <Tag key={index} color="purple" style={{ margin: '2px', fontSize: '11px' }}>
                    {account}
                  </Tag>
                ))}
              </Space>
            </div>
          )}
        </Space>

        {/* 爬取时间 - 推到底部 */}
        {article.crawl_time && (
          <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
            <Divider style={{ margin: '0 0 8px 0' }} />
            <Text type="secondary" style={{ fontSize: '11px' }}>
              采集时间: {new Date(article.crawl_time).toLocaleString('zh-CN')}
            </Text>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ArticleCard;
