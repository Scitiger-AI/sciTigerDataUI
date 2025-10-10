"use client";

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Divider, theme, Typography } from 'antd';
import { css } from '@emotion/css';
import {
  WechatOutlined,
  YoutubeOutlined,
  PlaySquareOutlined,
  FireOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import LogoIcon from '@/components/ui/LogoIcon';
import { useRouter, usePathname } from 'next/navigation';

const { Sider } = Layout;
const { Text } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

interface SidebarProps {
  collapsed: boolean;
}

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['wechat']);
  const { token } = theme.useToken();

  useEffect(() => {
    const pathParts = pathname?.split('/') || [];
    if (pathParts[2]) {
      setSelectedKeys([pathParts[2]]);
    } else if (pathname?.startsWith('/crawler-data')) {
      setSelectedKeys(['wechat']);
    }
  }, [pathname]);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    router.push(`/crawler-data/${key}`);
  };

  const menuItems: MenuItem[] = [
    getItem('公众号', 'wechat', <WechatOutlined />),
    getItem('抖音', 'douyin', <PlaySquareOutlined />),
    getItem('B站', 'bilibili', <YoutubeOutlined />),
    getItem('小红书', 'xiaohongshu', <FireOutlined />),
    getItem('知乎', 'zhihu', <QuestionCircleOutlined />),
  ];

  const menuStyle = css`
    border-right: 0;
    flex: 1;
    padding: 8px;
    background: transparent;

    .ant-menu-item {
      margin: 4px 0;
      border-radius: 8px;
      height: 50px;
      display: flex;
      align-items: center;

      &:hover {
        background-color: rgba(0, 0, 0, 0.03);
      }

      &.ant-menu-item-selected {
        background-color: ${token.colorPrimaryBg};
        font-weight: 500;

        .anticon {
          color: ${token.colorPrimary};
        }
      }
    }

    .ant-menu-item .ant-menu-item-icon {
      font-size: 18px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ant-menu-title-content {
      margin-left: 10px;
      font-size: 14px;
    }
  `;

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className={css`
        height: 100vh;
        background: #fff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        display: flex;
        flex-direction: column;
      `}
    >
      <div className={css`
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      `}>
        <LogoIcon />
      </div>
      <Divider style={{ margin: '0 0 8px 0' }} />

      {!collapsed && (
        <div className={css`
          padding: 16px 16px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
        `}>
          <div className={css`
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: ${token.colorBgContainer};
            border: 1px solid ${token.colorBorderSecondary};
            border-radius: 8px;
            width: 100%;
            padding: 12px;
          `}>
            <Text strong style={{ fontSize: '16px' }}>爬虫数据</Text>
          </div>
        </div>
      )}

      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        onClick={handleMenuClick}
        items={menuItems}
        className={menuStyle}
      />
    </Sider>
  );
};