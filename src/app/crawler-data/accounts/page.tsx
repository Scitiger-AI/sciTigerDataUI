"use client";

import React, { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
    App,
    Tabs,
    Tag,
    Statistic,
    Modal,
} from 'antd';
import {
    UserOutlined,
    SearchOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import MainLayout from '@/layout/MainLayout';
import AccountForm from '@/components/accounts/AccountForm';
import AccountDetail from '@/components/accounts/AccountDetail';
import BatchHealthCheckModal from '@/components/accounts/BatchHealthCheckModal';
import accountService from '@/services/account';
import type {
    Account,
    AccountQuery,
    PlatformType,
    AccountStatus,
    UpdateAccountRequest,
    BatchHealthCheckRequest,
} from '@/types/account';
import {
    PLATFORM_CONFIG,
    STATUS_CONFIG,
    ACCOUNT_SORT_OPTIONS,
    ACCOUNT_SORT_ORDER_OPTIONS,
} from '@/types/account';

const { Title, Text } = Typography;
const { Search } = Input;

function AccountsPageContent() {
    const { modal, message } = App.useApp();
    const router = useRouter();
    const searchParams = useSearchParams();

    // 状态管理
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // 筛选条件
    const [platform, setPlatform] = useState<PlatformType | 'all'>('all');
    const [status, setStatus] = useState<AccountStatus | undefined>();
    const [keyword, setKeyword] = useState('');
    const [sortBy, setSortBy] = useState('priority');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // 弹窗状态
    const [editFormOpen, setEditFormOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [batchHealthCheckOpen, setBatchHealthCheckOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [viewingAccount, setViewingAccount] = useState<Account | null>(null);
    const [updating, setUpdating] = useState(false);

    // 无限滚动
    const sentinelRef = useRef<HTMLDivElement>(null);

    // 加载账号列表
    const loadAccounts = useCallback(async (append = false) => {
        setLoading(true);
        try {
            const query: AccountQuery = {
                platform: platform === 'all' ? undefined : platform,
                status,
                page: append ? page + 1 : 1,
                page_size: 20,
                sort_by: sortBy,
                sort_order: sortOrder,
            };

            const response = await accountService.getAccounts(query);

            if (response.success && response.data) {
                const newAccounts = response.data.items || [];
                setAccounts(append ? [...accounts, ...newAccounts] : newAccounts);
                setTotal(response.data.total || 0);
                setPage(append ? page + 1 : 1);
                setHasMore(newAccounts.length === 20);
            }
        } catch (error: any) {
            message.error(error.message || '加载账号失败');
        } finally {
            setLoading(false);
        }
    }, [platform, status, page, sortBy, sortOrder, accounts, message]);

    // 删除账号
    const handleDelete = useCallback((account: Account) => {
        modal.confirm({
            title: '确认删除',
            icon: <ExclamationCircleOutlined />,
            content: `确定要删除账号 "${account.username || account.account_id}" 吗？此操作不可恢复。`,
            okText: '确认删除',
            okType: 'danger',
            cancelText: '取消',
            onOk: async () => {
                try {
                    const response = await accountService.deleteAccount(account.account_id);
                    if (response.success) {
                        message.success('删除成功');
                        setAccounts(prev => prev.filter(a => a.account_id !== account.account_id));
                        setTotal(prev => Math.max(0, prev - 1));
                    }
                } catch (error: any) {
                    message.error(error.message || '删除失败');
                }
            },
        });
    }, [modal, message]);

    // 健康检查
    const handleHealthCheck = useCallback(async (account: Account) => {
        const hide = message.loading('健康检查中...', 0);
        try {
            const response = await accountService.healthCheck(account.account_id, {
                auto_update: true,
                timeout: 30,
            });

            if (response.success) {
                message.success('健康检查完成');
                loadAccounts(false);
            }
        } catch (error: any) {
            message.error(error.message || '健康检查失败');
        } finally {
            hide();
        }
    }, [message, loadAccounts]);

    // 编辑账号
    const handleEdit = useCallback((account: Account) => {
        setEditingAccount(account);
        setEditFormOpen(true);
    }, []);

    // 提交编辑
    const handleUpdate = useCallback(async (accountId: string, data: UpdateAccountRequest) => {
        setUpdating(true);
        try {
            const response = await accountService.updateAccount(accountId, data);
            if (response.success) {
                message.success('更新成功');
                setEditFormOpen(false);
                setEditingAccount(null);
                loadAccounts(false);
            }
        } catch (error: any) {
            message.error(error.message || '更新失败');
            throw error;
        } finally {
            setUpdating(false);
        }
    }, [message, loadAccounts]);

    // 查看详情
    const handleView = useCallback((account: Account) => {
        setViewingAccount(account);
        setDetailOpen(true);
    }, []);

    // 批量健康检查
    const handleBatchHealthCheck = useCallback(async (data: BatchHealthCheckRequest) => {
        try {
            const response = await accountService.batchHealthCheck(data);
            if (response.success) {
                setBatchHealthCheckOpen(false);
                message.success('批量健康检查已提交，请稍后查看结果');
            }
        } catch (error: any) {
            message.error(error.message || '提交失败');
            throw error;
        }
    }, [message]);

    // 无限滚动观察器
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && hasMore && !loading) {
                    loadAccounts(true);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px',
            }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, loading, loadAccounts]);

    // 初始化加载
    useEffect(() => {
        loadAccounts(false);
    }, [platform, status, sortBy, sortOrder]);

    return (
        <MainLayout fullWidth>
            <div style={{ padding: '24px' }}>
                {/* 页面标题和操作栏 */}
                <Card>
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <Title level={2} style={{ margin: 0, marginBottom: '8px' }}>
                                    <UserOutlined style={{ color: '#1890ff', marginRight: '12px' }} />
                                    账号管理
                                </Title>
                                <Text type="secondary">
                                    管理所有平台的采集账号
                                </Text>
                                <div style={{ marginTop: '8px' }}>
                                    <Text strong>总计: {total.toLocaleString()} 个账号</Text>
                                </div>
                            </div>
                            <Space>
                                <Button
                                    icon={<ThunderboltOutlined />}
                                    onClick={() => setBatchHealthCheckOpen(true)}
                                >
                                    批量健康检查
                                </Button>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={() => loadAccounts(false)}
                                    loading={loading}
                                >
                                    刷新
                                </Button>
                            </Space>
                        </div>
                    </div>

                    {/* 平台切换 */}
                    <Tabs
                        activeKey={platform}
                        onChange={(key) => setPlatform(key as PlatformType | 'all')}
                        items={[
                            { key: 'all', label: '全部' },
                            ...Object.entries(PLATFORM_CONFIG).map(([key, config]) => ({
                                key,
                                label: config.label,
                            })),
                        ]}
                    />

                    {/* 筛选和搜索 */}
                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col xs={24} sm={12} lg={8}>
                            <Search
                                placeholder="搜索账号用户名或备注"
                                allowClear
                                enterButton={<SearchOutlined />}
                                size="large"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                        </Col>
                        <Col xs={24} sm={6} lg={4}>
                            <Select
                                style={{ width: '100%' }}
                                size="large"
                                placeholder="状态筛选"
                                allowClear
                                value={status}
                                onChange={setStatus}
                                options={[
                                    { label: '可用', value: 'active' },
                                    { label: '冷却中', value: 'cooling' },
                                    { label: '已封禁', value: 'banned' },
                                ]}
                            />
                        </Col>
                        <Col xs={24} sm={6} lg={4}>
                            <Select
                                style={{ width: '100%' }}
                                size="large"
                                value={sortBy}
                                onChange={setSortBy}
                                options={ACCOUNT_SORT_OPTIONS}
                            />
                        </Col>
                        <Col xs={24} sm={6} lg={4}>
                            <Select
                                style={{ width: '100%' }}
                                size="large"
                                value={sortOrder}
                                onChange={setSortOrder}
                                options={ACCOUNT_SORT_ORDER_OPTIONS}
                            />
                        </Col>
                    </Row>
                </Card>

                {/* 账号列表 */}
                <div style={{ marginTop: '24px' }}>
                    {accounts.length === 0 && !loading ? (
                        <Card>
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="暂无账号数据"
                                style={{ padding: '60px 0' }}
                            />
                        </Card>
                    ) : (
                        <Row gutter={[16, 16]}>
                            {accounts.map((account) => (
                                <Col key={account.account_id} xs={24} sm={12} lg={8} xl={6}>
                                    <Card
                                        hoverable
                                        actions={[
                                            <EyeOutlined
                                                key="view"
                                                onClick={() => handleView(account)}
                                                title="查看详情"
                                            />,
                                            <EditOutlined
                                                key="edit"
                                                onClick={() => handleEdit(account)}
                                                title="编辑"
                                            />,
                                            <CheckCircleOutlined
                                                key="health"
                                                onClick={() => handleHealthCheck(account)}
                                                title="健康检查"
                                            />,
                                            <DeleteOutlined
                                                key="delete"
                                                onClick={() => handleDelete(account)}
                                                title="删除"
                                            />,
                                        ]}
                                    >
                                        <div style={{ marginBottom: 12 }}>
                                            <Tag color={PLATFORM_CONFIG[account.platform]?.color || 'default'}>
                                                {PLATFORM_CONFIG[account.platform]?.label || account.platform}
                                            </Tag>
                                            <Tag color={STATUS_CONFIG[account.status]?.color || 'default'}>
                                                {STATUS_CONFIG[account.status]?.label || account.status}
                                            </Tag>
                                        </div>
                                        <div style={{ marginBottom: 8 }}>
                                            <Text strong>{account.username || account.account_id}</Text>
                                        </div>
                                        {account.remark && (
                                            <div style={{ marginBottom: 8 }}>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {account.remark}
                                                </Text>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                                            <Statistic
                                                title="今日请求"
                                                value={account.today_requests || 0}
                                                valueStyle={{ fontSize: 14 }}
                                            />
                                            <Statistic
                                                title="总请求"
                                                value={account.total_requests || 0}
                                                valueStyle={{ fontSize: 14 }}
                                            />
                                        </div>
                                    </Card>
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
                            <Button onClick={() => loadAccounts(true)}>加载更多</Button>
                        )}
                        {!loading && !hasMore && accounts.length > 0 && (
                            <Text type="secondary">已加载全部数据</Text>
                        )}
                    </div>
                </div>

                {/* 编辑表单 */}
                <AccountForm
                    open={editFormOpen}
                    account={editingAccount}
                    onCancel={() => {
                        setEditFormOpen(false);
                        setEditingAccount(null);
                    }}
                    onSubmit={handleUpdate}
                    loading={updating}
                />

                {/* 详情弹窗 */}
                <AccountDetail
                    open={detailOpen}
                    account={viewingAccount}
                    onCancel={() => {
                        setDetailOpen(false);
                        setViewingAccount(null);
                    }}
                />

                {/* 批量健康检查 */}
                <BatchHealthCheckModal
                    open={batchHealthCheckOpen}
                    onCancel={() => setBatchHealthCheckOpen(false)}
                    onSubmit={handleBatchHealthCheck}
                />
            </div>
        </MainLayout>
    );
}

// 导出的主组件，使用 Suspense 包裹
export default function AccountsPage() {
    return (
        <Suspense fallback={
            <MainLayout fullWidth>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '400px'
                }}>
                    <Spin size="large" />
                </div>
            </MainLayout>
        }>
            <AccountsPageContent />
        </Suspense>
    );
}
