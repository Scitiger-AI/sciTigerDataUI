"use client";

import React from 'react';
import { Descriptions, Tag, Space, Typography, Avatar } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  HeartOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { XhsCreator } from '@/types/xiaohongshu';

const { Text } = Typography;

interface XhsCreatorDetailProps {
  creator: XhsCreator | null;
  loading?: boolean;
}

export const XhsCreatorDetail: React.FC<XhsCreatorDetailProps> = ({
  creator,
  loading = false,
}) => {
  if (!creator) return null;

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

        <Descriptions.Item label="用户ID" span={2}>
          <Text code style={{ wordBreak: 'break-all' }}>
            {creator.user_id}
          </Text>
        </Descriptions.Item>

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
      {creator.desc && (
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
              {creator.desc}
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

        <Descriptions.Item label="获赞与收藏">
          <Space>
            <HeartOutlined style={{ color: '#ff4d4f' }} />
            <Text strong style={{ color: '#ff4d4f' }}>
              {formatNumber(creator.interaction)}
            </Text>
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="笔记数">
          <Space>
            <FileTextOutlined style={{ color: '#52c41a' }} />
            <Text strong style={{ color: '#52c41a' }}>
              {formatNumber(creator.notes_count)}
            </Text>
          </Space>
        </Descriptions.Item>
      </Descriptions>

      {/* 采集信息 */}
      <Descriptions
        title="采集信息"
        bordered
        column={2}
        size="small"
        style={{ marginTop: '24px' }}
      >
        {creator.crawl_time && (
          <Descriptions.Item label="采集时间" span={2}>
            <Space>
              <CalendarOutlined style={{ color: '#1890ff' }} />
              {creator.crawl_time}
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

export default XhsCreatorDetail;
