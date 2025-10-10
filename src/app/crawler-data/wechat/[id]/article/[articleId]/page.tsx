"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/layout/MainLayout';
import ArticleDetail from '@/components/article/ArticleDetail';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const accountId = params.id as string;
  const articleId = params.articleId as string;

  const handleBack = () => {
    router.push(`/crawler-data/wechat/${accountId}`);
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
