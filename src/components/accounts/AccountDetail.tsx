/**
 * 账号详情弹窗组件
 */
import React from 'react';
import { Modal, Descriptions, Tag, Spin, Statistic, Row, Col } from 'antd';
import type { Account } from '@/types/account';
import { PLATFORM_CONFIG, STATUS_CONFIG } from '@/types/account';
import dayjs from 'dayjs';

interface AccountDetailProps {
    open: boolean;
    account: Account | null;
    onCancel: () => void;
    loading?: boolean;
}

const AccountDetail: React.FC<AccountDetailProps> = ({
    open,
    account,
    onCancel,
    loading = false,
}) => {
    if (!account) {
        return null;
    }

    const platformConfig = PLATFORM_CONFIG[account.platform];
    const statusConfig = STATUS_CONFIG[account.status];

    return (
        <Modal
            title="账号详情"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={800}
        >
            <Spin spinning={loading}>
                {/* 统计卡片 */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={8}>
                        <Statistic
                            title="今日请求数"
                            value={account.today_requests || 0}
                            suffix={`/ ${account.max_requests_per_day || '∞'}`}
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="总请求数"
                            value={account.total_requests || 0}
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="优先级"
                            value={account.priority || 0}
                        />
                    </Col>
                </Row>

                {/* 详细信息 */}
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="账号ID" span={2}>
                        {account.account_id}
                    </Descriptions.Item>

                    <Descriptions.Item label="平台">
                        <Tag color={platformConfig?.color || 'default'}>
                            {platformConfig?.label || account.platform}
                        </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="状态">
                        <Tag color={statusConfig?.color || 'default'}>
                            {statusConfig?.label || account.status}
                        </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="用户名" span={2}>
                        {account.username || '-'}
                    </Descriptions.Item>

                    <Descriptions.Item label="优先级">
                        {account.priority || 0}
                    </Descriptions.Item>

                    <Descriptions.Item label="每日最大请求数">
                        {account.max_requests_per_day || '无限制'}
                    </Descriptions.Item>

                    <Descriptions.Item label="今日请求数">
                        {account.today_requests || 0}
                    </Descriptions.Item>

                    <Descriptions.Item label="总请求数">
                        {account.total_requests || 0}
                    </Descriptions.Item>

                    <Descriptions.Item label="最后使用时间" span={2}>
                        {account.last_used_at
                            ? dayjs(account.last_used_at).format('YYYY-MM-DD HH:mm:ss')
                            : '从未使用'}
                    </Descriptions.Item>

                    {account.cooling_until && (
                        <Descriptions.Item label="冷却至" span={2}>
                            {dayjs(account.cooling_until).format('YYYY-MM-DD HH:mm:ss')}
                        </Descriptions.Item>
                    )}

                    <Descriptions.Item label="创建时间" span={2}>
                        {account.created_at
                            ? dayjs(account.created_at).format('YYYY-MM-DD HH:mm:ss')
                            : '-'}
                    </Descriptions.Item>

                    <Descriptions.Item label="更新时间" span={2}>
                        {account.updated_at
                            ? dayjs(account.updated_at).format('YYYY-MM-DD HH:mm:ss')
                            : '-'}
                    </Descriptions.Item>

                    {account.user_data_dir && (
                        <Descriptions.Item label="User Data Dir" span={2}>
                            <code style={{ fontSize: 12 }}>{account.user_data_dir}</code>
                        </Descriptions.Item>
                    )}

                    {account.remark && (
                        <Descriptions.Item label="备注" span={2}>
                            {account.remark}
                        </Descriptions.Item>
                    )}
                </Descriptions>
            </Spin>
        </Modal>
    );
};

export default AccountDetail;
