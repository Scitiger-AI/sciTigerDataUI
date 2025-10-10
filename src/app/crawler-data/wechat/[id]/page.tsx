"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Spin,
  Typography,
  Button,
  Space,
  Collapse,
  App,
} from 'antd';
import {
  ArrowLeftOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { WechatAccount } from '@/types/wechat';
import { WechatAccountDetail } from '@/components/wechat/WechatAccountDetail';
import { TaskManagement } from '@/components/task/TaskManagement';
import ArticleList from '@/components/article/ArticleList';
import { wechatService } from '@/services/wechat';
import MainLayout from '@/layout/MainLayout';
import type { Article } from '@/types/article';

const { Title } = Typography;

export default function WechatAccountDetailPage() {
  const { message } = App.useApp();
  const params = useParams();
  const router = useRouter();
  const [account, setAccount] = useState<WechatAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const accountId = params.id as string;

  // 加载公众号详情
  const loadAccountDetail = async () => {
    try {
      setLoading(true);
      const response = await wechatService.getAccountDetail(accountId);
      const data = response.data;
      setAccount(data);
    } catch (error) {
      console.error('加载公众号详情失败:', error);
      message.error('加载公众号详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 刷新数据
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadAccountDetail();
      message.success('数据刷新成功');
    } catch (error) {
      message.error('数据刷新失败');
    } finally {
      setRefreshing(false);
    }
  };

  // 返回列表页
  const handleGoBack = () => {
    router.push('/crawler-data/wechat');
  };

  // 处理文章点击
  const handleArticleClick = (article: Article) => {
    router.push(`/crawler-data/wechat/${accountId}/article/${article.id}`);
  };

  // 页面初始化
  useEffect(() => {
    if (accountId) {
      loadAccountDetail();
    }
  }, [accountId]);

  if (loading) {
    return (
      <MainLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}>
          <Spin size="large" tip="加载中...">
            <div style={{ padding: '50px', background: '#f5f5f5', minWidth: '200px' }}>
              {/* 空内容区域 */}
            </div>
          </Spin>
        </div>
      </MainLayout>
    );
  }

  if (!account) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Title level={4}>公众号不存在</Title>
          <Button type="primary" onClick={handleGoBack}>
            返回列表
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        {/* 页面头部 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px',
          padding: '24px 0'
        }}>
          <Space size="middle">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleGoBack}
            >
              返回列表
            </Button>
            <Title level={3} style={{ margin: 0 }}>
              {account.nick_name} - 详情管理
            </Title>
          </Space>
          
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={refreshing}
            >
              刷新
            </Button>
          </Space>
        </div>

        {/* 上下布局：上方公众号信息，下方任务管理 */}
        
        {/* 使用 Collapse 包装所有内容区域 */}
        <Collapse 
          defaultActiveKey={[]} 
          size="large"
          items={[
            {
              key: 'account-info',
              label: '公众号信息',
              children: (
                <WechatAccountDetail 
                  account={account} 
                  loading={false}
                  showActions={false}
                />
              ),
              // style: { 
              //   marginBottom: '24px'
              // }
            },
            {
              key: 'task-management',
              label: '采集任务管理',
              children: (
                <TaskManagement 
                  accountId={accountId} 
                  accountInfo={{
                    biz: account.biz ?? '',
                    wx_id: account.wx_id ?? '',
                    nick_name: account.nick_name ?? '',
                  }}
                />
              ),
              extra: (
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={handleRefresh}
                  loading={refreshing}
                  size="small"
                >
                  刷新
                </Button>
              ),
              // style: { 
              //   marginBottom: '24px'
              // }
            }
          ]}
          style={{ marginBottom: '24px' }}
        />

        {/* 已采集文章 */}
        <Card title="已采集文章">
          <ArticleList
            accountBiz={account.biz ?? ''}
            accountName={account.nick_name}
            showSearch={true}
            showFilters={true}
            onArticleClick={handleArticleClick}
          />
        </Card>
      </div>
    </MainLayout>
  );
}