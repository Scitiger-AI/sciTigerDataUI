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
          <Tag>{task.schedule_type}</Tag>
        </Descriptions.Item>

        {task.scheduled_time && (
          <Descriptions.Item label="计划时间">
            <Text>{formatTime(task.scheduled_time)}</Text>
          </Descriptions.Item>
        )}

        {task.cron_expression && (
          <Descriptions.Item label="Cron表达式" span={2}>
            <Text code>{task.cron_expression}</Text>
          </Descriptions.Item>
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

        {task.creator_id && (
          <Descriptions.Item label="创作者ID" span={2}>
            <Text code style={{ wordBreak: 'break-all' }}>
              {task.creator_id}
            </Text>
          </Descriptions.Item>
        )}

        {task.aweme_ids && task.aweme_ids.length > 0 && (
          <Descriptions.Item label="视频ID列表" span={2}>
            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {task.aweme_ids.map((id, index) => (
                <Tag key={index} style={{ marginBottom: '4px' }}>
                  {id}
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

        {task.publish_time_type !== undefined && (
          <Descriptions.Item label="发布时间">
            <Tag>{task.publish_time_type === 0 ? '不限' :
              task.publish_time_type === 1 ? '一天内' :
                task.publish_time_type === 7 ? '一周内' :
                  task.publish_time_type === 182 ? '半年内' : task.publish_time_type}</Tag>
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
            <Space>
              <Text>MongoDB存储:</Text>
              {task.save_to_mongodb ? <Tag color="cyan">启用</Tag> : <Tag>禁用</Tag>}
            </Space>
          </Space>
        </Descriptions.Item>

        {task.comment_config && (
          <Descriptions.Item label="评论配置" span={2}>
            <Space direction="vertical" size={0}>
              <Text>启用: {task.comment_config.enabled ? '是' : '否'}</Text>
              {task.comment_config.enabled && (
                <>
                  <Text type="secondary" style={{ fontSize: 12 }}>每视频上限: {task.comment_config.max_per_note}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>二级评论: {task.comment_config.include_sub_comments ? '是' : '否'}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>排序: {task.comment_config.sort_by}</Text>
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
                  <Tag color={task.post_processing_config.extract_transcript ? "blue" : "default"}>
                    提取文案 {task.post_processing_config.extract_transcript ? "✓" : "✗"}
                  </Tag>
                  <Tag color={task.post_processing_config.denoise_transcript ? "cyan" : "default"}>
                    内容去噪 {task.post_processing_config.denoise_transcript ? "✓" : "✗"}
                  </Tag>
                  <Tag color={task.post_processing_config.rewrite_transcript ? "purple" : "default"}>
                    内容重写 {task.post_processing_config.rewrite_transcript ? "✓" : "✗"}
                  </Tag>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="重写风格">
                <Tag>{task.post_processing_config.rewrite_style || 'natural'}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="强制重处理">
                {task.post_processing_config.force_reprocess ? <Tag color="orange">是</Tag> : <Tag>否</Tag>}
              </Descriptions.Item>

              <Descriptions.Item label="批量大小">
                <Text>{task.post_processing_config.batch_size}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="并发限制">
                <Text>{task.post_processing_config.concurrent_limit}</Text>
              </Descriptions.Item>
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
            <Descriptions.Item label="视频数">
              <Space>
                <PlayCircleOutlined style={{ color: '#52c41a' }} />
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
          </>
        ) : (
          <>
            <Descriptions.Item label="当前进度">
              <Space>
                <PlayCircleOutlined style={{ color: '#52c41a' }} />
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

export default DouyinTaskDetail;

