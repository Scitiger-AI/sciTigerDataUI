"use client";

import React, { useState } from 'react';
import {
  Table,
  Tag,
  Button,
  Space,
  Tooltip,
  Typography,
  Popconfirm,
  Modal,
  Descriptions,
} from 'antd';
import { App } from 'antd';
import {
  PlayCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { CrawlTask, TaskType, ScheduleType, TaskStatus } from '@/types/task';
import {
  TASK_STATUS_CONFIG,
  TASK_TYPE_CONFIG,
  SCHEDULE_TYPE_CONFIG,
} from '@/types/task';
import { taskService } from '@/services/taskService';
import dayjs from 'dayjs';

const { Text } = Typography;

interface TaskTableProps {
  tasks: CrawlTask[];
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  onPageChange: (page: number, pageSize: number) => void;
  onRefresh: () => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  loading,
  pagination,
  onPageChange,
  onRefresh,
}) => {
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<CrawlTask | null>(null);
  const { message, modal } = App.useApp();

  // 查看任务详情
  const handleViewDetail = (task: CrawlTask) => {
    setSelectedTask(task);
    setDetailVisible(true);
  };

  // 执行任务
  const handleExecuteTask = async (task: CrawlTask) => {
    try {
      await taskService.executeTask(task.id);
      message.success('任务已提交执行');
      onRefresh();
    } catch (error: any) {
      console.error('执行任务失败:', error);
      message.error(error.message || '执行任务失败');
    }
  };

  // 删除任务
  const handleDeleteTask = async (task: CrawlTask) => {
    try {
      await taskService.deleteTask(task.id);
      message.success('任务删除成功');
      onRefresh();
    } catch (error: any) {
      console.error('删除任务失败:', error);
      message.error(error.message || '删除任务失败');
    }
  };

  // 格式化时间
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '-';
    return dayjs(timeStr).format('YYYY-MM-DD HH:mm:ss');
  };

  // 获取执行时间显示
  const getExecutionTimeDisplay = (task: CrawlTask) => {
    if (task.schedule_type === 'immediate') {
      return '立即执行';
    } else if (task.schedule_type === 'once' && task.scheduled_time) {
      return formatTime(task.scheduled_time);
    } else if (task.schedule_type === 'cron' && task.cron_expression) {
      return task.cron_expression;
    }
    return '-';
  };

  // 获取执行进度显示
  const getProgressDisplay = (task: CrawlTask) => {
    const { articles_fetched, articles_crawled, articles_skipped } = task;
    const total = articles_fetched + articles_crawled + articles_skipped;
    
    if (total === 0) return '-';
    
    return (
      <Space direction="vertical" size={0}>
        <Text style={{ fontSize: '12px' }}>
          获取: {articles_fetched} | 爬取: {articles_crawled} | 跳过: {articles_skipped}
        </Text>
        <Text type="secondary" style={{ fontSize: '11px' }}>
          总计: {total}
        </Text>
      </Space>
    );
  };

  // 表格列定义
  const columns: ColumnsType<CrawlTask> = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text, record) => (
        <Tooltip title={text}>
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            {record.description && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.description.length > 30 
                  ? `${record.description.slice(0, 30)}...` 
                  : record.description}
              </Text>
            )}
          </div>
        </Tooltip>
      ),
    },
    {
      title: '任务类型',
      dataIndex: 'task_type',
      key: 'task_type',
      width: 100,
      render: (type: TaskType) => {
        const config = TASK_TYPE_CONFIG[type];
        return (
          <Tag color={config.color}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '调度类型',
      dataIndex: 'schedule_type',
      key: 'schedule_type',
      width: 100,
      render: (type: ScheduleType) => {
        const config = SCHEDULE_TYPE_CONFIG[type];
        return (
          <Tag color={config.color}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '执行时间',
      key: 'execution_time',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: '12px' }}>
            {getExecutionTimeDisplay(record)}
          </Text>
          {record.schedule_type === 'cron' && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              定时任务
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: TaskStatus) => {
        const config = TASK_STATUS_CONFIG[status];
        return (
          <Tag color={config.color}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '执行进度',
      key: 'progress',
      width: 150,
      render: (_, record) => getProgressDisplay(record),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 140,
      render: (time) => (
        <Text style={{ fontSize: '12px' }}>
          {formatTime(time)}
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          
          {record.status === 'pending' && (
            <Tooltip title="立即执行">
              <Button
                type="text"
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleExecuteTask(record)}
              />
            </Tooltip>
          )}
          
          {record.status !== 'running' && (
            <Popconfirm
              title="确认删除"
              description="确定要删除这个任务吗？"
              onConfirm={() => handleDeleteTask(record)}
              okText="确认"
              cancelText="取消"
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={tasks}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
        scroll={{ x: 1200 }}
        size="small"
      />

      {/* 任务详情模态框 */}
      <Modal
        title="任务详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedTask && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="任务ID" span={2}>
              {selectedTask.id}
            </Descriptions.Item>
            <Descriptions.Item label="任务名称">
              {selectedTask.name}
            </Descriptions.Item>
            <Descriptions.Item label="任务类型">
              <Tag color={TASK_TYPE_CONFIG[selectedTask.task_type].color}>
                {TASK_TYPE_CONFIG[selectedTask.task_type].text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="调度类型">
              <Tag color={SCHEDULE_TYPE_CONFIG[selectedTask.schedule_type].color}>
                {SCHEDULE_TYPE_CONFIG[selectedTask.schedule_type].text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={TASK_STATUS_CONFIG[selectedTask.status].color}>
                {TASK_STATUS_CONFIG[selectedTask.status].text}
              </Tag>
            </Descriptions.Item>
            {selectedTask.description && (
              <Descriptions.Item label="任务描述" span={2}>
                {selectedTask.description}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="公众号名称">
              {selectedTask.nick_name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="公众号标识">
              {selectedTask.biz || selectedTask.wxid || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="最大页数">
              {selectedTask.max_pages}
            </Descriptions.Item>
            <Descriptions.Item label="AI去噪">
              {selectedTask.enable_denoise ? '开启' : '关闭'}
            </Descriptions.Item>
            <Descriptions.Item label="启用代理">
              {selectedTask.enable_proxy ? '开启' : '关闭'}
            </Descriptions.Item>
            <Descriptions.Item label="执行时间">
              {getExecutionTimeDisplay(selectedTask)}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {formatTime(selectedTask.created_at)}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {formatTime(selectedTask.updated_at)}
            </Descriptions.Item>
            {selectedTask.started_at && (
              <Descriptions.Item label="开始时间">
                {formatTime(selectedTask.started_at)}
              </Descriptions.Item>
            )}
            {selectedTask.completed_at && (
              <Descriptions.Item label="完成时间">
                {formatTime(selectedTask.completed_at)}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="文章获取">
              {selectedTask.articles_fetched}
            </Descriptions.Item>
            <Descriptions.Item label="文章爬取">
              {selectedTask.articles_crawled}
            </Descriptions.Item>
            <Descriptions.Item label="文章跳过">
              {selectedTask.articles_skipped}
            </Descriptions.Item>
            {selectedTask.error_message && (
              <Descriptions.Item label="错误信息" span={2}>
                <Text type="danger">{selectedTask.error_message}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

export default TaskTable;
