"use client";

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  DatePicker,
  Space,
  Typography,
  Alert,
  Row,
  Col,
  Card,
} from 'antd';
import { App } from 'antd';
import type { WechatAccount } from '@/types/wechat';
import type { 
  TaskFormData, 
  TaskType, 
  ScheduleType 
} from '@/types/task';
import {
  TASK_TYPE_OPTIONS,
  SCHEDULE_TYPE_OPTIONS 
} from '@/types/task';
import { taskService } from '@/services/taskService';
import dayjs from 'dayjs';
import { formatLocalToUTC } from '@/utils/dateUtils';

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

interface TaskFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  accountId: string;
  accountInfo?: {
    biz: string;
    wx_id?: string;
    nick_name: string;
  };
}

export const TaskForm: React.FC<TaskFormProps> = ({
  visible,
  onCancel,
  onSuccess,
  accountId,
  accountInfo,
}) => {
  const [form] = Form.useForm<TaskFormData>();
  const [loading, setLoading] = useState(false);
  const [taskType, setTaskType] = useState<TaskType>('account_full');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('immediate');
  const { message } = App.useApp();

  // 重置表单
  const resetForm = () => {
    form.resetFields();
    setTaskType('account_full');
    setScheduleType('immediate');
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // 构造请求参数
      const requestData = {
        name: values.name,
        description: values.description,
        task_type: values.task_type,
        max_pages: values.max_pages,
        enable_denoise: values.enable_denoise,
        enable_rewrite: values.enable_rewrite,
        enable_proxy: values.enable_proxy,
        collect_videos: values.collect_videos,
        schedule_type: values.schedule_type,
        
        // 公众号标识参数
        biz: accountInfo?.biz || accountId,
        wxid: accountInfo?.wx_id,
        nick_name: accountInfo?.nick_name || '未知公众号',
        
        // 单篇文章URL（如果是单篇文章采集）
        ...(values.task_type === 'single_article' && values.url && {
          url: values.url,
        }),
        
        // 定时执行时间
        ...(values.schedule_type === 'once' && values.scheduled_time && {
          scheduled_time: formatLocalToUTC(values.scheduled_time),
        }),
        
        // Cron表达式
        ...(values.schedule_type === 'cron' && values.cron_expression && {
          cron_expression: values.cron_expression,
        }),
      };

      await taskService.createTask(requestData);
      message.success('任务创建成功');
      resetForm();
      onSuccess();
    } catch (error: any) {
      console.error('创建任务失败:', error);
      message.error(error.message || '创建任务失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理模态框关闭
  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  // 监听任务类型变化
  const handleTaskTypeChange = (value: TaskType) => {
    setTaskType(value);
    // 如果不是单篇文章采集，清除URL字段
    if (value !== 'single_article') {
      form.setFieldValue('url', undefined);
    }
  };

  // 监听调度类型变化
  const handleScheduleTypeChange = (value: ScheduleType) => {
    setScheduleType(value);
    // 清除其他调度相关字段
    if (value !== 'once') {
      form.setFieldValue('scheduled_time', undefined);
    }
    if (value !== 'cron') {
      form.setFieldValue('cron_expression', undefined);
    }
  };

  // 表单初始值
  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        task_type: 'account_full',
        max_pages: 1,
        enable_denoise: true,
        enable_rewrite: true,
        enable_proxy: true,
        collect_videos: true,
        schedule_type: 'immediate',
      });
    }
  }, [visible, form]);

  return (
    <Modal
      title="创建采集任务"
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          task_type: 'account_full',
          max_pages: 1,
          enable_denoise: true,
          enable_rewrite: true,
          enable_proxy: true,
          collect_videos: true,
          schedule_type: 'immediate',
        }}
      >
        <Row gutter={16}>
          {/* 基本信息 */}
          <Col span={24}>
            <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="任务名称"
                    rules={[
                      { required: true, message: '请输入任务名称' },
                      { max: 100, message: '任务名称最多100个字符' }
                    ]}
                  >
                    <Input placeholder="请输入任务名称" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="task_type"
                    label="任务类型"
                    rules={[{ required: true, message: '请选择任务类型' }]}
                  >
                    <Select onChange={handleTaskTypeChange}>
                      {TASK_TYPE_OPTIONS.map(option => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="description"
                label="任务描述"
                rules={[{ max: 500, message: '任务描述最多500个字符' }]}
              >
                <TextArea 
                  placeholder="请输入任务描述" 
                  rows={3}
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              {/* 单篇文章URL */}
              {taskType === 'single_article' && (
                <Form.Item
                  name="url"
                  label="文章URL"
                  rules={[
                    { required: true, message: '单篇文章采集必须提供文章URL' },
                    { type: 'url', message: '请输入有效的URL' }
                  ]}
                >
                  <Input placeholder="请输入公众号文章URL" />
                </Form.Item>
              )}
            </Card>
          </Col>

          {/* 公众号信息 */}
          <Col span={24}>
            <Card title="公众号信息" size="small" style={{ marginBottom: 16 }}>
              <Alert
                message="公众号标识参数"
                description={
                  <Space direction="vertical" size="small">
                    <Text>名称：{accountInfo?.nick_name || '未知公众号'}</Text>
                    <Text>微信号：{accountInfo?.wx_id || '暂无'}</Text>
                    <Text>BIZ：{accountInfo?.biz || accountId}</Text>
                  </Space>
                }
                type="info"
                showIcon
              />
            </Card>
          </Col>

          {/* 采集配置 */}
          <Col span={24}>
            <Card title="采集配置" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    name="max_pages"
                    label="最大爬取页数"
                    rules={[
                      { required: true, message: '请输入最大爬取页数' },
                      { type: 'number', min: 1, max: 100, message: '页数范围为1-100' }
                    ]}
                  >
                    <InputNumber 
                      min={1} 
                      max={100} 
                      style={{ width: '100%' }}
                      placeholder="默认为1"
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="enable_denoise"
                    label="启用AI去噪"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="enable_rewrite"
                    label="启用AI重写"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="enable_proxy"
                    label="启用代理"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    name="collect_videos"
                    label="采集视频"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* 调度配置 */}
          <Col span={24}>
            <Card title="调度配置" size="small">
              <Form.Item
                name="schedule_type"
                label="调度类型"
                rules={[{ required: true, message: '请选择调度类型' }]}
              >
                <Select onChange={handleScheduleTypeChange}>
                  {SCHEDULE_TYPE_OPTIONS.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* 定时执行配置 */}
              {scheduleType === 'once' && (
                <Form.Item
                  name="scheduled_time"
                  label="执行时间"
                  rules={[{ required: true, message: '请选择执行时间' }]}
                >
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder="请选择执行时间"
                    style={{ width: '100%' }}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                  />
                </Form.Item>
              )}

              {/* Cron表达式配置 */}
              {scheduleType === 'cron' && (
                <Form.Item
                  name="cron_expression"
                  label="Cron表达式"
                  rules={[
                    { required: true, message: '请输入Cron表达式' },
                    { 
                      pattern: /^(\*|[0-5]?\d)\s+(\*|[01]?\d|2[0-3])\s+(\*|[012]?\d|3[01])\s+(\*|[01]?\d)\s+(\*|[0-6])$/,
                      message: '请输入有效的Cron表达式（5个字段）'
                    }
                  ]}
                  extra="格式：分 时 日 月 周（例如：0 2 * * * 表示每天凌晨2点执行）"
                >
                  <Input placeholder="0 2 * * *" />
                </Form.Item>
              )}
            </Card>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default TaskForm;
