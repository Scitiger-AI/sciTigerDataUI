'use client';

import React, { useState, useRef, useCallback } from 'react';
import { 
  Input, 
  Select, 
  Button, 
  Card, 
  Typography, 
  Space, 
  Divider,
  App,
  Spin,
} from 'antd';
import { 
  CopyOutlined, 
  ReloadOutlined, 
  FileMarkdownOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { articleService } from '@/services/article';
import { WECHAT_THEME_OPTIONS, type WechatTheme } from '@/types/article';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

// 默认示例 Markdown
const DEFAULT_MARKDOWN = `# 这是标题

这是一段**加粗文字**和*斜体文字*。

## 二级标题

- 列表项1
- 列表项2
- 列表项3

\`\`\`python
print("Hello, World!")
\`\`\`

> 这是一段引用文字

![图片](https://example.com/image.jpg)`;

export default function MarkdownToWechatPage() {
  const { message } = App.useApp();
  
  // 状态管理
  const [markdownContent, setMarkdownContent] = useState(DEFAULT_MARKDOWN);
  const [theme, setTheme] = useState<WechatTheme>('tech');
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 渲染内容引用
  const contentRef = useRef<HTMLDivElement>(null);

  // 转换 Markdown 为微信格式
  const handleConvert = useCallback(async () => {
    if (!markdownContent.trim()) {
      message.warning('请输入 Markdown 内容');
      return;
    }

    setLoading(true);
    try {
      const response = await articleService.convertMarkdownToWechat(
        markdownContent,
        theme
      );

      if (response.success) {
        setHtmlContent(response.data.html_content);
        message.success('转换成功！');
      } else {
        message.error(response.message || '转换失败');
      }
    } catch (error: any) {
      console.error('转换失败:', error);
      message.error(error?.message || '转换失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [markdownContent, theme, message]);

  // 复制富文本内容
  const handleCopyRichText = useCallback(async () => {
    if (!contentRef.current) {
      message.warning('没有可复制的内容');
      return;
    }

    try {
      // 使用 Selection API 复制富文本
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(contentRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);

      // 执行复制命令
      const success = document.execCommand('copy');

      // 清除选择
      selection?.removeAllRanges();

      if (success) {
        message.success('富文本内容已复制，可直接粘贴到微信公众号');
      } else {
        // 降级方案：复制纯 HTML
        await navigator.clipboard.writeText(htmlContent);
        message.warning('已复制HTML源码，建议在支持富文本的编辑器中粘贴');
      }
    } catch (error) {
      console.error('复制失败:', error);
      // 降级方案：复制纯 HTML
      try {
        await navigator.clipboard.writeText(htmlContent);
        message.warning('已复制HTML源码，建议在支持富文本的编辑器中粘贴');
      } catch (fallbackError) {
        message.error('复制失败，请手动复制');
      }
    }
  }, [htmlContent, message]);

  // 重置内容
  const handleReset = useCallback(() => {
    setMarkdownContent(DEFAULT_MARKDOWN);
    setHtmlContent('');
    setTheme('default');
    message.info('已重置');
  }, [message]);

  // 主题改变时自动转换
  const handleThemeChange = useCallback((newTheme: WechatTheme) => {
    setTheme(newTheme);
    if (htmlContent) {
      // 如果已经有转换结果，自动重新转换
      setTimeout(() => {
        handleConvert();
      }, 100);
    }
  }, [htmlContent, handleConvert]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px',
    }}>
      <div style={{ maxWidth: '1800px', margin: '0 auto' }}>
        {/* 页面标题 */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title 
            level={1} 
            style={{ 
              color: '#fff', 
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: '8px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            <FileMarkdownOutlined /> Markdown 转微信格式
          </Title>
          <Paragraph 
            style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontSize: '18px',
              margin: 0,
            }}
          >
            将 Markdown 内容转换为微信公众号格式，一键复制粘贴
          </Paragraph>
        </div>

        {/* 主题选择和操作按钮 */}
        <Card 
          style={{ marginBottom: '24px' }}
          styles={{ body: { padding: '16px 24px' } }}
        >
          <Space size="middle" wrap style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space size="middle">
              <Text strong>选择主题：</Text>
              <Select
                value={theme}
                onChange={handleThemeChange}
                style={{ width: 240 }}
                options={WECHAT_THEME_OPTIONS.map(opt => ({
                  label: opt.label,
                  value: opt.value,
                }))}
              />
            </Space>
            
            <Space size="middle">
              <Button 
                type="primary" 
                icon={<ThunderboltOutlined />}
                onClick={handleConvert}
                loading={loading}
                size="large"
              >
                转换
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={handleReset}
                size="large"
              >
                重置
              </Button>
            </Space>
          </Space>
        </Card>

        {/* 左右布局 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '24px',
          minHeight: '600px',
        }}>
          {/* 左侧：Markdown 输入 */}
          <Card 
            title={
              <Space>
                <FileMarkdownOutlined />
                <span>Markdown 内容</span>
              </Space>
            }
            styles={{ body: { padding: '0', height: 'calc(100% - 57px)' } }}
          >
            <TextArea
              value={markdownContent}
              onChange={(e) => setMarkdownContent(e.target.value)}
              placeholder="请输入 Markdown 内容..."
              style={{ 
                height: '100%',
                resize: 'none',
                border: 'none',
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                fontSize: '14px',
                lineHeight: '1.6',
                padding: '16px',
              }}
              autoSize={false}
            />
          </Card>

          {/* 右侧：微信格式预览 */}
          <Card 
            title={
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <span style={{ fontSize: '16px' }}>微信格式预览</span>
                  {htmlContent && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      ({htmlContent.length} 字符)
                    </Text>
                  )}
                </Space>
                {htmlContent && (
                  <Button
                    type="primary"
                    icon={<CopyOutlined />}
                    onClick={handleCopyRichText}
                    size="small"
                  >
                    复制富文本
                  </Button>
                )}
              </Space>
            }
            styles={{ body: { padding: '24px', height: 'calc(100% - 57px)', overflow: 'auto' } }}
          >
            {loading ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: '100%',
              }}>
                <Space direction="vertical" align="center">
                  <Spin size="large" />
                  <Text type="secondary">正在转换中...</Text>
                </Space>
              </div>
            ) : htmlContent ? (
              <div 
                ref={contentRef}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                style={{
                  background: '#fff',
                  minHeight: '100%',
                }}
              />
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: '100%',
                color: '#999',
              }}>
                <Space direction="vertical" align="center" size="large">
                  <FileMarkdownOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />
                  <div>
                    <Paragraph style={{ margin: 0, color: '#999', fontSize: '16px' }}>
                      请在左侧输入 Markdown 内容
                    </Paragraph>
                    <Paragraph style={{ margin: 0, color: '#ccc', fontSize: '14px' }}>
                      选择主题后点击"转换"按钮
                    </Paragraph>
                  </div>
                </Space>
              </div>
            )}
          </Card>
        </div>

        {/* 使用说明 */}
        <Card 
          title="📖 使用说明" 
          style={{ marginTop: '24px' }}
          styles={{ body: { padding: '20px 24px' } }}
        >
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text>
              <Text strong>1. 输入内容：</Text>在左侧输入或粘贴您的 Markdown 内容
            </Text>
            <Text>
              <Text strong>2. 选择主题：</Text>从顶部下拉框选择合适的主题风格
            </Text>
            <Text>
              <Text strong>3. 转换内容：</Text>点击"转换"按钮，右侧将显示微信格式的预览
            </Text>
            <Text>
              <Text strong>4. 复制内容：</Text>点击右上角"复制富文本"按钮，然后直接粘贴到微信公众号编辑器
            </Text>
            <Divider style={{ margin: '12px 0' }} />
            <Text type="secondary">
              💡 提示：主题切换后会自动重新转换内容，无需手动点击转换按钮
            </Text>
          </Space>
        </Card>

        {/* 页脚 */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '32px',
          color: 'rgba(255,255,255,0.8)',
        }}>
          <Text style={{ color: 'inherit' }}>
            科虎数据管理系统 © 2025 · Markdown 转微信格式工具
          </Text>
        </div>
      </div>
    </div>
  );
}

