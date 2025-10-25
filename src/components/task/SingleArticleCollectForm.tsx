"use client";

import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Space,
  Typography,
  Alert,
  Row,
  Col,
  Card,
  Tooltip,
} from 'antd';
import { App } from 'antd';
import {
  QuestionCircleOutlined,
  CheckCircleOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import type { WechatAccount } from '@/types/wechat';
import { taskService } from '@/services/taskService';

const { TextArea } = Input;
const { Text } = Typography;

interface SingleArticleCollectFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  accounts: WechatAccount[];
}

interface FormValues {
  name: string;
  description?: string;
  url: string;
  accountId?: string;
  enable_denoise: boolean;
  enable_rewrite: boolean;
  enable_proxy: boolean;
  collect_videos: boolean;
}

export const SingleArticleCollectForm: React.FC<SingleArticleCollectFormProps> = ({
  visible,
  onCancel,
  onSuccess,
  accounts,
}) => {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  // 重置表单
  const resetForm = () => {
    form.resetFields();
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // 构建基础请求数据
      const requestData: any = {
        name: values.name,
        description: values.description,
        task_type: 'single_article',
        url: values.url,
        
        // 采集配置
        enable_denoise: values.enable_denoise ?? true,
        enable_rewrite: values.enable_rewrite ?? true,
        enable_proxy: values.enable_proxy ?? true,
        collect_videos: values.collect_videos ?? false,
        
        // 立即执行
        schedule_type: 'immediate',
      };
      
      // 只有在用户选择了公众号时，才添加公众号信息
      if (values.accountId) {
        const selectedAccount = accounts.find(acc => acc.id === values.accountId);
        if (selectedAccount) {
          requestData.biz = selectedAccount.biz;
          requestData.wxid = selectedAccount.wx_id;
          requestData.nick_name = selectedAccount.nick_name;
        }
      }
      
      await taskService.createTask(requestData);
      message.success('采集任务已创建，将开始处理');
      resetForm();
      onSuccess();
    } catch (error: any) {
      console.error('创建采集任务失败:', error);
      message.error(error.message || '创建采集任务失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理模态框关闭
  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  return (
    <Modal
      title="采集单篇文章"
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={720}
      destroyOnClose
      okText="创建任务"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: '采集单篇文章',
          enable_denoise: true,
          enable_rewrite: true,
          enable_proxy: true,
          collect_videos: true,
        }}
      >
        {/* 使用提示 */}
        <Card 
          size="small" 
          title="💡 使用提示" 
          style={{ marginBottom: 16, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}
        >
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text style={{ fontSize: '13px' }}>
              <CheckCircleOutlined style={{ color: '#52c41a' }} /> 
              {' '}推荐方式：如果知道文章所属公众号，建议选择关联，可加快采集速度
            </Text>
            <Text style={{ fontSize: '13px' }}>
              <RobotOutlined style={{ color: '#1890ff' }} /> 
              {' '}自动方式：不确定公众号？留空即可，系统将自动识别
            </Text>
          </Space>
        </Card>

        {/* 基本信息 */}
        <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
          <Form.Item
            name="name"
            label="任务名称"
            rules={[
              { required: true, message: '请输入任务名称' },
              { max: 100, message: '任务名称最多100个字符' }
            ]}
          >
            <Input placeholder="为这次采集任务起个名字" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="任务描述"
            rules={[{ max: 500, message: '任务描述最多500个字符' }]}
          >
            <TextArea 
              placeholder="可选，添加任务备注信息" 
              rows={2}
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Card>

        {/* 文章信息 */}
        <Card title="文章信息" size="small" style={{ marginBottom: 16 }}>
          <Form.Item
            name="url"
            label="文章URL"
            rules={[
              { required: true, message: '请输入文章URL' },
              { type: 'url', message: '请输入有效的URL' },
              { 
                pattern: /^https?:\/\/mp\.weixin\.qq\.com\/s/,
                message: '请输入微信公众号文章链接（以 https://mp.weixin.qq.com/s 开头）'
              }
            ]}
            extra="请输入完整的微信公众号文章链接"
          >
            <Input 
              placeholder="https://mp.weixin.qq.com/s/xxxxxxxxxxx"
            />
          </Form.Item>
          
          <Form.Item
            name="accountId"
            label={
              <Space>
                <span>关联公众号</span>
                <Tooltip title="可选项。选择后可提高采集速度，不选则后端自动解析">
                  <QuestionCircleOutlined style={{ color: '#999' }} />
                </Tooltip>
              </Space>
            }
            extra="选填：指定文章所属公众号，不选则自动识别"
          >
            <Select
              showSearch
              allowClear
              placeholder="选择公众号（可选，留空则自动识别）"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={accounts.map(acc => ({
                label: `${acc.nick_name}${acc.biz ? ` (${acc.biz.slice(0, 10)}...)` : ''}`,
                value: acc.id,
              }))}
            />
          </Form.Item>
        </Card>

        {/* 采集配置 */}
        <Card title="采集配置" size="small">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="enable_denoise"
                label="启用AI去噪"
                valuePropName="checked"
                tooltip="使用AI技术去除文章中的广告、推广等干扰内容"
              >
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="enable_rewrite"
                label="启用AI重写"
                valuePropName="checked"
                tooltip="使用AI技术重写文章内容，使其更加流畅易读"
              >
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="enable_proxy"
                label="启用代理"
                valuePropName="checked"
                tooltip="使用代理服务器进行采集，提高稳定性"
              >
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="collect_videos"
                label="采集视频"
                valuePropName="checked"
                tooltip="同时采集文章中的视频内容"
              >
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
};

export default SingleArticleCollectForm;

