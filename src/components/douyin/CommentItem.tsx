"use client";

import React, { useState } from 'react';
import {
  List,
  Avatar,
  Space,
  Typography,
  Button,
  Spin,
  App,
} from 'antd';
import {
  UserOutlined,
  HeartOutlined,
  CommentOutlined,
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons';
import type { DouyinComment } from '@/types/douyin';
import douyinService from '@/services/douyin';

const { Text } = Typography;

interface CommentItemProps {
  comment: DouyinComment;
  level?: number;  // 评论层级：1=一级评论, 2=二级评论
  showReplies?: boolean;  // 是否显示回复功能
}

// 格式化数字
const formatNumber = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null || num === '') return '0';
  const numValue = typeof num === 'string' ? parseInt(num, 10) || 0 : num;
  if (numValue >= 10000) {
    return `${(numValue / 10000).toFixed(1)}万`;
  }
  return numValue.toLocaleString();
};

// 格式化时间戳
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚';
  }
  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`;
  }
  // 小于24小时
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
  }
  // 小于7天
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
  }

  // 超过7天显示具体日期
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  level = 1,
  showReplies = true,
}) => {
  const { message } = App.useApp();
  const [expanded, setExpanded] = useState(false);
  const [replies, setReplies] = useState<DouyinComment[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [repliesPage, setRepliesPage] = useState(1);
  const [repliesHasMore, setRepliesHasMore] = useState(true);
  const [repliesTotal, setRepliesTotal] = useState(0);

  // 加载回复
  const loadReplies = async (page: number = 1, append: boolean = false) => {
    if (!comment.comment_id) return;

    try {
      setRepliesLoading(true);
      const response = await douyinService.getCommentReplies(
        comment.comment_id,
        page,
        20,
        'time'
      );

      if (response.success && response.data) {
        const newReplies = response.data.items || [];
        if (append) {
          setReplies((prev) => [...prev, ...newReplies]);
        } else {
          setReplies(newReplies);
        }
        setRepliesTotal(response.data.total || 0);
        setRepliesHasMore(response.data.page < response.data.total_pages);
        setRepliesPage(page);

        if (!expanded) {
          setExpanded(true);
        }
      }
    } catch (error: any) {
      console.error('加载回复失败:', error);
      message.error('加载回复失败');
    } finally {
      setRepliesLoading(false);
    }
  };

  // 展开/折叠回复
  const toggleReplies = () => {
    if (!expanded && replies.length === 0) {
      // 首次展开，加载回复
      loadReplies(1, false);
    } else {
      // 切换展开/折叠状态
      setExpanded(!expanded);
    }
  };

  // 加载更多回复
  const loadMoreReplies = () => {
    loadReplies(repliesPage + 1, true);
  };

  const subCommentCount = comment.sub_comment_count ?? comment.reply_comment_total ?? 0;
  const hasReplies = subCommentCount > 0;

  return (
    <div
      style={{
        paddingLeft: level === 2 ? 48 : 0,
        borderBottom: level === 1 ? '1px solid #f0f0f0' : 'none',
        paddingBottom: level === 1 ? 12 : 8,
        paddingTop: level === 1 ? 12 : 8,
      }}
    >
      <List.Item.Meta
        avatar={
          <Avatar
            src={comment.avatar || comment.avatar_thumb}
            icon={<UserOutlined />}
            size={level === 1 ? 40 : 32}
          />
        }
        title={
          <Space size="small">
            <Text strong style={{ fontSize: level === 1 ? 14 : 13 }}>
              {comment.nickname}
            </Text>
            {comment.ip_location && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {comment.ip_location}
              </Text>
            )}
          </Space>
        }
        description={
          <div>
            {/* 评论内容 */}
            <div style={{ marginBottom: 8, marginTop: 4, fontSize: level === 1 ? 14 : 13 }}>
              {comment.content}
            </div>

            {/* 互动信息 */}
            <Space size="middle">
              <Text type="secondary" style={{ fontSize: 12 }}>
                {formatTime(comment.create_time)}
              </Text>
              <Space size="small">
                <HeartOutlined style={{ fontSize: 12 }} />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {formatNumber(comment.like_count ?? comment.digg_count ?? 0)}
                </Text>
              </Space>

              {/* 回复按钮（仅一级评论显示） */}
              {level === 1 && showReplies && hasReplies && (
                <Button
                  type="link"
                  size="small"
                  icon={expanded ? <UpOutlined /> : <DownOutlined />}
                  onClick={toggleReplies}
                  loading={repliesLoading && !expanded}
                  style={{ padding: 0, height: 'auto', fontSize: 12 }}
                >
                  {expanded ? '收起' : '查看'} {formatNumber(subCommentCount)} 条回复
                </Button>
              )}
            </Space>
          </div>
        }
      />

      {/* 二级评论列表 */}
      {level === 1 && expanded && (
        <div style={{ marginTop: 12, marginLeft: 48 }}>
          {repliesLoading && replies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <Spin size="small" />
            </div>
          ) : (
            <>
              {replies.map((reply) => (
                <CommentItem
                  key={reply.comment_id}
                  comment={reply}
                  level={2}
                  showReplies={false}
                />
              ))}

              {/* 加载更多按钮 */}
              {repliesHasMore && replies.length > 0 && (
                <div style={{ textAlign: 'center', padding: 8 }}>
                  <Button
                    type="link"
                    size="small"
                    onClick={loadMoreReplies}
                    loading={repliesLoading}
                    style={{ fontSize: 12 }}
                  >
                    加载更多回复
                  </Button>
                </div>
              )}

              {/* 没有更多提示 */}
              {!repliesHasMore && replies.length > 0 && (
                <div style={{ textAlign: 'center', padding: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    已显示全部 {repliesTotal} 条回复
                  </Text>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
