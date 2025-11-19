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
} from '@ant-design/icons';
import type { DouyinTask } from '@/types/douyin';
import { DOUYIN_TASK_STATUS_CONFIG, DOUYIN_TASK_TYPE_CONFIG } from '@/types/douyin';

const { Text, Paragraph } = Typography;

interface DouyinTaskDetailProps {
  task: DouyinTask | null;
  loading?: boolean;
}

export const DouyinTaskDetail: React.FC<DouyinTaskDetailProps> = ({
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

  const statusConfig = DOUYIN_TASK_STATUS_CONFIG[task.status] || { color: 'default', text: task.status };
  const typeConfig = DOUYIN_TASK_TYPE_CONFIG[task.task_type] || { color: 'default', text: task.task_type };

  return (
    <div>
      {/* 错误信息提示 */}
      {task.error && (
        <Alert
          message="任务执行错误"
          description={task.error}
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
        <Descriptions.Item label="任务ID" span={2}>
          <Text code style={{ wordBreak: 'break-all' }}>
            {task.task_id}
          </Text>
        </Descriptions.Item>

        <Descriptions.Item label="任务类型">
          <Tag color={typeConfig.color}>{typeConfig.text}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="任务状态">
          <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
        </Descriptions.Item>

        {task.platform && (
          <Descriptions.Item label="平台">
            <Text>{task.platform}</Text>
          </Descriptions.Item>
        )}

        {task.message && (
          <Descriptions.Item label="状态消息" span={2}>
            <Text type={task.status === 'failed' ? 'danger' : 'secondary'}>
              {task.message}
            </Text>
          </Descriptions.Item>
        )}
      </Descriptions>

      {/* 任务配置 */}
      {task.config && (
        <Descriptions
          title="任务配置"
          bordered
          column={2}
          size="small"
          style={{ marginTop: '24px' }}
        >
          {task.config.keywords && (
            <Descriptions.Item label="搜索关键词" span={2}>
              <Text strong>{task.config.keywords}</Text>
            </Descriptions.Item>
          )}

          {task.config.user_id && (
            <Descriptions.Item label="用户ID" span={2}>
              <Text code style={{ wordBreak: 'break-all' }}>
                {task.config.user_id}
              </Text>
            </Descriptions.Item>
          )}

          {task.config.aweme_ids && task.config.aweme_ids.length > 0 && (
            <Descriptions.Item label="视频ID列表" span={2}>
              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {task.config.aweme_ids.map((id, index) => (
                  <Tag key={index} style={{ marginBottom: '4px' }}>
                    {id}
                  </Tag>
                ))}
              </div>
            </Descriptions.Item>
          )}

          {task.config.max_count !== undefined && (
            <Descriptions.Item label="最大采集数量">
              <Text>{formatNumber(task.config.max_count)}</Text>
            </Descriptions.Item>
          )}

          {task.config.start_page !== undefined && (
            <Descriptions.Item label="起始页码">
              <Text>{formatNumber(task.config.start_page)}</Text>
            </Descriptions.Item>
          )}

          {task.config.comment_config && (
            <>
              <Descriptions.Item label="评论采集">
                <Tag color={task.config.comment_config.enabled ? 'success' : 'default'}>
                  {task.config.comment_config.enabled ? '已启用' : '未启用'}
                </Tag>
              </Descriptions.Item>

              {task.config.comment_config.enabled && (
                <>
                  {task.config.comment_config.max_per_note !== undefined && (
                    <Descriptions.Item label="每视频最大评论数">
                      <Text>{formatNumber(task.config.comment_config.max_per_note)}</Text>
                    </Descriptions.Item>
                  )}

                  {task.config.comment_config.include_sub_comments !== undefined && (
                    <Descriptions.Item label="包含子评论">
                      <Tag color={task.config.comment_config.include_sub_comments ? 'success' : 'default'}>
                        {task.config.comment_config.include_sub_comments ? '是' : '否'}
                      </Tag>
                    </Descriptions.Item>
                  )}

                  {task.config.comment_config.sort_by && (
                    <Descriptions.Item label="评论排序">
                      <Text>{task.config.comment_config.sort_by}</Text>
                    </Descriptions.Item>
                  )}
                </>
              )}
            </>
          )}

          {task.config.media_download_config && (
            <>
              <Descriptions.Item label="媒体下载" span={2}>
                <Tag color={task.config.media_download_config.enabled ? 'success' : 'default'}>
                  {task.config.media_download_config.enabled ? '已启用' : '未启用'}
                </Tag>
              </Descriptions.Item>

              {task.config.media_download_config.enabled && (
                <>
                  {task.config.media_download_config.save_path && (
                    <Descriptions.Item label="保存路径" span={2}>
                      <Text code style={{ wordBreak: 'break-all' }}>
                        {task.config.media_download_config.save_path}
                      </Text>
                    </Descriptions.Item>
                  )}

                  <Descriptions.Item label="下载图片">
                    <Tag color={task.config.media_download_config.download_images ? 'success' : 'default'}>
                      {task.config.media_download_config.download_images ? '是' : '否'}
                    </Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="下载视频">
                    <Tag color={task.config.media_download_config.download_videos ? 'success' : 'default'}>
                      {task.config.media_download_config.download_videos ? '是' : '否'}
                    </Tag>
                  </Descriptions.Item>

                  {task.config.media_download_config.max_image_size_mb !== undefined && (
                    <Descriptions.Item label="最大图片大小">
                      <Text>{formatNumber(task.config.media_download_config.max_image_size_mb)} MB</Text>
                    </Descriptions.Item>
                  )}

                  {task.config.media_download_config.max_video_size_mb !== undefined && (
                    <Descriptions.Item label="最大视频大小">
                      <Text>{formatNumber(task.config.media_download_config.max_video_size_mb)} MB</Text>
                    </Descriptions.Item>
                  )}
                </>
              )}
            </>
          )}

          {task.config.save_to_mongodb !== undefined && (
            <Descriptions.Item label="保存到MongoDB">
              <Tag color={task.config.save_to_mongodb ? 'success' : 'default'}>
                {task.config.save_to_mongodb ? '是' : '否'}
              </Tag>
            </Descriptions.Item>
          )}

          {task.config.enable_resume !== undefined && (
            <Descriptions.Item label="启用断点续传">
              <Tag color={task.config.enable_resume ? 'success' : 'default'}>
                {task.config.enable_resume ? '是' : '否'}
              </Tag>
            </Descriptions.Item>
          )}

          {task.config.enable_proxy !== undefined && (
            <Descriptions.Item label="启用代理">
              <Tag color={task.config.enable_proxy ? 'success' : 'default'}>
                {task.config.enable_proxy ? '是' : '否'}
              </Tag>
            </Descriptions.Item>
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

        <Descriptions.Item label="开始时间">
          <Space>
            <PlayCircleOutlined style={{ color: '#52c41a' }} />
            {formatTime(task.started_at)}
          </Space>
        </Descriptions.Item>

        {task.updated_at && (
          <Descriptions.Item label="更新时间">
            <Space>
              <ClockCircleOutlined style={{ color: '#faad14' }} />
              {formatTime(task.updated_at)}
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

      </Descriptions>

      {/* 结果统计 */}
      {task.results_summary && (
        <Descriptions
          title="结果统计"
          bordered
          column={2}
          size="small"
          style={{ marginTop: '24px' }}
        >
          <Descriptions.Item label="视频数">
            <Space>
              <PlayCircleOutlined style={{ color: '#52c41a' }} />
              <Text strong style={{ color: '#52c41a' }}>
                {formatNumber(task.results_summary.notes_count)}
              </Text>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="评论数">
            <Space>
              <CommentOutlined style={{ color: '#1890ff' }} />
              <Text strong style={{ color: '#1890ff' }}>
                {formatNumber(task.results_summary.comments_count)}
              </Text>
            </Space>
          </Descriptions.Item>

          {task.results_summary.creators_count > 0 && (
            <Descriptions.Item label="创作者数">
              <Space>
                <UserOutlined style={{ color: '#722ed1' }} />
                <Text strong style={{ color: '#722ed1' }}>
                  {formatNumber(task.results_summary.creators_count)}
                </Text>
              </Space>
            </Descriptions.Item>
          )}
        </Descriptions>
      )}
    </div>
  );
};

export default DouyinTaskDetail;

