"use client";

import React from 'react';
import { Card, Tag, Space, Button, Typography, Tooltip, Avatar } from 'antd';
import { useRouter } from 'next/navigation';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  WechatOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { WechatAccount } from '@/types/wechat';

const { Text, Paragraph } = Typography;

interface WechatAccountCardProps {
  account: WechatAccount;
  onView?: (account: WechatAccount) => void;
  onEdit?: (account: WechatAccount) => void;
  onDelete?: (account: WechatAccount) => void;
  loading?: boolean;
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

export const WechatAccountCard: React.FC<WechatAccountCardProps> = ({
  account,
  onView,
  onEdit,
  onDelete,
  loading = false,
}) => {
  const router = useRouter();
  const verifyStatus = account.verify_status && VERIFY_STATUS_CONFIG[account.verify_status as keyof typeof VERIFY_STATUS_CONFIG];
  const customerType = account.customer_type && CUSTOMER_TYPE_CONFIG[account.customer_type as keyof typeof CUSTOMER_TYPE_CONFIG];

  // 处理卡片点击 - 导航到详情页
  const handleCardClick = () => {
    router.push(`/crawler-data/wechat/${account.id}`);
  };

  const actions = [
    <Tooltip key="view" title="查看详情">
      <Button
        type="text"
        icon={<EyeOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          onView?.(account);
        }}
        disabled={loading}
      />
    </Tooltip>,
    <Tooltip key="edit" title="编辑">
      <Button
        type="text"
        icon={<EditOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.(account);
        }}
        disabled={loading}
      />
    </Tooltip>,
    <Tooltip key="delete" title="删除">
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.(account);
        }}
        disabled={loading}
      />
    </Tooltip>,
  ];

  return (
    <Card
      loading={loading}
      actions={actions}
      styles={{
        body: { padding: '16px' },
      }}
      hoverable
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div style={{ marginBottom: '12px' }}>
        <Space align="start" style={{ width: '100%' }}>
          <Avatar
            size={48}
            icon={<WechatOutlined />}
            style={{ backgroundColor: '#52c41a' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
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
            </div>
            {/* 公司/所有者名称区域 - 固定高度 */}
            <div style={{ minHeight: '16px', display: 'flex', alignItems: 'center' }}>
              {(account.company_name || account.owner_name) ? (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {account.company_name || account.owner_name}
                </Text>
              ) : (
                <div style={{ height: '16px' }} />
              )}
            </div>
          </div>
        </Space>
      </div>

      {/* 描述区域 - 固定高度确保卡片高度一致 */}
      <div style={{ marginBottom: '12px', minHeight: '36px', display: 'flex', alignItems: 'flex-start' }}>
        {account.description ? (
          <Paragraph
            ellipsis={{ rows: 2, tooltip: account.description }}
            style={{ margin: 0, fontSize: '13px', lineHeight: '18px' }}
          >
            {account.description}
          </Paragraph>
        ) : (
          <Text type="secondary" style={{ fontSize: '13px', fontStyle: 'italic', lineHeight: '18px' }}>
            暂无描述
          </Text>
        )}
      </div>

      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            文章统计
          </Text>
          <Space size="small">
            <Text style={{ fontSize: '12px' }}>
              已采集: <Text strong>{account.crawled_articles.toLocaleString()}</Text>
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              / {account.total_articles.toLocaleString()}
            </Text>
          </Space>
        </div>

        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space size="small">
              {customerType && (
                <Tag color={customerType.color} style={{ fontSize: '11px' }}>
                  {customerType.text}
                </Tag>
              )}
              {account.gender && (
                <Tag icon={<UserOutlined />} style={{ fontSize: '11px' }}>
                  {account.gender}
                </Tag>
              )}
            </Space>
          </div> */}
          
          {/* 地理位置信息区域 - 固定高度 */}
          <div style={{ minHeight: '16px', display: 'flex', alignItems: 'center' }}>
            {(account.province || account.last_login_province) ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <EnvironmentOutlined style={{ color: '#1890ff', fontSize: '11px' }} />
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  {account.province || account.last_login_province}
                  {account.registered_country && account.registered_country !== '中国' && ` (${account.registered_country})`}
                </Text>
              </div>
            ) : (
              <div style={{ height: '16px' }} />
            )}
          </div>
          
          <Text type="secondary" style={{ fontSize: '11px' }}>
              注册: {account.reg_time?account.reg_time:'-'}
            </Text>
        </Space>

        {/* 微信号和BIZ信息区域 - 固定高度 */}
        <div style={{ marginTop: '8px', minHeight: '32px' }}>
          {account.wx_id && (
            <Text code style={{ fontSize: '11px', display: 'block', marginBottom: '2px' }}>
              微信号: {account.wx_id}
            </Text>
          )}
          {account.biz && (
            <Text code style={{ fontSize: '11px', display: 'block' }}>
              BIZ: {account.biz.length > 20 ? `${account.biz.slice(0, 20)}...` : account.biz}
            </Text>
          )}
          {!account.wx_id && !account.biz && (
            <div style={{ height: '32px' }} />
          )}
        </div>
      </Space>
    </Card>
  );
};

export default WechatAccountCard;
