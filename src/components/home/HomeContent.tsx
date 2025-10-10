"use client";

import React from 'react';
import { css } from '@emotion/css';
import { Typography, Card, Space, Result } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const containerStyle = css`
  width: 100%;
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
`;

export const HomeContent: React.FC = () => {
  return (
    <div className={containerStyle}>
      <Result
        icon={<DatabaseOutlined style={{ fontSize: 72, color: '#1677ff' }} />}
        title="欢迎使用科虎数据管理系统平台"
        subTitle="专业的爬虫数据采集与管理系统"
        extra={[
          <Paragraph key="desc" style={{ fontSize: 16, marginTop: 20 }}>
            支持公众号、抖音、B站、小红书、知乎等多平台数据采集
          </Paragraph>
        ]}
      />
    </div>
  );
};

export default HomeContent; 