"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Input, 
  Select, 
  Space, 
  Typography, 
  Spin, 
  Empty,
  Modal,
  App,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  WechatOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import MainLayout from '@/layout/MainLayout';
import WechatAccountCard from '@/components/wechat/WechatAccountCard';
import WechatAccountForm from '@/components/wechat/WechatAccountForm';
import WechatAccountDetail from '@/components/wechat/WechatAccountDetail';
import useWechatAccounts from '@/hooks/useWechatAccounts';
import { VERIFY_STATUS_OPTIONS, CUSTOMER_TYPE_OPTIONS } from '@/types/wechat';
import type { WechatAccount, WechatAccountQuery } from '@/types/wechat';

const { Title, Text } = Typography;
const { Search } = Input;

export default function WechatPage() {
  const { modal } = App.useApp();
  
  // 公众号数据管理
  const {
    accounts,
    loading,
    hasMore,
    total,
    creating,
    updating,
    deleting,
    currentQuery,
    loadMore,
    refresh,
    search,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountDetail,
  } = useWechatAccounts();

  // UI状态管理
  const [searchKeyword, setSearchKeyword] = useState('');
  const [verifyStatusFilter, setVerifyStatusFilter] = useState<string | undefined>();
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<WechatAccount | null>(null);
  const [viewingAccount, setViewingAccount] = useState<WechatAccount | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 无限滚动相关
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 无限滚动观察器
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  // 搜索处理
  const handleSearch = useCallback((keyword: string) => {
    const query: WechatAccountQuery = {
      keyword: keyword.trim() || undefined,
      verify_status: verifyStatusFilter,
      customer_type: customerTypeFilter,
    };
    search(query);
  }, [verifyStatusFilter, customerTypeFilter, search]);

  // 认证状态筛选处理
  const handleVerifyStatusChange = useCallback((value: string | undefined) => {
    setVerifyStatusFilter(value);
    const query: WechatAccountQuery = {
      keyword: searchKeyword.trim() || undefined,
      verify_status: value,
      customer_type: customerTypeFilter,
    };
    search(query);
  }, [searchKeyword, customerTypeFilter, search]);

  // 客户类型筛选处理
  const handleCustomerTypeChange = useCallback((value: string | undefined) => {
    setCustomerTypeFilter(value);
    const query: WechatAccountQuery = {
      keyword: searchKeyword.trim() || undefined,
      verify_status: verifyStatusFilter,
      customer_type: value,
    };
    search(query);
  }, [searchKeyword, verifyStatusFilter, search]);

  // 创建公众号
  const handleCreate = useCallback(async (data: any) => {
    const result = await createAccount(data);
    if (result) {
      setFormOpen(false);
    }
  }, [createAccount]);

  // 编辑公众号
  const handleEdit = useCallback((account: WechatAccount) => {
    setEditingAccount(account);
    setFormOpen(true);
  }, []);

  // 更新公众号
  const handleUpdate = useCallback(async (data: any) => {
    if (!editingAccount) return;
    const result = await updateAccount(editingAccount.id, data);
    if (result) {
      setFormOpen(false);
      setEditingAccount(null);
    }
  }, [editingAccount, updateAccount]);

  // 查看详情
  const handleView = useCallback(async (account: WechatAccount) => {
    setDetailLoading(true);
    setDetailOpen(true);
    setViewingAccount(account);
    
    try {
      const detail = await getAccountDetail(account.id);
      if (detail) {
        setViewingAccount(detail);
      }
    } finally {
      setDetailLoading(false);
    }
  }, [getAccountDetail]);

  // 删除公众号
  const handleDelete = useCallback((account: WechatAccount) => {
    modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除公众号"${account.nick_name}"吗？此操作不可恢复。`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        await deleteAccount(account.id);
      },
    });
  }, [deleteAccount, modal]);

  // 关闭表单
  const handleFormClose = useCallback(() => {
    setFormOpen(false);
    setEditingAccount(null);
  }, []);

  // 关闭详情
  const handleDetailClose = useCallback(() => {
    setDetailOpen(false);
    setViewingAccount(null);
  }, []);

  return (
    <MainLayout fullWidth>
      <div style={{ padding: '24px' }}>
        {/* 页面标题和操作栏 */}
        <Card>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Title level={2} style={{ margin: 0, marginBottom: '8px' }}>
                  <WechatOutlined style={{ color: '#52c41a', marginRight: '12px' }} />
                  公众号数据管理
                </Title>
                <Text type="secondary">
                  管理公众号账号信息，支持创建、编辑、删除和查看详情
                </Text>
                <div style={{ marginTop: '8px' }}>
                  <Text strong>总计: {total.toLocaleString()} 个公众号</Text>
                </div>
              </div>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={refresh}
                  loading={loading}
                >
                  刷新
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setFormOpen(true)}
                >
                  创建公众号
                </Button>
              </Space>
            </div>
          </div>

          {/* 搜索和筛选 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Search
                placeholder="搜索公众号名称、描述或标识"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onSearch={handleSearch}
              />
            </Col>
            {/* <Col xs={24} sm={6} lg={4}>
              <Select
                style={{ width: '100%' }}
                size="large"
                placeholder="认证状态"
                allowClear
                value={verifyStatusFilter}
                onChange={handleVerifyStatusChange}
                options={[
                  { label: '全部状态', value: undefined },
                  ...VERIFY_STATUS_OPTIONS,
                ]}
              />
            </Col> */}
            {/* <Col xs={24} sm={6} lg={4}>
              <Select
                style={{ width: '100%' }}
                size="large"
                placeholder="客户类型"
                allowClear
                value={customerTypeFilter}
                onChange={handleCustomerTypeChange}
                options={[
                  { label: '全部类型', value: undefined },
                  ...CUSTOMER_TYPE_OPTIONS,
                ]}
              />
            </Col> */}
          </Row>
        </Card>

        {/* 公众号卡片列表 */}
        <div ref={listRef} style={{ marginTop: '24px' }}>
          {accounts.length === 0 && !loading ? (
            <Card>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无公众号数据"
                style={{ padding: '60px 0' }}
              >
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
                  创建第一个公众号
                </Button>
              </Empty>
            </Card>
          ) : (
            <Row gutter={[16, 16]}>
              {accounts.map((account) => (
                <Col key={account.id} xs={24} sm={12} lg={8} xl={6}>
                  <WechatAccountCard
                    account={account}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    loading={deleting}
                  />
                </Col>
              ))}
            </Row>
          )}

          {/* 加载更多指示器 */}
          <div ref={sentinelRef} style={{ textAlign: 'center', padding: '20px' }}>
            {loading && (
              <Spin tip="加载中...">
                <div style={{ height: '60px' }} />
              </Spin>
            )}
            {!loading && hasMore && accounts.length > 0 && (
              <Button onClick={loadMore}>加载更多</Button>
            )}
            {!loading && !hasMore && accounts.length > 0 && (
              <Text type="secondary">已加载全部数据</Text>
            )}
          </div>
        </div>

        {/* 创建/编辑表单 */}
        <WechatAccountForm
          open={formOpen}
          onCancel={handleFormClose}
          onSubmit={editingAccount ? handleUpdate : handleCreate}
          initialData={editingAccount}
          loading={creating || updating}
        />

        {/* 详情弹窗 */}
        <WechatAccountDetail
          open={detailOpen}
          onCancel={handleDetailClose}
          account={viewingAccount}
          loading={detailLoading}
        />
      </div>
    </MainLayout>
  );
}