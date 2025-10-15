import React, { useState, useRef } from 'react';
import { Card, Typography, Space, Button, Select, App, Divider, Tag, Modal } from 'antd';
import { 
  WechatOutlined, 
  CopyOutlined, 
  CheckOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  CodeOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { WechatTheme } from '@/types/article';
import { WECHAT_THEME_OPTIONS } from '@/types/article';

const { Text } = Typography;

interface WechatHtmlRendererProps {
  content: string;
  articleId: string;
  currentTheme: WechatTheme;
  onThemeChange: (theme: WechatTheme) => void;
  onRefresh: () => void;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface WechatContentViewerProps {
  content: string;
  theme: WechatTheme;
  open: boolean;
  onClose: () => void;
  viewMode?: 'rendered' | 'source';
}

// 微信内容查看器组件（弹窗）
const WechatContentViewer: React.FC<WechatContentViewerProps> = ({
  content,
  theme,
  open,
  onClose,
  viewMode = 'rendered',
}) => {
  const { message } = App.useApp();
  const [copied, setCopied] = useState(false);
  const [currentViewMode, setCurrentViewMode] = useState<'rendered' | 'source'>(viewMode);
  const contentRef = useRef<HTMLDivElement>(null);

  // 复制渲染后的富文本内容（模拟 Ctrl+C 效果）
  const handleCopyRichText = async () => {
    if (!contentRef.current) return;
    
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
        setCopied(true);
        message.success('富文本内容已复制，可直接粘贴到微信公众号');
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error('复制失败');
      }
    } catch (error) {
      console.error('富文本复制失败:', error);
      // 降级方案：复制纯HTML
      try {
        await navigator.clipboard.writeText(content);
        message.warning('已复制HTML源码，建议在支持富文本的编辑器中粘贴');
      } catch (err) {
        message.error('复制失败');
      }
    }
  };

  // 复制HTML源码
  const handleCopySource = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      message.success('HTML源码已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      message.error('复制失败');
    }
  };

  const handleCopy = () => {
    if (currentViewMode === 'source') {
      handleCopySource();
    } else {
      handleCopyRichText();
    }
  };

  const renderContent = () => {
    // 源代码视图
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
    return (
      <div 
        ref={contentRef}
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
  };

  const getThemeLabel = () => {
    const themeInfo = WECHAT_THEME_OPTIONS.find(opt => opt.value === theme);
    return themeInfo?.label || theme;
  };

  return (
    <Modal
      title={
        <Space>
          <WechatOutlined style={{ color: '#07c160' }} />
          微信格式内容 - {getThemeLabel()}
          <Tag color={currentViewMode === 'source' ? 'blue' : 'cyan'}>
            {currentViewMode === 'source' ? '源代码' : '渲染'}
          </Tag>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width="80%"
      style={{ top: 20 }}
      footer={[
        <Button 
          key="toggle" 
          icon={<CodeOutlined />} 
          onClick={() => setCurrentViewMode(currentViewMode === 'source' ? 'rendered' : 'source')}
        >
          {currentViewMode === 'source' ? '查看渲染' : '查看源代码'}
        </Button>,
        <Button 
          key="copy" 
          icon={copied ? <CheckOutlined /> : <CopyOutlined />} 
          onClick={handleCopy}
        >
          {copied ? '已复制' : (currentViewMode === 'source' ? '复制源码' : '复制内容')}
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          关闭
        </Button>,
      ]}
    >
      {renderContent()}
    </Modal>
  );
};

// 主渲染器组件
const WechatHtmlRenderer: React.FC<WechatHtmlRendererProps> = ({
  content,
  articleId,
  currentTheme,
  onThemeChange,
  onRefresh,
  loading = false,
  className,
  style,
}) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [sourceViewerOpen, setSourceViewerOpen] = useState(false);

  // 获取当前主题信息
  const getCurrentThemeInfo = () => {
    return WECHAT_THEME_OPTIONS.find(option => option.value === currentTheme);
  };

  const themeInfo = getCurrentThemeInfo();

  return (
    <Card 
      className={className}
      style={style}
      title={
        <Space>
          <WechatOutlined style={{ color: '#07c160' }} />
          微信格式内容
          <Tag color="cyan">微信HTML</Tag>
        </Space>
      }
      extra={
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => setViewerOpen(true)}
            disabled={!content}
            size="small"
          >
            全屏查看
          </Button>
          <Button 
            type="text" 
            icon={<CodeOutlined />} 
            onClick={() => setSourceViewerOpen(true)}
            disabled={!content}
            size="small"
          >
            查看源代码
          </Button>
        </Space>
      }
      size="small"
    >
      {/* 主题选择器 */}
      <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: '16px' }}>
        <Space align="center">
          <Text strong>选择主题:</Text>
          <Select
            value={currentTheme}
            onChange={onThemeChange}
            style={{ width: 200 }}
            loading={loading}
            options={WECHAT_THEME_OPTIONS}
          />
          {themeInfo && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {themeInfo.description}
            </Text>
          )}
        </Space>

        {/* 使用提示 */}
        <div 
          style={{ 
            background: '#f0f5ff', 
            border: '1px solid #adc6ff',
            borderRadius: '6px',
            padding: '12px',
          }}
        >
          <Space align="start">
            <InfoCircleOutlined style={{ color: '#1890ff', marginTop: '2px' }} />
            <div>
              <Text strong style={{ color: '#1890ff', fontSize: '12px' }}>使用说明：</Text>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                1. 选择合适的主题风格<br />
                2. 点击"全屏查看"打开完整预览<br />
                3. 在弹窗中点击"复制内容"，可像 Ctrl+C 一样直接粘贴到微信公众号
              </div>
            </div>
          </Space>
        </div>
      </Space>

      <Divider style={{ margin: '16px 0' }} />

      {/* 内容预览 */}
      {content ? (
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
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <WechatOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
          <div>暂无微信格式内容</div>
        </div>
      )}

      {/* 渲染视图弹窗 */}
      <WechatContentViewer
        content={content}
        theme={currentTheme}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        viewMode="rendered"
      />

      {/* 源代码视图弹窗 */}
      <WechatContentViewer
        content={content}
        theme={currentTheme}
        open={sourceViewerOpen}
        onClose={() => setSourceViewerOpen(false)}
        viewMode="source"
      />
    </Card>
  );
};

export default WechatHtmlRenderer;
