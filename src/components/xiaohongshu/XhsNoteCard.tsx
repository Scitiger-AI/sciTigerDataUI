"use client";

import React from 'react';
import { Card, Tag, Space, Button, Typography, Tooltip, Avatar, Image } from 'antd';
import { useRouter } from 'next/navigation';
import {
  EyeOutlined,
  DeleteOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  HeartOutlined,
  CommentOutlined,
  ShareAltOutlined,
  StarOutlined,
  UserOutlined,
  CalendarOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { XhsNote } from '@/types/xiaohongshu';

const { Text, Paragraph } = Typography;

interface XhsNoteCardProps {
  note: XhsNote;
  onView?: (note: XhsNote) => void;
  onDelete?: (note: XhsNote) => void;
  onDownload?: (note: XhsNote) => void;
  loading?: boolean;
}

// 格式化数字（支持字符串和数字类型）
const formatNumber = (num: number | string | undefined): string => {
  if (num === undefined || num === null) return '0';
  const numValue = typeof num === 'string' ? parseInt(num, 10) || 0 : num;
  if (numValue >= 10000) {
    return `${(numValue / 10000).toFixed(1)}万`;
  }
  return numValue.toLocaleString();
};

// 格式化时间戳
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const XhsNoteCard: React.FC<XhsNoteCardProps> = ({
  note,
  onView,
  onDelete,
  onDownload,
  loading = false,
}) => {
  const router = useRouter();

  // 处理卡片点击 - 导航到详情页
  const handleCardClick = () => {
    if (onView) {
      onView(note);
    } else if (note.note_id) {
      router.push(`/crawler-data/xiaohongshu/notes/${note.note_id}`);
    }
  };

  // 获取封面图片
  const getCoverImage = (): string | undefined => {
    if (note.type === 'video' && note.video_url) {
      // 视频笔记：可能有视频封面
      return note.image_list?.[0];
    }
    // 图文笔记：使用第一张图片
    return note.image_list?.[0];
  };

  const actions = [
    <Tooltip key="view" title="查看详情">
      <Button
        type="text"
        icon={<EyeOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          onView?.(note);
        }}
        disabled={loading}
      />
    </Tooltip>,
    onDownload && (
      <Tooltip key="download" title="下载内容">
        <Button
          type="text"
          icon={<DownloadOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onDownload?.(note);
          }}
          disabled={loading}
        />
      </Tooltip>
    ),
    <Tooltip key="delete" title="删除">
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.(note);
        }}
        disabled={loading}
      />
    </Tooltip>,
  ].filter(Boolean);

  const coverImage = getCoverImage();

  return (
    <Card
      loading={loading}
      actions={actions}
      styles={{
        body: { padding: '16px' },
      }}
      hoverable
      onClick={handleCardClick}
      style={{ cursor: 'pointer', height: '100%' }}
      cover={
        coverImage ? (
          <div style={{
            height: 200,
            overflow: 'hidden',
            background: '#f0f0f0',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Image
              alt={note.title || note.desc}
              src={coverImage}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
              preview={false}
              fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjYzBjMGMwIj7lm77niYfliqDovb3lpLHotKU8L3RleHQ+PC9zdmc+"
            />
            <div
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                alignItems: 'flex-end',
                zIndex: 1,
              }}
            >
              {note.ai_denoised && (
                <Tag color="cyan" style={{ margin: 0, fontSize: '10px', lineHeight: '16px', height: '18px', padding: '0 4px', border: 'none' }}>
                  已去噪
                </Tag>
              )}
              {note.ai_rewritten && (
                <Tag color="purple" style={{ margin: 0, fontSize: '10px', lineHeight: '16px', height: '18px', padding: '0 4px', border: 'none' }}>
                  已重写
                </Tag>
              )}
            </div>
            {note.type === 'video' && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.3)',
                  }}
                >
                  <PlayCircleOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.9)' }} />
                </div>
                {/* 视频时长 */}
                {note.video_duration && note.video_duration > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                  >
                    {Math.floor(note.video_duration / 60)}:{(note.video_duration % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div
            style={{
              height: 200,
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {note.type === 'video' ? (
              <PlayCircleOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
            ) : (
              <PictureOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
            )}
          </div>
        )
      }
    >
      {/* 标题区域 - 固定高度 */}
      <div style={{ marginBottom: '12px', minHeight: '48px', display: 'flex', alignItems: 'flex-start' }}>
        <Paragraph
          ellipsis={{ rows: 2, tooltip: note.title }}
          style={{ margin: 0, fontSize: '14px', lineHeight: '1.4', fontWeight: 500 }}
        >
          {note.title || '无标题'}
        </Paragraph>
      </div>

      {/* 作者信息 */}
      <div style={{ marginBottom: '12px' }}>
        <Space align="start" style={{ width: '100%' }}>
          <Avatar src={note.avatar} icon={<UserOutlined />} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Text strong style={{ fontSize: '13px' }}>
                {note.nickname || '未知用户'}
              </Text>
              <Tag color={note.type === 'video' ? 'red' : 'blue'} style={{ fontSize: '11px' }}>
                {note.type === 'video' ? '视频' : '图文'}
              </Tag>
            </div>
          </div>
        </Space>
      </div>

      {/* 描述区域 - 固定高度 */}
      <div style={{ marginBottom: '12px', minHeight: '36px', display: 'flex', alignItems: 'flex-start' }}>
        {note.desc ? (
          <Paragraph
            ellipsis={{ rows: 2, tooltip: note.desc }}
            style={{ margin: 0, fontSize: '12px', lineHeight: '18px', color: '#666' }}
          >
            {note.desc}
          </Paragraph>
        ) : (
          <Text type="secondary" style={{ fontSize: '12px', fontStyle: 'italic', lineHeight: '18px' }}>
            暂无描述
          </Text>
        )}
      </div>

      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {/* 互动数据统计 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <Space size="small">
            <HeartOutlined style={{ color: '#ff4d4f', fontSize: '12px' }} />
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {formatNumber(note.liked_count)}
            </Text>
          </Space>
          <Space size="small">
            <CommentOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {formatNumber(note.comment_count)}
            </Text>
          </Space>
          <Space size="small">
            <StarOutlined style={{ color: '#faad14', fontSize: '12px' }} />
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {formatNumber(note.collected_count)}
            </Text>
          </Space>
          <Space size="small">
            <ShareAltOutlined style={{ color: '#fa8c16', fontSize: '12px' }} />
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {formatNumber(note.share_count)}
            </Text>
          </Space>
        </div>

        {/* 发布时间 */}
        <div style={{ minHeight: '16px', display: 'flex', alignItems: 'center' }}>
          {note.time ? (
            <Space size={4}>
              <CalendarOutlined style={{ color: '#52c41a', fontSize: '11px' }} />
              <Text type="secondary" style={{ fontSize: '11px' }}>
                {formatTime(note.time)}
              </Text>
            </Space>
          ) : (
            <div style={{ height: '16px' }} />
          )}
        </div>

        {/* 位置信息 */}
        {note.ip_location && (
          <div style={{ minHeight: '16px', display: 'flex', alignItems: 'center' }}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              📍 {note.ip_location}
            </Text>
          </div>
        )}

        {/* 笔记ID信息区域 - 固定高度 */}
        <div style={{ marginTop: '8px', minHeight: '32px' }}>
          {note.note_id && (
            <Text code style={{ fontSize: '11px', display: 'block' }}>
              ID: {note.note_id.length > 20 ? `${note.note_id.slice(0, 20)}...` : note.note_id}
            </Text>
          )}
          {!note.note_id && <div style={{ height: '32px' }} />}
        </div>
      </Space>
    </Card>
  );
};

export default XhsNoteCard;
