'use client';

import '@ant-design/v5-patch-for-react-19';
import { ConfigProvider, App } from 'antd';
import zhCN from 'antd/locale/zh_CN';

export default function Md2WechatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#667eea',
          borderRadius: 8,
        },
      }}
    >
      <App>
        {children}
      </App>
    </ConfigProvider>
  );
}

