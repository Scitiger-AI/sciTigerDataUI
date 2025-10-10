"use client";

import React from 'react';
import { Modal, Descriptions, Tag, Space, Typography, Avatar, Progress } from 'antd';
import {
  WechatOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  GlobalOutlined,
  CalendarOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  UserOutlined,
  PhoneOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import type { WechatAccount } from '@/types/wechat';

const { Text } = Typography;

interface WechatAccountDetailProps {
  open?: boolean;
  onCancel?: () => void;
  account: WechatAccount | null;
  loading?: boolean;
  showActions?: boolean;
}

// 认证状态配置
const VERIFY_STATUS_CONFIG = {
  '已认证': {
    color: 'success',
    icon: <CheckCircleOutlined />,
    text: '已认证',
  },
  '未认证': {
    color: 'warning',
    icon: <ExclamationCircleOutlined />,
    text: '未认证',
  },
} as const;

// 客户类型配置
const CUSTOMER_TYPE_CONFIG = {
  '个人': { color: 'default', text: '个人' },
  '媒体': { color: 'blue', text: '媒体' },
  '企业': { color: 'green', text: '企业' },
  '政府': { color: 'purple', text: '政府' },
  '其他': { color: 'orange', text: '其他' },
} as const;

export const WechatAccountDetail: React.FC<WechatAccountDetailProps> = ({
  open,
  onCancel,
  account,
  loading = false,
  showActions = true,
}) => {
  if (!account) return null;

  const verifyStatus = account.verify_status && VERIFY_STATUS_CONFIG[account.verify_status as keyof typeof VERIFY_STATUS_CONFIG];
  const customerType = account.customer_type && CUSTOMER_TYPE_CONFIG[account.customer_type as keyof typeof CUSTOMER_TYPE_CONFIG];
  
  // 计算采集进度
  const crawlProgress = account.total_articles > 0 
    ? Math.round((account.crawled_articles / account.total_articles) * 100)
    : 0;

  // 内容组件
  const content = (
    <div style={{ marginTop: open ? '20px' : '0' }}>
          {/* 基本信息 */}
          <Descriptions
            title="基本信息"
            bordered
            column={2}
            size="small"
          >
            <Descriptions.Item label="公众号名称" span={2}>
              <Space>
                <Text strong style={{ fontSize: '16px' }}>
                  {account.nick_name}
                </Text>
                {verifyStatus && (
                  <Tag color={verifyStatus.color} icon={verifyStatus.icon}>
                    {verifyStatus.text}
                  </Tag>
                )}
                {account.is_overseas === 1 && (
                  <Tag color="orange" icon={<GlobalOutlined />}>
                    海外
                  </Tag>
                )}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="公司名称">
              {account.company_name || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="所有者名称">
              {account.owner_name || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="客户类型">
              {customerType ? (
                <Tag color={customerType.color}>{customerType.text}</Tag>
              ) : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="性别">
              {account.gender ? (
                <Space>
                  <UserOutlined style={{ color: account.gender === '男' ? '#1890ff' : '#ff4d4f' }} />
                  {account.gender}
                </Space>
              ) : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="微信号">
              <Text code>{account.wx_id || '-'}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="GH ID">
              <Text code>{account.gh_id || '-'}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="BIZ" span={2}>
              <Text code style={{ wordBreak: 'break-all' }}>
                {account.biz || '-'}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item label="注册时间">
              <Space>
                <CalendarOutlined style={{ color: '#1890ff' }} />
                {account.reg_time || '-'}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="是否海外">
              {account.is_overseas === 1 ? '是' : account.is_overseas === 0 ? '否' : '-'}
            </Descriptions.Item>
          </Descriptions>

          {/* 认证信息 */}
          <Descriptions
            title="认证信息"
            bordered
            column={2}
            size="small"
            style={{ marginTop: '24px' }}
          >
            <Descriptions.Item label="认证状态">
              {verifyStatus ? (
                <Tag color={verifyStatus.color} icon={verifyStatus.icon}>
                  {verifyStatus.text}
                </Tag>
              ) : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="认证客户类型">
              {account.verify_customer_type || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="认证日期" span={2}>
              {account.verify_date ? (
                <Space>
                  <CalendarOutlined style={{ color: '#52c41a' }} />
                  {account.verify_date}
                </Space>
              ) : '-'}
            </Descriptions.Item>
          </Descriptions>

          {/* 地址信息 */}
          <Descriptions
            title="地址信息"
            bordered
            column={2}
            size="small"
            style={{ marginTop: '24px' }}
          >
            <Descriptions.Item label="注册国家">
              <Space>
                <EnvironmentOutlined style={{ color: '#1890ff' }} />
                {account.registered_country || '-'}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="省份">
              {account.province || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="最后登录国家">
              {account.last_login_country || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="最后登录省份">
              {account.last_login_province || '-'}
            </Descriptions.Item>
          </Descriptions>

          {/* 联系信息 */}
          {account.service_phone && (
            <Descriptions
              title="联系信息"
              bordered
              column={1}
              size="small"
              style={{ marginTop: '24px' }}
            >
              <Descriptions.Item label="服务电话">
                <Space>
                  <PhoneOutlined style={{ color: '#52c41a' }} />
                  <Text code>{account.service_phone}</Text>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          )}

          {/* 身份信息 */}
          {account.registered_id && (
            <Descriptions
              title="身份信息"
              bordered
              column={1}
              size="small"
              style={{ marginTop: '24px' }}
            >
              <Descriptions.Item label="注册ID">
                <Space>
                  <IdcardOutlined style={{ color: '#1890ff' }} />
                  <Text code style={{ wordBreak: 'break-all' }}>
                    {account.registered_id}
                  </Text>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          )}

          {/* 文章统计 */}
          <Descriptions
            title="文章统计"
            bordered
            column={1}
            size="small"
            style={{ marginTop: '24px' }}
          >
            <Descriptions.Item label="总文章数">
              <Space>
                <FileTextOutlined style={{ color: '#1890ff' }} />
                <Text strong>{account.total_articles.toLocaleString()}</Text>
                <Text type="secondary">篇</Text>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="已采集文章数">
              <Space>
                <Text strong style={{ color: '#52c41a' }}>
                  {account.crawled_articles.toLocaleString()}
                </Text>
                <Text type="secondary">篇</Text>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="采集进度">
              <div style={{ width: '300px' }}>
                <Progress
                  percent={crawlProgress}
                  size="small"
                  status={crawlProgress === 100 ? 'success' : 'active'}
                  format={(percent) => `${percent}% (${account.crawled_articles}/${account.total_articles})`}
                />
              </div>
            </Descriptions.Item>
          </Descriptions>

          {/* 描述信息 */}
          {account.description && (
            <Descriptions
              title="描述信息"
              bordered
              column={1}
              size="small"
              style={{ marginTop: '24px' }}
            >
              <Descriptions.Item label="公众号描述">
                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#fafafa', 
                  borderRadius: '6px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {account.description}
                </div>
              </Descriptions.Item>
            </Descriptions>
          )}

          {/* 时间信息 */}
          <Descriptions
            title="系统信息"
            bordered
            column={2}
            size="small"
            style={{ marginTop: '24px' }}
          >
            <Descriptions.Item label="创建时间">
              {new Date(account.created_at).toLocaleString('zh-CN')}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(account.updated_at).toLocaleString('zh-CN')}
            </Descriptions.Item>
            {account.reg_time_stamp && (
              <Descriptions.Item label="注册时间戳" span={2}>
                <Space>
                  <Text code>{account.reg_time_stamp}</Text>
                  <Text type="secondary">
                    ({new Date(account.reg_time_stamp * 1000).toLocaleString('zh-CN')})
                  </Text>
                </Space>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="账号ID" span={2}>
              <Text code style={{ wordBreak: 'break-all' }}>
                {account.id}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </div>
  );

  // 如果有 open 属性，说明是 Modal 模式
  if (open !== undefined) {
    return (
      <Modal
        title={
          <Space align="center">
            <Avatar
              size={32}
              icon={<WechatOutlined />}
              style={{ backgroundColor: '#52c41a' }}
            />
            <span>公众号详情</span>
          </Space>
        }
        open={open}
        onCancel={onCancel}
        footer={null}
        width={720}
        loading={loading}
      >
        {content}
      </Modal>
    );
  }

  // 直接显示模式
  return content;
};

export default WechatAccountDetail;
