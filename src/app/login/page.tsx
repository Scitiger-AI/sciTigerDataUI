"use client";

import React, { Suspense, useEffect, useState, useRef } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, Typography, Alert, Spin, App } from 'antd';
import { css } from '@emotion/css';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { SafetyOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { clearAuthStorage } from '@/utils/storage';

const { Title, Text } = Typography;

// 定义标题动画过渡效果
const titleAnimation = css`
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes glowPulse {
    0% {
      text-shadow: 0 0 5px rgba(22, 119, 255, 0.1), 0 0 10px rgba(22, 119, 255, 0.1);
    }
    50% {
      text-shadow: 0 0 20px rgba(22, 119, 255, 0.3), 0 0 30px rgba(22, 119, 255, 0.2);
    }
    100% {
      text-shadow: 0 0 5px rgba(22, 119, 255, 0.1), 0 0 10px rgba(22, 119, 255, 0.1);
    }
  }
`;

// 创建一个包含 useSearchParams 的组件
function LoginContent() {
  const searchParams = useSearchParams();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [redirectDisplay, setRedirectDisplay] = useState<string>('');
  const [redirectError, setRedirectError] = useState<string | null>(null);
  const { isLoggedIn, isLoading, isInitializing } = useAuth();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { message } = App.useApp();
  
  // 添加整体状态日志
  console.log('📊 LoginContent 渲染状态:', {
    isLoggedIn,
    isLoading,
    isInitializing,
    redirectPath,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    const from = searchParams.get('from');
    if (from) {
      setRedirectPath(from);
      
      // 提取友好的显示文本
      if (from.startsWith('/agent/')) {
        setRedirectDisplay('Agent详情');
      } else if (from.startsWith('/user-center')) {
        setRedirectDisplay('个人中心');
      } else if (from.startsWith('/workflow/')) {
        setRedirectDisplay('工作流');
      } else {
        // 将路径格式化为更友好的显示
        setRedirectDisplay(from.replace(/^\//, '').replace(/-/g, ' '));
      }
    }
  }, [searchParams]);

  // 如果用户已登录，重定向到首页
  useEffect(() => {
    console.log('🔄 登录页面跳转检查:', {
      isInitializing,
      isLoading,
      isLoggedIn,
      redirectPath,
      hasRedirected: hasRedirectedRef.current,
      shouldRedirect: !isInitializing && !isLoading && isLoggedIn && !hasRedirectedRef.current
    });
    
    if (!isInitializing && !isLoading && isLoggedIn && !hasRedirectedRef.current) {
      const redirectTo = redirectPath || '/';
      console.log(`🚀 准备跳转到: ${redirectTo}`);
      
      // 标记已经跳转过，防止重复跳转
      hasRedirectedRef.current = true;
      
      try {
        console.log('🔍 路由器状态:', { router, routerType: typeof router });
        router.push(redirectTo);
        console.log(`✅ router.push(${redirectTo}) 已调用`);
        
        // 设置跳转超时检查（5秒）
        redirectTimeoutRef.current = setTimeout(() => {
          const currentPath = window.location.pathname;
          console.log('⏰ 5秒后检查：当前路径 =', currentPath);
          
          // 如果5秒后仍在登录页面，说明跳转失败
          if (currentPath === '/login') {
            console.error('❌ 跳转超时，可能存在重定向循环或token已过期');
            
            // 设置错误信息
            setRedirectError('登录状态已过期，请重新登录');
            
            // 清除认证数据
            clearAuthStorage();
            
            // 重置跳转标记
            hasRedirectedRef.current = false;
            
            // 显示错误提示
            message.error('登录状态已过期，请重新登录', 3);
          }
        }, 5000);
      } catch (error) {
        console.error('❌ 路由跳转失败:', error);
        // 如果跳转失败，重置标记
        hasRedirectedRef.current = false;
        setRedirectError('跳转失败，请重试');
      }
    }
    
    // 清理函数：清除超时定时器
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, [isLoggedIn, isLoading, isInitializing, redirectPath, message]);

  // 如果正在初始化，显示加载界面
  if (isInitializing) {
    console.log('🔄 显示初始化界面 - isInitializing:', isInitializing);
    return (
      <div className={css`
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
      `}>
        <Spin size="large">
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <div style={{ marginTop: '20px', color: 'rgba(0, 0, 0, 0.45)' }}>
              正在检查登录状态...
            </div>
          </div>
        </Spin>
      </div>
    );
  }

  // 如果已登录且没有在处理其他请求，显示跳转提示
  if (isLoggedIn && !isLoading) {
    console.log('🎯 显示跳转提示界面:', {
      isLoggedIn,
      isLoading,
      isInitializing,
      redirectPath: redirectPath || '/',
      timestamp: new Date().toISOString()
    });
    return (
      <div className={css`
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
      `}>
        <Spin size="large">
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <div style={{ marginTop: '20px', color: 'rgba(0, 0, 0, 0.45)' }}>
              登录成功，正在跳转...
            </div>
          </div>
        </Spin>
      </div>
    );
  }

  return (
    <div
      className={css`
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        width: 100%;
        position: relative;
        background-image: url('/loginback.jpg');
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        
        &:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.05);
        }
      `}
    >      
      <Card
        className={css`
          width: 440px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          border: none;
          position: relative;
          z-index: 1;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.9);
          padding: 24px 32px;
          transition: all 0.3s ease;
          margin: 20px;
          margin-top: 100px;

          &:hover {
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
            transform: translateY(-5px);
          }

          @media (max-width: 576px) {
            width: 90%;
            padding: 20px;
          }
        `}
      >
        {/* 新设计的科虎数据管理系统标题区域 */}
        <div
          className={css`
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 36px;
            ${titleAnimation}
          `}
        >
          {/* 平台图标 */}
          <div className={css`
            display: flex;
            justify-content: center;
            align-items: center;
            width: 80px;
            height: 80px;
            // border-radius: 20px;
            // background: linear-gradient(135deg, #1677ff 0%, #06f 50%, #0051cc 100%);
            // margin-bottom: 16px;
            // box-shadow: 0 10px 20px rgba(22, 119, 255, 0.3);
            // animation: fadeInUp 0.8s ease-out forwards;
          `}>
            <Image 
              src="/logo.png" 
              alt="科虎智能信息Logo" 
              width={80} 
              height={80} 
              style={{ objectFit: 'contain' }}
            />
          </div>
          
          {/* 平台主标题 */}
          <div className={css`
            text-align: center;
            animation: fadeInUp 0.8s ease-out 0.1s forwards;
            opacity: 0;
          `}>
            <Title
              level={2}
              className={css`
                margin: 0;
                background: linear-gradient(to right, #1677ff, #06f);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                font-weight: 700;
                letter-spacing: 1px;
                animation: glowPulse 3s infinite;
              `}
            >
              科虎数据管理系统
            </Title>
          </div>
          
          {/* 平台副标题 */}
          <div className={css`
            width: 60px;
            height: 2px;
            background: linear-gradient(to right, #1677ff, #06f);
            margin: 16px 0;
            animation: fadeInUp 0.8s ease-out 0.2s forwards;
            opacity: 0;
          `}></div>
          
          <div className={css`
            text-align: center;
            animation: fadeInUp 0.8s ease-out 0.3s forwards;
            opacity: 0;
          `}>
            <Text
              className={css`
                font-size: 14px;
                color: rgba(0, 0, 0, 0.45);
              `}
            >
              科虎自研、请联系管理员获取账号
            </Text>
          </div>
        </div>

        {/* 显示跳转错误信息 */}
        {redirectError && (
          <Alert
            message="登录失败"
            description={redirectError}
            type="error"
            showIcon
            closable
            onClose={() => setRedirectError(null)}
            style={{ marginBottom: 24, borderRadius: 8 }}
          />
        )}

        {/* 显示需登录访问的提示信息 */}
        {redirectPath && redirectPath !== '/' && !redirectError && (
          <Alert
            message={`登录后将跳转到：${redirectDisplay}`}
            type="info"
            showIcon
            style={{ marginBottom: 24, borderRadius: 8 }}
          />
        )}

        <LoginForm />
      </Card>
    </div>
  );
}

// 包装 Suspense 的主页面组件
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className={css`
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
      `}>
        <Spin size="large">
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <div style={{ marginTop: '20px', color: 'rgba(0, 0, 0, 0.45)' }}>正在加载登录页面...</div>
          </div>
        </Spin>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}