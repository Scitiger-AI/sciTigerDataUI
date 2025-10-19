"use client";

import React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/layout/MainLayout';
import ArticleDetail from '@/components/article/ArticleDetail';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const articleId = params.id as string;
  
  // 根据来源决定返回路径
  const handleBack = () => {
    const from = searchParams.get('from');
    const accountId = searchParams.get('accountId');
    
    // 如果来自特定公众号的文章列表，返回该公众号页面
    if (from === 'account' && accountId) {
      router.push(`/crawler-data/wechat/${accountId}`);
    } else {
      // 否则返回文章视图
      router.push('/crawler-data/wechat?view=articles');
    }
  };

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <ArticleDetail
          articleId={articleId}
          onBack={handleBack}
          showBackButton={true}
        />
      </div>
    </MainLayout>
  );
}

