"use client";

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Select,
  Row,
  Col,
  Statistic,
  Alert,
} from 'antd';
import { App } from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import type { WechatAccount } from '@/types/wechat';
import type { CrawlTask, TaskListParams, ScheduleType, TaskStatus } from '@/types/task';
import { TaskForm } from './TaskForm';
import { TaskTable } from './TaskTable';
import { taskService } from '@/services/taskService';
import { 
  SCHEDULE_TYPE_OPTIONS, 
  TASK_STATUS_CONFIG,
  SCHEDULE_TYPE_CONFIG 
} from '@/types/task';

const { Title, Text } = Typography;
const { Option } = Select;

interface TaskManagementProps {
  accountId: string;
  accountInfo?: {
    biz: string;
    wx_id?: string;
    nick_name: string;
  };
}

export const TaskManagement: React.FC<TaskManagementProps> = ({ accountId, accountInfo }) => {
  const [tasks, setTasks] = useState<CrawlTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [filters, setFilters] = useState<TaskListParams>({
    page: 1,
    page_size: 10,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const { message } = App.useApp();

  // 加载任务列表
  const loadTasks = async () => {
    if (!accountInfo?.biz) {
      console.warn('公众号BIZ为空，无法加载任务');
      return;
    }

    try {
      setLoading(true);
      const response = await taskService.getAccountTasks(accountInfo.biz, filters);
      setTasks(response.items);
      setPagination({
        current: response.page,
        pageSize: response.page_size,
        total: response.total,
      });
    } catch (error: any) {
      console.error('加载任务列表失败:', error);
      message.error(error.message || '加载任务列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 页面变化处理
  const handlePageChange = (page: number, pageSize: number) => {
    setFilters(prev => ({
      ...prev,
      page,
      page_size: pageSize,
    }));
  };

  // 筛选变化处理
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // 重置到第一页
    }));
  };

  // 创建任务成功回调
  const handleCreateSuccess = () => {
    setFormVisible(false);
    loadTasks();
  };

  // 刷新任务列表
  const handleRefresh = () => {
    loadTasks();
  };

  // 获取任务统计
  const getTaskStats = () => {
    const stats = {
      total: tasks.length,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
    };

    tasks.forEach(task => {
      stats[task.status as keyof typeof stats]++;
    });

    return stats;
  };

  // 初始化加载
  useEffect(() => {
    if (accountInfo?.biz) {
      loadTasks();
    }
  }, [accountInfo?.biz, filters]);

  const stats = getTaskStats();

  return (
    <div>
      {/* 公众号BIZ检查 */}
      {!accountInfo?.biz && (
        <Alert
          message="无法加载任务"
          description="该公众号缺少BIZ参数，无法创建和管理采集任务"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {accountInfo?.biz && (
        <>
          {/* 任务统计 */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Statistic
                title="总计"
                value={stats.total}
                prefix={<SyncOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="等待执行"
                value={stats.pending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="执行中"
                value={stats.running}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="已完成"
                value={stats.completed}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
          </Row>

          {/* 筛选器 */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Select
                placeholder="筛选调度类型"
                allowClear
                style={{ width: '100%' }}
                onChange={(value) => handleFilterChange('schedule_type', value)}
              >
                {SCHEDULE_TYPE_OPTIONS.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={8}>
              <Select
                placeholder="筛选任务状态"
                allowClear
                style={{ width: '100%' }}
                onChange={(value) => handleFilterChange('status', value)}
              >
                {Object.entries(TASK_STATUS_CONFIG).map(([key, config]) => (
                  <Option key={key} value={key}>
                    {config.text}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={8}>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setFormVisible(true)}
                >
                  创建任务
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={loading}
                >
                  刷新
                </Button>
              </Space>
            </Col>
          </Row>

          {/* 任务列表表格 */}
          <TaskTable
            tasks={tasks}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onRefresh={handleRefresh}
          />
        </>
      )}

      {/* 创建任务表单 */}
      <TaskForm
        visible={formVisible}
        onCancel={() => setFormVisible(false)}
        onSuccess={handleCreateSuccess}
        accountId={accountId}
        accountInfo={accountInfo}
      />
    </div>
  );
};

export default TaskManagement;
