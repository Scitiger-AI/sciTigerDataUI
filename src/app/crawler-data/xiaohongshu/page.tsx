"use client";

import React from 'react';
import { Result, Button } from 'antd';
import { FireOutlined } from '@ant-design/icons';
import MainLayout from '@/layout/MainLayout';

export default function XiaohongshuPage() {
  return (
    <MainLayout fullWidth={false}>
      <Result
        icon={<FireOutlined style={{ fontSize: 72, color: '#ff2442' }} />}
        title="小红书数据"
        subTitle="待开发，即将上线"
        extra={[
          <Button type="primary" key="console" disabled>
            开始采集
          </Button>,
          <Button key="buy" disabled>
            查看文档
          </Button>,
        ]}
      />
    </MainLayout>
  );
}