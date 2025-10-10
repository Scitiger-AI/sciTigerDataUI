"use client";

import React from 'react';
import { Result } from 'antd';
import MainLayout from '@/layout/MainLayout';

export default function CrawlerDataPage() {
  return (
    <MainLayout fullWidth={false}>
      <Result
        status="info"
        title="爬虫数据管理"
        subTitle="请从左侧菜单选择数据源"
      />
    </MainLayout>
  );
}