"use client";

import React from 'react';
import { Descriptions, Tag, Space, Typography, Avatar } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  HeartOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { DouyinCreator } from '@/types/douyin';

const { Text, Paragraph } = Typography;

interface DouyinCreatorDetailProps {
  creator: DouyinCreator | null;
  loading?: boolean;
}

export const DouyinCreatorDetail: React.FC<DouyinCreatorDetailProps> = ({
  creator,
  loading = false,
}) => {
  if (!creator) return null;

  // 格式化时间戳
  const formatTime = (timestamp?: number): string => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 格式化数字（添加千分位）
  const formatNumber = (num?: number): string => {
    if (num === undefined || num === null) return '-';
    return num.toLocaleString('zh-CN');
  };

  return (
    <div>
      {/* 基本信息 */}
      <Descriptions
        title="基本信息"
        bordered
        column={2}
        size="small"
      >
        <Descriptions.Item label="昵称" span={2}>
          <Space>
            <Avatar size={48} src={creator.avatar} icon={<UserOutlined />} />
            <Text strong style={{ fontSize: '16px' }}>
              {creator.nickname}
            </Text>
            {creator.gender && (
              <Tag color={creator.gender === '女' ? 'pink' : 'blue'}>
                {creator.gender}
              </Tag>
            )}
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="用户ID">
          <Text code style={{ wordBreak: 'break-all' }}>
            {creator.user_id}
          </Text>
        </Descriptions.Item>

        <Descriptions.Item label="Sec UID">
          <Text code style={{ wordBreak: 'break-all' }}>
            {creator.sec_uid || '-'}
          </Text>
        </Descriptions.Item>

        {creator.short_id && (
          <Descriptions.Item label="短ID">
            <Text code>{creator.short_id}</Text>
          </Descriptions.Item>
        )}

        {creator.unique_id && (
          <Descriptions.Item label="唯一ID">
            <Text code>{creator.unique_id}</Text>
          </Descriptions.Item>
        )}

        {creator.ip_location && (
          <Descriptions.Item label="IP属地" span={2}>
            <Space>
              <EnvironmentOutlined style={{ color: '#1890ff' }} />
              {creator.ip_location}
            </Space>
          </Descriptions.Item>
        )}
      </Descriptions>

      {/* 简介信息 */}
      {(creator.desc || creator.signature) && (
        <Descriptions
          title="简介信息"
          bordered
          column={1}
          size="small"
          style={{ marginTop: '24px' }}
        >
          <Descriptions.Item label="简介">
            <div style={{ 
              padding: '8px 12px', 
              backgroundColor: '#fafafa', 
              borderRadius: '6px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {creator.desc || creator.signature}
            </div>
          </Descriptions.Item>
        </Descriptions>
      )}

      {/* 统计数据 */}
      <Descriptions
        title="统计数据"
        bordered
        column={2}
        size="small"
        style={{ marginTop: '24px' }}
      >
        <Descriptions.Item label="粉丝数">
          <Space>
            <TeamOutlined style={{ color: '#1890ff' }} />
            <Text strong>{formatNumber(creator.fans)}</Text>
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="关注数">
          <Text strong>{formatNumber(creator.follows)}</Text>
        </Descriptions.Item>

        <Descriptions.Item label="总获赞数">
          <Space>
            <HeartOutlined style={{ color: '#ff4d4f' }} />
            <Text strong style={{ color: '#ff4d4f' }}>
              {formatNumber(creator.interaction)}
            </Text>
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="视频数">
          <Space>
            <PlayCircleOutlined style={{ color: '#52c41a' }} />
            <Text strong style={{ color: '#52c41a' }}>
              {formatNumber(creator.videos_count)}
            </Text>
          </Space>
        </Descriptions.Item>
      </Descriptions>

      {/* 认证信息 */}
      {(creator.custom_verify || creator.enterprise_verify_reason) && (
        <Descriptions
          title="认证信息"
          bordered
          column={1}
          size="small"
          style={{ marginTop: '24px' }}
        >
          {creator.custom_verify && (
            <Descriptions.Item label="自定义认证">
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <Text>{creator.custom_verify}</Text>
              </Space>
            </Descriptions.Item>
          )}
          {creator.enterprise_verify_reason && (
            <Descriptions.Item label="企业认证">
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <Text>{creator.enterprise_verify_reason}</Text>
              </Space>
            </Descriptions.Item>
          )}
        </Descriptions>
      )}

      {/* 采集信息 */}
      <Descriptions
        title="采集信息"
        bordered
        column={2}
        size="small"
        style={{ marginTop: '24px' }}
      >
        {creator.crawl_time && (
          <Descriptions.Item label="采集时间">
            <Space>
              <CalendarOutlined style={{ color: '#1890ff' }} />
              {creator.crawl_time}
            </Space>
          </Descriptions.Item>
        )}

        {creator.last_modify_ts && (
          <Descriptions.Item label="最后修改时间">
            <Space>
              <CalendarOutlined style={{ color: '#52c41a' }} />
              {formatTime(creator.last_modify_ts)}
            </Space>
          </Descriptions.Item>
        )}

        {creator.created_at && (
          <Descriptions.Item label="创建时间">
            {new Date(creator.created_at).toLocaleString('zh-CN')}
          </Descriptions.Item>
        )}

        {creator.updated_at && (
          <Descriptions.Item label="更新时间">
            {new Date(creator.updated_at).toLocaleString('zh-CN')}
          </Descriptions.Item>
        )}

        {creator.id && (
          <Descriptions.Item label="记录ID" span={2}>
            <Text code style={{ wordBreak: 'break-all' }}>
              {creator.id}
            </Text>
          </Descriptions.Item>
        )}
      </Descriptions>
    </div>
  );
};

export default DouyinCreatorDetail;

