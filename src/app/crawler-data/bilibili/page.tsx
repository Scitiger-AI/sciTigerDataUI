"use client";

import React from 'react';
import { Result, Button } from 'antd';
import { YoutubeOutlined } from '@ant-design/icons';
import MainLayout from '@/layout/MainLayout';

export default function BilibiliPage() {
  return (
    <MainLayout fullWidth={false}>
      <Result
        icon={<YoutubeOutlined style={{ fontSize: 72, color: '#00a1d6' }} />}
        title="B站数据"
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