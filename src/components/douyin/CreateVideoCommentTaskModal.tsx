"use client";

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  Space,
  Typography,
  Alert,
  Divider,
  App,
  Collapse,
} from 'antd';
import {
  InfoCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { DouyinVideo } from '@/types/douyin';
import douyinService from '@/services/douyin';

const { Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface CreateVideoCommentTaskModalProps {
  visible: boolean;
  video: DouyinVideo | null;
  onCancel: () => void;
  onSuccess?: () => void;
}

const CreateVideoCommentTaskModal: React.FC<CreateVideoCommentTaskModalProps> = ({
  visible,
  video,
  onCancel,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [scheduleType, setScheduleType] = useState<'immediate' | 'once' | 'cron'>('immediate');

  // 当视频改变时,重置表单
  useEffect(() => {
    if (visible && video) {
      form.setFieldsValue({
        name: `评论采集 - ${video.title || video.desc?.substring(0, 30) || video.aweme_id}`,
        aweme_ids: [video.aweme_id],
        schedule_type: 'immediate',
        comment_enabled: true,
        max_per_note: 500,
        include_sub_comments: true,
        max_sub_per_comment: 10,
        sort_by: 'time',
        media_enabled: false,
        download_videos: false,
        download_images: false,
      });
      setScheduleType('immediate');
    }
  }, [visible, video, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 构建任务请求数据
      const taskData: any = {
        name: values.name,
        task_type: 'detail',
        aweme_ids: values.aweme_ids,
        schedule_type: values.schedule_type,

        // 评论配置
        comment_config: {
          enabled: values.comment_enabled,
          max_per_note: values.max_per_note,
          include_sub_comments: values.include_sub_comments,
          max_sub_per_comment: values.max_sub_per_comment,
          sort_by: values.sort_by,
        },

        // 媒体下载配置
        media_download_config: {
          enabled: values.media_enabled,
          download_videos: values.download_videos,
          download_images: values.download_images,
        },

        save_to_mongodb: true,
        enable_resume: true,
        enable_proxy: false,
      };

      // 添加调度配置
      if (values.schedule_type === 'once' && values.scheduled_time) {
        taskData.scheduled_time = values.scheduled_time;
      } else if (values.schedule_type === 'cron' && values.cron_expression) {
        taskData.cron_expression = values.cron_expression;
      }

      // 调用API创建任务
      const response = await douyinService.createDetailTask(taskData);

      if (response.success) {
        message.success('任务创建成功');
        form.resetFields();
        onCancel();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        message.error(response.message || '任务创建失败');
      }
    } catch (error: any) {
      console.error('创建任务失败:', error);
      if (error.errorFields) {
        // 表单验证错误
        message.error('请检查表单填写');
      } else {
        message.error(error.message || '任务创建失败');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="创建单视频评论采集任务"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
      okText="创建任务"
      cancelText="取消"
    >
      {video && (
        <>
          <Alert
            message="视频信息"
            description={
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text strong>视频标题: </Text>
                <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
                  {video.title || video.desc || '无标题'}
                </Paragraph>
                <Text type="secondary">视频ID: {video.aweme_id}</Text>
                <Text type="secondary">作者: {video.nickname}</Text>
                {video.comment_count && (
                  <Text type="secondary">
                    当前评论数: {typeof video.comment_count === 'string'
                      ? parseInt(video.comment_count).toLocaleString()
                      : video.comment_count.toLocaleString()}
                  </Text>
                )}
              </Space>
            }
            type="info"
            icon={<InfoCircleOutlined />}
            style={{ marginBottom: 24 }}
          />

          <Form
            form={form}
            layout="vertical"
            initialValues={{
              schedule_type: 'immediate',
              comment_enabled: true,
              max_per_note: 500,
              include_sub_comments: true,
              max_sub_per_comment: 10,
              sort_by: 'time',
              media_enabled: false,
            }}
          >
            {/* 任务名称 */}
            <Form.Item
              label="任务名称"
              name="name"
              rules={[{ required: true, message: '请输入任务名称' }]}
            >
              <Input placeholder="请输入任务名称" maxLength={100} />
            </Form.Item>

            {/* 隐藏字段 */}
            <Form.Item name="aweme_ids" hidden>
              <Input />
            </Form.Item>

            <Divider orientation="left">调度配置</Divider>

            {/* 调度类型 */}
            <Form.Item
              label="调度类型"
              name="schedule_type"
              rules={[{ required: true, message: '请选择调度类型' }]}
            >
              <Select
                onChange={(value) => setScheduleType(value as any)}
                placeholder="选择调度类型"
              >
                <Option value="immediate">
                  <Space>
                    <span>立即执行</span>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      (创建后立即开始采集)
                    </Text>
                  </Space>
                </Option>
                <Option value="once">
                  <Space>
                    <ClockCircleOutlined />
                    <span>定时执行</span>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      (指定时间执行一次)
                    </Text>
                  </Space>
                </Option>
                <Option value="cron">
                  <Space>
                    <ClockCircleOutlined />
                    <span>周期执行</span>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      (定期重复执行,持续监控)
                    </Text>
                  </Space>
                </Option>
              </Select>
            </Form.Item>

            {/* 定时执行时间 */}
            {scheduleType === 'once' && (
              <Form.Item
                label="执行时间"
                name="scheduled_time"
                rules={[{ required: true, message: '请选择执行时间' }]}
              >
                <Input
                  type="datetime-local"
                  placeholder="选择执行时间"
                />
              </Form.Item>
            )}

            {/* Cron 表达式 */}
            {scheduleType === 'cron' && (
              <>
                <Form.Item
                  label="Cron 表达式"
                  name="cron_expression"
                  rules={[
                    { required: true, message: '请输入 Cron 表达式' },
                    {
                      pattern: /^(\S+\s){4}\S+$/,
                      message: 'Cron 表达式格式错误,应为5个字段',
                    },
                  ]}
                  extra={
                    <Space direction="vertical" size="small" style={{ marginTop: 8 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        标准 Cron 格式: 分 时 日 月 周 (5个字段)
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        示例:
                      </Text>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        <li><Text code>0 * * * *</Text> - 每小时执行一次</li>
                        <li><Text code>0 */2 * * *</Text> - 每2小时执行一次</li>
                        <li><Text code>0 9 * * *</Text> - 每天早上9点</li>
                        <li><Text code>0 9,21 * * *</Text> - 每天9点和21点</li>
                        <li><Text code>0 9 * * 1</Text> - 每周一早上9点</li>
                      </ul>
                    </Space>
                  }
                >
                  <Input placeholder="例如: 0 9 * * * (每天早上9点)" />
                </Form.Item>
              </>
            )}

            <Divider orientation="left">评论采集配置</Divider>

            {/* 是否采集评论 */}
            <Form.Item
              label="启用评论采集"
              name="comment_enabled"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.comment_enabled !== curr.comment_enabled}>
              {({ getFieldValue }) =>
                getFieldValue('comment_enabled') && (
                  <>
                    {/* 每个视频最大评论数 */}
                    <Form.Item
                      label="每个视频最大评论数"
                      name="max_per_note"
                      rules={[{ required: true, message: '请输入最大评论数' }]}
                      extra="建议设置 200-1000,获取足够多的评论数据"
                    >
                      <InputNumber
                        min={0}
                        max={1000}
                        style={{ width: '100%' }}
                        placeholder="0-1000"
                      />
                    </Form.Item>

                    {/* 评论排序方式 */}
                    <Form.Item
                      label="评论排序方式"
                      name="sort_by"
                      rules={[{ required: true, message: '请选择排序方式' }]}
                      extra="time: 获取最新评论(推荐监控); hot: 获取热门评论(推荐分析)"
                    >
                      <Select>
                        <Option value="time">按时间排序 (最新评论)</Option>
                        <Option value="hot">按热度排序 (热门评论)</Option>
                      </Select>
                    </Form.Item>

                    {/* 是否采集二级评论 */}
                    <Form.Item
                      label="采集二级评论"
                      name="include_sub_comments"
                      valuePropName="checked"
                      extra="开启后会采集每条一级评论下的回复"
                    >
                      <Switch />
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate={(prev, curr) => prev.include_sub_comments !== curr.include_sub_comments}>
                      {({ getFieldValue }) =>
                        getFieldValue('include_sub_comments') && (
                          <Form.Item
                            label="每条一级评论最多二级评论数"
                            name="max_sub_per_comment"
                            rules={[{ required: true, message: '请输入最大二级评论数' }]}
                          >
                            <InputNumber
                              min={0}
                              max={50}
                              style={{ width: '100%' }}
                              placeholder="0-50"
                            />
                          </Form.Item>
                        )
                      }
                    </Form.Item>
                  </>
                )
              }
            </Form.Item>

            {/* 可折叠的媒体下载配置 */}
            <Collapse
              ghost
              items={[
                {
                  key: 'media',
                  label: '媒体下载配置 (可选)',
                  children: (
                    <>
                      <Form.Item
                        label="启用媒体下载"
                        name="media_enabled"
                        valuePropName="checked"
                        extra="通常评论采集任务不需要下载视频"
                      >
                        <Switch />
                      </Form.Item>

                      <Form.Item noStyle shouldUpdate={(prev, curr) => prev.media_enabled !== curr.media_enabled}>
                        {({ getFieldValue }) =>
                          getFieldValue('media_enabled') && (
                            <>
                              <Form.Item
                                label="下载视频"
                                name="download_videos"
                                valuePropName="checked"
                              >
                                <Switch />
                              </Form.Item>

                              <Form.Item
                                label="下载图片"
                                name="download_images"
                                valuePropName="checked"
                              >
                                <Switch />
                              </Form.Item>
                            </>
                          )
                        }
                      </Form.Item>
                    </>
                  ),
                },
              ]}
            />
          </Form>
        </>
      )}
    </Modal>
  );
};

export default CreateVideoCommentTaskModal;
