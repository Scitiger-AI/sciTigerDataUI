/**
 * 账号编辑表单组件
 */
import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, App } from 'antd';
import type { Account, UpdateAccountRequest } from '@/types/account';
import { STATUS_CONFIG } from '@/types/account';

interface AccountFormProps {
    open: boolean;
    account: Account | null;
    onCancel: () => void;
    onSubmit: (accountId: string, data: UpdateAccountRequest) => Promise<void>;
    loading?: boolean;
}

const AccountForm: React.FC<AccountFormProps> = ({
    open,
    account,
    onCancel,
    onSubmit,
    loading = false,
}) => {
    const [form] = Form.useForm();
    const { message } = App.useApp();

    // 当账号数据变化时，更新表单
    useEffect(() => {
        if (account && open) {
            form.setFieldsValue({
                status: account.status,
                priority: account.priority,
                max_requests_per_day: account.max_requests_per_day,
                remark: account.remark,
            });
        } else {
            form.resetFields();
        }
    }, [account, open, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (!account) {
                message.error('账号信息不存在');
                return;
            }

            await onSubmit(account.account_id, values);
            form.resetFields();
        } catch (error) {
            console.error('表单验证失败:', error);
        }
    };

    return (
        <Modal
            title="编辑账号"
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            width={600}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                preserve={false}
            >
                <Form.Item
                    label="账号状态"
                    name="status"
                    rules={[{ required: true, message: '请选择账号状态' }]}
                >
                    <Select
                        placeholder="选择账号状态"
                        options={Object.entries(STATUS_CONFIG).map(([value, config]) => ({
                            label: config.label,
                            value,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    label="优先级"
                    name="priority"
                    tooltip="数值越大优先级越高"
                >
                    <InputNumber
                        min={0}
                        max={100}
                        style={{ width: '100%' }}
                        placeholder="设置优先级（0-100）"
                    />
                </Form.Item>

                <Form.Item
                    label="每日最大请求数"
                    name="max_requests_per_day"
                    tooltip="账号每天允许的最大请求次数"
                >
                    <InputNumber
                        min={1}
                        max={10000}
                        style={{ width: '100%' }}
                        placeholder="设置每日最大请求数"
                    />
                </Form.Item>

                <Form.Item
                    label="备注"
                    name="remark"
                >
                    <Input.TextArea
                        rows={3}
                        placeholder="添加备注信息"
                        maxLength={200}
                        showCount
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AccountForm;
