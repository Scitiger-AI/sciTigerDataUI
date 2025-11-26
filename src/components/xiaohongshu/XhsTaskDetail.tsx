"use client";

import React from 'react';
import { Descriptions, Tag, Space, Typography, Alert } from 'antd';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  CommentOutlined,
  UserOutlined,
  FileTextOutlined,
  SettingOutlined,
  FileImageOutlined,
} from '@ant-design/icons';
import type { XhsTask } from '@/types/xiaohongshu';
import { XHS_TASK_STATUS_CONFIG, XHS_TASK_TYPE_CONFIG } from '@/types/xiaohongshu';

const { Text, Paragraph } = Typography;

interface XhsTaskDetailProps {
  task: XhsTask | null;
  loading?: boolean;
}

export const XhsTaskDetail: React.FC<XhsTaskDetailProps> = ({
  task,
  loading = false,
}) => {
  if (!task) return null;

  // 格式化时间
  const formatTime = (timeStr?: string | null): string => {
    if (!timeStr) return '-';
    try {
      return new Date(timeStr).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return timeStr;
    }
  };

  // 格式化数字
  const formatNumber = (num?: number): string => {
    if (num === undefined || num === null) return '-';
    return num.toLocaleString('zh-CN');
  };

  // 获取排序类型显示文本
  const getSortTypeText = (sortType?: string): string => {
    switch (sortType) {
      case 'general': return '综合排序';
      case 'popularity_descending': return '最热排序';
      case 'time_descending': return '最新排序';
      default: return sortType || '-';
    }
  };

  const statusConfig = XHS_TASK_STATUS_CONFIG[task.status] || { color: 'default', text: task.status };
  const typeConfig = XHS_TASK_TYPE_CONFIG[task.task_type] || { color: 'default', text: task.task_type };

  return (
    <div>
      {/* 错误信息提示 */}
      {task.error_message && (
        <Alert
          message="任务执行错误"
          description={task.error_message}
          type="error"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* 基本信息 */}
      <Descriptions
        title="基本信息"
        bordered
        column={2}
        size="small"
      >
        <Descriptions.Item label="任务名称" span={2}>
          <Text strong style={{ fontSize: 16 }}>{task.name}</Text>
        </Descriptions.Item>

        <Descriptions.Item label="任务ID" span={2}>
          <Text code style={{ wordBreak: 'break-all', fontSize: 12 }}>
            {task.id}
          </Text>
        </Descriptions.Item>

        <Descriptions.Item label="任务类型">
          <Tag color={typeConfig.color}>{typeConfig.text}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="任务状态">
          <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="调度类型">
          <Tag>{task.schedule_type === 'immediate' ? '立即执行' :
                task.schedule_type === 'once' ? '定时执行' :
                task.schedule_type === 'cron' ? '周期执行' : task.schedule_type}</Tag>
        </Descriptions.Item>

        {task.scheduled_time && (
          <Descriptions.Item label="计划时间">
            <Text>{formatTime(task.scheduled_time)}</Text>
          </Descriptions.Item>
        )}

        {task.cron_config?.expression && (
          <>
            <Descriptions.Item label="Cron表达式">
              <Text code>{task.cron_config.expression}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="时区">
              <Text>{task.cron_config.timezone || 'Asia/Shanghai'}</Text>
            </Descriptions.Item>
          </>
        )}
      </Descriptions>

      {/* 任务参数 */}
      <Descriptions
        title="任务参数"
        bordered
        column={2}
        size="small"
        style={{ marginTop: '24px' }}
      >
        {task.keywords && (
          <Descriptions.Item label="搜索关键词" span={2}>
            <Text strong>{task.keywords}</Text>
          </Descriptions.Item>
        )}

        {task.creator_urls && task.creator_urls.length > 0 && (
          <Descriptions.Item label="创作者URL" span={2}>
            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {task.creator_urls.map((url, index) => (
                <Tag key={index} style={{ marginBottom: '4px', wordBreak: 'break-all' }}>
                  {url}
                </Tag>
              ))}
            </div>
          </Descriptions.Item>
        )}

        {task.note_urls && task.note_urls.length > 0 && (
          <Descriptions.Item label="笔记URL列表" span={2}>
            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {task.note_urls.map((url, index) => (
                <Tag key={index} style={{ marginBottom: '4px', wordBreak: 'break-all' }}>
                  {url.length > 50 ? `${url.slice(0, 50)}...` : url}
                </Tag>
              ))}
            </div>
          </Descriptions.Item>
        )}

        {task.max_count && (
          <Descriptions.Item label="最大采集数量">
            <Text>{formatNumber(task.max_count)}</Text>
          </Descriptions.Item>
        )}

        {task.social_collector_task_id && (
          <Descriptions.Item label="采集任务ID">
            <Text code style={{ wordBreak: 'break-all', fontSize: '11px' }}>
              {task.social_collector_task_id}
            </Text>
          </Descriptions.Item>
        )}

        {task.sort_type && (
          <Descriptions.Item label="排序方式">
            <Tag>{getSortTypeText(task.sort_type)}</Tag>
          </Descriptions.Item>
        )}

        {task.start_page && (
          <Descriptions.Item label="起始页码">
            <Text>{task.start_page}</Text>
          </Descriptions.Item>
        )}

        <Descriptions.Item label="高级选项" span={2}>
          <Space size="large" wrap>
            <Space>
              <Text>代理:</Text>
              {task.enable_proxy ? <Tag color="blue">启用</Tag> : <Tag>禁用</Tag>}
            </Space>
            <Space>
              <Text>断点续爬:</Text>
              {task.enable_resume ? <Tag color="green">启用</Tag> : <Tag>禁用</Tag>}
            </Space>
          </Space>
        </Descriptions.Item>

        {task.comment_config && (
          <Descriptions.Item label="评论配置" span={2}>
            <Space direction="vertical" size={0}>
              <Text>启用: {task.comment_config.enabled ? '是' : '否'}</Text>
              {task.comment_config.enabled && (
                <>
                  <Text type="secondary" style={{ fontSize: 12 }}>每笔记上限: {task.comment_config.max_per_note}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>子评论: {task.comment_config.fetch_sub_comments ? '是' : '否'}</Text>
                </>
              )}
            </Space>
          </Descriptions.Item>
        )}

        {task.media_download_config && (
          <Descriptions.Item label="媒体下载" span={2}>
            <Space direction="vertical" size={0}>
              <Text>启用: {task.media_download_config.enabled ? '是' : '否'}</Text>
              {task.media_download_config.enabled && (
                <>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    类型: {[
                      task.media_download_config.download_images && '图片',
                      task.media_download_config.download_videos && '视频'
                    ].filter(Boolean).join('/')}
                  </Text>
                  {task.media_download_config.save_path && (
                    <Text type="secondary" style={{ fontSize: 12 }}>路径: {task.media_download_config.save_path}</Text>
                  )}
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    图片上限: {task.media_download_config.max_image_size_mb}MB,
                    视频上限: {task.media_download_config.max_video_size_mb}MB
                  </Text>
                </>
              )}
            </Space>
          </Descriptions.Item>
        )}
      </Descriptions>

      {task.post_processing_config && (
        <Descriptions
          title="后处理配置"
          bordered
          column={2}
          size="small"
          style={{ marginTop: '24px' }}
        >
          <Descriptions.Item label="启用状态" span={2}>
            <Space>
              <Text>后处理:</Text>
              {task.post_processing_config.enabled ? <Tag color="green">启用</Tag> : <Tag>禁用</Tag>}
            </Space>
          </Descriptions.Item>

          {task.post_processing_config.enabled && (
            <>
              <Descriptions.Item label="处理功能" span={2}>
                <Space wrap>
                  {task.post_processing_config.asr?.enabled && (
                    <Tag color="blue">
                      ASR提取 ✓
                    </Tag>
                  )}
                  {task.post_processing_config.denoise?.enabled && (
                    <Tag color="cyan">
                      内容去噪 ✓
                    </Tag>
                  )}
                  {task.post_processing_config.rewrite?.enabled && (
                    <Tag color="purple">
                      内容重写 ✓
                    </Tag>
                  )}
                  {task.post_processing_config.extract_keywords && (
                    <Tag color="orange">
                      关键词提取 ✓
                    </Tag>
                  )}
                  {task.post_processing_config.auto_classify && (
                    <Tag color="magenta">
                      自动分类 ✓
                    </Tag>
                  )}
                </Space>
              </Descriptions.Item>

              {task.post_processing_config.asr?.enabled && (
                <>
                  <Descriptions.Item label="ASR提供商">
                    <Tag>{task.post_processing_config.asr.provider || 'whisper'}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="ASR语言">
                    <Tag>{task.post_processing_config.asr.language || 'zh'}</Tag>
                  </Descriptions.Item>
                </>
              )}
            </>
          )}
        </Descriptions>
      )}

      {/* 执行信息 */}
      <Descriptions
        title="执行信息"
        bordered
        column={2}
        size="small"
        style={{ marginTop: '24px' }}
      >
        <Descriptions.Item label="创建时间">
          <Space>
            <CalendarOutlined style={{ color: '#1890ff' }} />
            {formatTime(task.created_at)}
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="更新时间">
          <Space>
            <ClockCircleOutlined style={{ color: '#faad14' }} />
            {formatTime(task.updated_at)}
          </Space>
        </Descriptions.Item>

        {task.started_at && (
          <Descriptions.Item label="开始时间">
            <Space>
              <PlayCircleOutlined style={{ color: '#52c41a' }} />
              {formatTime(task.started_at)}
            </Space>
          </Descriptions.Item>
        )}

        {task.last_run_at && (
          <Descriptions.Item label="最后运行">
            <Space>
              <ClockCircleOutlined style={{ color: '#1890ff' }} />
              {formatTime(task.last_run_at)}
            </Space>
          </Descriptions.Item>
        )}

        {task.next_run_at && (
          <Descriptions.Item label="下次运行">
            <Space>
              <ClockCircleOutlined style={{ color: '#722ed1' }} />
              {formatTime(task.next_run_at)}
            </Space>
          </Descriptions.Item>
        )}

        {task.completed_at && (
          <Descriptions.Item label="完成时间">
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              {formatTime(task.completed_at)}
            </Space>
          </Descriptions.Item>
        )}

        <Descriptions.Item label="进度">
          <Text>{task.progress?.percentage || 0}%</Text>
        </Descriptions.Item>
      </Descriptions>

      {/* 结果统计 */}
      <Descriptions
        title="结果统计"
        bordered
        column={2}
        size="small"
        style={{ marginTop: '24px' }}
      >
        {task.status === 'completed' ? (
          <>
            <Descriptions.Item label="笔记数">
              <Space>
                <FileTextOutlined style={{ color: '#52c41a' }} />
                <Text strong style={{ color: '#52c41a' }}>
                  {formatNumber(task.results_summary?.notes_count || 0)}
                </Text>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="评论数">
              <Space>
                <CommentOutlined style={{ color: '#1890ff' }} />
                <Text strong style={{ color: '#1890ff' }}>
                  {formatNumber(task.results_summary?.comments_count || 0)}
                </Text>
              </Space>
            </Descriptions.Item>

            {task.results_summary?.creators_count !== undefined && (
              <Descriptions.Item label="创作者数">
                <Space>
                  <UserOutlined style={{ color: '#722ed1' }} />
                  <Text strong style={{ color: '#722ed1' }}>
                    {formatNumber(task.results_summary.creators_count)}
                  </Text>
                </Space>
              </Descriptions.Item>
            )}

            {task.results_summary?.images_downloaded !== undefined && (
              <Descriptions.Item label="下载图片">
                <Space>
                  <FileImageOutlined style={{ color: '#13c2c2' }} />
                  <Text strong style={{ color: '#13c2c2' }}>
                    {formatNumber(task.results_summary.images_downloaded)}
                  </Text>
                </Space>
              </Descriptions.Item>
            )}

            {task.results_summary?.videos_downloaded !== undefined && (
              <Descriptions.Item label="下载视频">
                <Space>
                  <PlayCircleOutlined style={{ color: '#fa8c16' }} />
                  <Text strong style={{ color: '#fa8c16' }}>
                    {formatNumber(task.results_summary.videos_downloaded)}
                  </Text>
                </Space>
              </Descriptions.Item>
            )}
          </>
        ) : (
          <>
            <Descriptions.Item label="当前进度">
              <Space>
                <FileTextOutlined style={{ color: '#52c41a' }} />
                <Text strong style={{ color: '#52c41a' }}>
                  {formatNumber(task.progress?.current || 0)}
                </Text>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="总计">
              <Space>
                <FileTextOutlined style={{ color: '#1890ff' }} />
                <Text strong style={{ color: '#1890ff' }}>
                  {formatNumber(task.progress?.total || 0)}
                </Text>
              </Space>
            </Descriptions.Item>
          </>
        )}
      </Descriptions>
    </div>
  );
};

export default XhsTaskDetail;
