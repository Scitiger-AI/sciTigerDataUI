"use client";

import React, { useEffect } from 'react';
import { Form, Input, Modal, App } from 'antd';
import type { WechatAccount, CreateWechatAccountRequest, UpdateWechatAccountRequest } from '@/types/wechat';

const { TextArea } = Input;

interface WechatAccountFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (data: CreateWechatAccountRequest | UpdateWechatAccountRequest) => Promise<void>;
  initialData?: WechatAccount | null;
  loading?: boolean;
}

export const WechatAccountForm: React.FC<WechatAccountFormProps> = ({
  open,
  onCancel,
  onSubmit,
  initialData,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const isEdit = !!initialData;

  useEffect(() => {
    if (open) {
      if (isEdit && initialData) {
        form.setFieldsValue({
          nick_name: initialData.nick_name,
          description: initialData.description || '',
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, isEdit, initialData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (isEdit) {
        // 编辑模式，只提交可编辑的字段
        const updateData: UpdateWechatAccountRequest = {
          nick_name: values.nick_name,
          description: values.description,
        };
        await onSubmit(updateData);
      } else {
        // 创建模式，需要提交完整数据
        const createData: CreateWechatAccountRequest = {
          biz: values.biz,
          nick_name: values.nick_name,
          description: values.description,
        };
        await onSubmit(createData);
      }
      
      form.resetFields();
    } catch (error) {
      console.error('表单提交失败:', error);
    }
  };

  return (
    <Modal
      title={isEdit ? '编辑公众号' : '创建公众号'}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={520}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: '20px' }}
      >
        {!isEdit && (
          <Form.Item
            name="biz"
            label="公众号 BIZ"
            rules={[
              { required: true, message: '请输入公众号 BIZ' },
              { min: 1, message: '公众号 BIZ 不能为空' },
            ]}
            extra="公众号的唯一标识符，通常从公众号文章 URL 中获取"
          >
            <Input
              placeholder="请输入公众号 BIZ（例如：MzA3MDU2NTYzMg==）"
              maxLength={200}
            />
          </Form.Item>
        )}

        <Form.Item
          name="nick_name"
          label="公众号名称"
          rules={[
            { max: 100, message: '公众号名称最多100个字符' },
          ]}
        >
          <Input
            placeholder="请输入公众号名称"
            maxLength={100}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="公众号描述"
          rules={[
            { max: 500, message: '描述最多500个字符' },
          ]}
        >
          <TextArea
            placeholder="请输入公众号描述"
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default WechatAccountForm;
