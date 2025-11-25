/**
 * 批量健康检查弹窗组件
 */
import React, { useState } from 'react';
import { Modal, Form, Select, InputNumber, Switch, App, Progress, List, Tag } from 'antd';
import type { BatchHealthCheckRequest, PlatformType, AccountStatus } from '@/types/account';
import { PLATFORM_CONFIG, STATUS_CONFIG } from '@/types/account';

interface BatchHealthCheckModalProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (data: BatchHealthCheckRequest) => Promise<void>;
}

const BatchHealthCheckModal: React.FC<BatchHealthCheckModalProps> = ({
    open,
    onCancel,
    onSubmit,
}) => {
    const [form] = Form.useForm();
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            await onSubmit(values);

            form.resetFields();
            message.success('批量健康检查已提交');
        } catch (error: any) {
            console.error('表单验证失败:', error);
            if (error.message) {
                message.error(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="批量健康检查"
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
                initialValues={{
                    max_concurrent: 3,
                    timeout: 30,
                    auto_update: true,
                }}
            >
                <Form.Item
                    label="平台筛选"
                    name="platform"
                    tooltip="选择要检查的平台，不选则检查所有平台"
                >
                    <Select
                        placeholder="选择平台（可选）"
                        allowClear
                        options={Object.entries(PLATFORM_CONFIG).map(([value, config]) => ({
                            label: config.label,
                            value,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    label="状态筛选"
                    name="status"
                    tooltip="选择要检查的账号状态，不选则检查所有状态"
                >
                    <Select
                        placeholder="选择状态（可选）"
                        allowClear
                        options={Object.entries(STATUS_CONFIG).map(([value, config]) => ({
                            label: config.label,
                            value,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    label="最大并发数"
                    name="max_concurrent"
                    rules={[{ required: true, message: '请设置最大并发数' }]}
                    tooltip="同时进行健康检查的账号数量"
                >
                    <InputNumber
                        min={1}
                        max={10}
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                <Form.Item
                    label="单个账号超时时间（秒）"
                    name="timeout"
                    rules={[{ required: true, message: '请设置超时时间' }]}
                >
                    <InputNumber
                        min={10}
                        max={120}
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                <Form.Item
                    label="自动更新账号状态"
                    name="auto_update"
                    valuePropName="checked"
                    tooltip="检查完成后自动更新账号状态"
                >
                    <Switch />
                </Form.Item>
            </Form>

            <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
                    💡 提示：批量健康检查会对选定的账号进行浏览器级别的健康验证，
                    这可能需要较长时间，请耐心等待。
                </p>
            </div>
        </Modal>
    );
};

export default BatchHealthCheckModal;
