import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Card, Typography, Space, Tag, Button, Modal, App } from 'antd';
import { 
  EyeOutlined, 
  FileTextOutlined, 
  CodeOutlined,
  CopyOutlined,
  CheckOutlined 
} from '@ant-design/icons';
import type { ArticleContentFormat } from '@/types/article';

const { Text, Paragraph } = Typography;

interface MarkdownRendererProps {
  content: string;
  format: ArticleContentFormat;
  title?: string;
  showActions?: boolean;
  enableSourceView?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface ContentViewerProps {
  content: string;
  format: ArticleContentFormat;
  title: string;
  open: boolean;
  onClose: () => void;
  viewMode?: 'rendered' | 'source';
}

// 内容查看器组件
const ContentViewer: React.FC<ContentViewerProps> = ({
  content,
  format,
  title,
  open,
  onClose,
  viewMode = 'rendered',
}) => {
  const { message } = App.useApp();
  const [copied, setCopied] = useState(false);
  const [currentViewMode, setCurrentViewMode] = useState<'rendered' | 'source'>(viewMode);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      message.success('内容已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      message.error('复制失败');
    }
  };

  const renderContent = () => {
    // 如果是源代码视图，始终显示为纯文本
    if (currentViewMode === 'source') {
      return (
        <pre style={{ 
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxHeight: '60vh',
          overflow: 'auto',
          backgroundColor: '#f8f8f8',
          padding: '16px',
          borderRadius: '6px',
          border: '1px solid #d9d9d9',
          margin: 0,
          fontFamily: 'Monaco, "Courier New", monospace',
          fontSize: '13px',
          lineHeight: '1.5'
        }}>
          {content}
        </pre>
      );
    }

    // 渲染视图
    switch (format) {
      case 'html':
        return (
          <div 
            dangerouslySetInnerHTML={{ __html: content }}
            style={{ 
              maxHeight: '60vh', 
              overflow: 'auto',
              border: '1px solid #f0f0f0',
              borderRadius: '6px',
              padding: '16px',
              backgroundColor: '#fafafa'
            }}
          />
        );
      case 'text':
      case 'text_original':
      case 'text_denoised':
        return (
          <pre style={{ 
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: '60vh',
            overflow: 'auto',
            backgroundColor: '#f5f5f5',
            padding: '16px',
            borderRadius: '6px',
            border: '1px solid #d9d9d9',
            margin: 0
          }}>
            {content}
          </pre>
        );
      case 'markdown':
      case 'markdown_original':
      case 'markdown_denoised':
      default:
        return (
          <div style={{ maxHeight: '600px', overflow: 'auto' }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                // 自定义代码块样式
                code: ({ node, inline, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <pre style={{ 
                      backgroundColor: '#f6f8fa',
                      padding: '16px',
                      borderRadius: '6px',
                      overflow: 'auto',
                      border: '1px solid #e1e4e8'
                    }}>
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code 
                      className={className} 
                      style={{ 
                        backgroundColor: '#f1f3f4',
                        padding: '2px 4px',
                        borderRadius: '3px',
                        fontSize: '0.9em'
                      }} 
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                // 自定义表格样式
                table: ({ children }) => (
                  <div style={{ overflow: 'auto', margin: '16px 0' }}>
                    <table style={{ 
                      width: '100%',
                      borderCollapse: 'collapse',
                      border: '1px solid #d9d9d9'
                    }}>
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th style={{ 
                    backgroundColor: '#fafafa',
                    border: '1px solid #d9d9d9',
                    padding: '8px 12px',
                    textAlign: 'left',
                    fontWeight: 'bold'
                  }}>
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td style={{ 
                    border: '1px solid #d9d9d9',
                    padding: '8px 12px'
                  }}>
                    {children}
                  </td>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        );
    }
  };

  const getFormatLabel = () => {
    const formatLabels: Record<ArticleContentFormat, string> = {
      markdown: 'Markdown',
      html: 'HTML',
      text: '纯文本',
      markdown_original: '原始Markdown',
      text_original: '原始文本',
      markdown_denoised: 'AI去噪Markdown',
      text_denoised: 'AI去噪文本',
      markdown_rewritten: 'AI重写Markdown',
      text_rewritten: 'AI重写文本',
      wechat_html: '微信格式HTML',
    };
    return formatLabels[format] || format;
  };

  // 判断是否支持源代码视图（只有 Markdown 和 HTML 格式支持）
  const supportsSourceView = format.includes('markdown') || format === 'html';

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined />
          {title} - {getFormatLabel()}
          {supportsSourceView && (
            <Tag color={currentViewMode === 'source' ? 'blue' : 'default'}>
              {currentViewMode === 'source' ? '源代码' : '渲染'}
            </Tag>
          )}
        </Space>
      }
      open={open}
      onCancel={onClose}
      width="80%"
      style={{ top: 20 }}
      footer={[
        supportsSourceView && (
          <Button 
            key="toggle" 
            icon={<CodeOutlined />} 
            onClick={() => setCurrentViewMode(currentViewMode === 'source' ? 'rendered' : 'source')}
          >
            {currentViewMode === 'source' ? '查看渲染' : '查看源代码'}
          </Button>
        ),
        <Button key="copy" icon={copied ? <CheckOutlined /> : <CopyOutlined />} onClick={handleCopy}>
          {copied ? '已复制' : '复制内容'}
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          关闭
        </Button>,
      ].filter(Boolean)}
    >
      {renderContent()}
    </Modal>
  );
};

// 主要的Markdown渲染器组件
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  format,
  title = '内容预览',
  showActions = true,
  enableSourceView = false,
  className,
  style,
}) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [sourceViewerOpen, setSourceViewerOpen] = useState(false);

  const renderContent = () => {
    if (format === 'html') {
      return (
        <div 
          dangerouslySetInnerHTML={{ __html: content }}
          style={{ 
            maxHeight: '400px', 
            overflow: 'auto',
            border: '1px solid #f0f0f0',
            borderRadius: '6px',
            padding: '16px',
            backgroundColor: '#fafafa'
          }}
        />
      );
    }

    if (format === 'text' || format.includes('text')) {
      return (
        <pre style={{ 
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxHeight: '400px',
          overflow: 'auto',
          backgroundColor: '#f5f5f5',
          padding: '16px',
          borderRadius: '6px',
          border: '1px solid #d9d9d9'
        }}>
          {content}
        </pre>
      );
    }

    // Markdown格式
    return (
      <div style={{ maxHeight: '400px', overflow: 'auto' }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            code: ({ node, inline, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <pre style={{ 
                  backgroundColor: '#f6f8fa',
                  padding: '12px',
                  borderRadius: '6px',
                  overflow: 'auto',
                  border: '1px solid #e1e4e8',
                  fontSize: '0.9em'
                }}>
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              ) : (
                <code 
                  className={className} 
                  style={{ 
                    backgroundColor: '#f1f3f4',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    fontSize: '0.9em'
                  }} 
                  {...props}
                >
                  {children}
                </code>
              );
            },
            table: ({ children }) => (
              <div style={{ overflow: 'auto', margin: '12px 0' }}>
                <table style={{ 
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '1px solid #d9d9d9',
                  fontSize: '0.9em'
                }}>
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th style={{ 
                backgroundColor: '#fafafa',
                border: '1px solid #d9d9d9',
                padding: '6px 8px',
                textAlign: 'left',
                fontWeight: 'bold'
              }}>
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td style={{ 
                border: '1px solid #d9d9d9',
                padding: '6px 8px'
              }}>
                {children}
              </td>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  const getFormatTag = () => {
    const formatLabels: Record<ArticleContentFormat, { label: string; color: string }> = {
      markdown: { label: 'Markdown', color: 'blue' },
      html: { label: 'HTML', color: 'orange' },
      text: { label: '纯文本', color: 'green' },
      markdown_original: { label: '原始MD', color: 'default' },
      text_original: { label: '原始文本', color: 'default' },
      markdown_denoised: { label: 'AI去噪MD', color: 'purple' },
      text_denoised: { label: 'AI去噪文本', color: 'purple' },
      markdown_rewritten: { label: 'AI重写MD', color: 'magenta' },
      text_rewritten: { label: 'AI重写文本', color: 'magenta' },
      wechat_html: { label: '微信HTML', color: 'cyan' },
    };
    
    const formatInfo = formatLabels[format] || { label: format, color: 'default' };
    return <Tag color={formatInfo.color}>{formatInfo.label}</Tag>;
  };

  return (
    <Card 
      className={className}
      style={style}
      title={
        <Space>
          <FileTextOutlined />
          {title}
          {getFormatTag()}
        </Space>
      }
      extra={
        showActions && (
          <Space>
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => setViewerOpen(true)}
              size="small"
            >
              全屏查看
            </Button>
            {enableSourceView && (
              <Button 
                type="text" 
                icon={<CodeOutlined />} 
                onClick={() => setSourceViewerOpen(true)}
                size="small"
              >
                查看源代码
              </Button>
            )}
          </Space>
        )
      }
      size="small"
    >
      {renderContent()}
      
      <ContentViewer
        content={content}
        format={format}
        title={title}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
      
      {enableSourceView && (
        <ContentViewer
          content={content}
          format={format}
          title={title}
          open={sourceViewerOpen}
          onClose={() => setSourceViewerOpen(false)}
          viewMode="source"
        />
      )}
    </Card>
  );
};

export default MarkdownRenderer;
