import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Spin,
  Tabs,
  Row,
  Col,
  Divider,
  App,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  LinkOutlined,
  CalendarOutlined,
  UserOutlined,
  FileWordOutlined,
  PictureOutlined,
  RobotOutlined,
  FileTextOutlined,
  CodeOutlined,
  EyeOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  SyncOutlined,
  TeamOutlined,
  DownloadOutlined,
  WechatOutlined,
} from '@ant-design/icons';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import WechatHtmlRenderer from '@/components/ui/WechatHtmlRenderer';
import { articleService } from '@/services/article';
import type { Article, ArticleContentFormat, ArticleDenoiseRequest, ArticleRewriteRequest, WechatTheme } from '@/types/article';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface ArticleDetailProps {
  articleId: string;
  onBack?: () => void;
  showBackButton?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({
  articleId,
  onBack,
  showBackButton = true,
  className,
  style,
}) => {
  const { message: messageApi, modal } = App.useApp();
  
  // 状态管理
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [denoiseLoading, setDenoiseLoading] = useState(false);
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('markdown_original');
  
  // 微信主题状态
  const [wechatTheme, setWechatTheme] = useState<WechatTheme>('default');
  const [wechatContentLoading, setWechatContentLoading] = useState(false);
  
  // 内容状态
  const [contents, setContents] = useState<Record<ArticleContentFormat, string>>({
    markdown: '',
    html: '',
    text: '',
    markdown_original: '',
    text_original: '',
    markdown_denoised: '',
    text_denoised: '',
    markdown_rewritten: '',
    text_rewritten: '',
    wechat_html: '',
  });

  // 加载文章详情
  const loadArticleDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await articleService.getArticleDetail(articleId);
      if (response.success && response.data) {
        setArticle(response.data);
      } else {
        messageApi.error('获取文章详情失败');
      }
    } catch (error) {
      console.error('加载文章详情失败:', error);
      messageApi.error('加载文章详情失败');
    } finally {
      setLoading(false);
    }
  }, [articleId, messageApi]);

  // 加载文章内容
  const loadArticleContent = useCallback(async (format: ArticleContentFormat) => {
    try {
      setContentLoading(true);
      const content = await articleService.getArticleContent(articleId, format);
      if (content) {
        setContents(prev => ({
          ...prev,
          [format]: content.content,
        }));
      }
    } catch (error) {
      console.error(`加载${format}内容失败:`, error);
      messageApi.error(`加载${format}内容失败`);
    } finally {
      setContentLoading(false);
    }
  }, [articleId, messageApi]);

  // 加载微信格式内容
  const loadWechatContent = useCallback(async (theme: WechatTheme = wechatTheme) => {
    try {
      setWechatContentLoading(true);
      const content = await articleService.getArticleContent(articleId, 'wechat_html', theme);
      if (content) {
        setContents(prev => ({
          ...prev,
          wechat_html: content.content,
        }));
        // messageApi.success(`已切换至${theme}主题`);
      }
    } catch (error) {
      console.error('加载微信格式内容失败:', error);
      messageApi.error('加载微信格式内容失败');
    } finally {
      setWechatContentLoading(false);
    }
  }, [articleId, wechatTheme, messageApi]);

  // 处理微信主题切换
  const handleWechatThemeChange = useCallback((theme: WechatTheme) => {
    setWechatTheme(theme);
    loadWechatContent(theme);
  }, [loadWechatContent]);

  // 加载所有内容格式
  const loadAllContents = useCallback(async () => {
    try {
      setContentLoading(true);
      const formats: ArticleContentFormat[] = [
        'markdown',
        'markdown_denoised',
        'markdown_rewritten',
        'html',
        'text',
        'markdown_original',
        'text_original',
        'text_denoised',
        'text_rewritten',
      ];

      const promises = formats.map(async (format) => {
        try {
          const content = await articleService.getArticleContent(articleId, format);
          return { format, content: content?.content || '' };
        } catch (error) {
          console.error(`加载${format}内容失败:`, error);
          return { format, content: '' };
        }
      });

      const results = await Promise.all(promises);
      const newContents = results.reduce((acc, { format, content }) => {
        acc[format] = content;
        return acc;
      }, {} as Record<ArticleContentFormat, string>);

      setContents(prev => ({
        ...prev,
        ...newContents,
      }));
      
      // 同时加载微信格式内容
      loadWechatContent();
    } catch (error) {
      console.error('加载文章内容失败:', error);
      messageApi.error('加载文章内容失败');
    } finally {
      setContentLoading(false);
    }
  }, [articleId, messageApi, loadWechatContent]);

  // AI去噪处理
  const handleDenoise = async (forceReprocess: boolean = false) => {
    if (!article) return;
    
    const title = forceReprocess ? '重新进行AI去噪' : '开始AI去噪处理';
    const content = forceReprocess 
      ? '确定要重新对这篇文章进行AI去噪处理吗？这将覆盖现有的去噪结果。'
      : '确定要对这篇文章进行AI去噪处理吗？处理完成后可以查看去噪后的内容。';
    
    modal.confirm({
      title,
      content,
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          setDenoiseLoading(true);
          
          const options: ArticleDenoiseRequest = {
            force_reprocess: forceReprocess,
            save_to_file: true,
          };
          
          const response = await articleService.denoiseArticle(articleId, options);
      
      if (response.success) {
        messageApi.success({
          content: (
            <div>
              <div style={{ marginBottom: '8px' }}>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '4px' }} />
                AI去噪处理完成
              </div>
              {response.data.processing_time && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  处理耗时: {response.data.processing_time.toFixed(2)}秒
                </div>
              )}
              {response.data.reduction_rate && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  内容压缩率: {(response.data.reduction_rate * 100).toFixed(1)}%
                </div>
              )}
            </div>
          ),
          duration: 5,
        });
        
        // 刷新文章详情和内容
        await loadArticleDetail();
        await loadAllContents();
      } else {
        messageApi.error(response.message || 'AI去噪失败');
      }
    } catch (error: any) {
      console.error('AI去噪失败:', error);
      
      // 处理特定错误
      if (error?.data?.error_code === 'ALREADY_DENOISED') {
        messageApi.warning({
          content: (
            <div>
              <div>文章已经进行过AI去噪</div>
              <div style={{ marginTop: '8px' }}>
                <Button 
                  type="link" 
                  size="small" 
                  onClick={() => handleDenoise(true)}
                  style={{ padding: 0, height: 'auto' }}
                >
                  点击强制重新处理
                </Button>
              </div>
            </div>
          ),
          duration: 8,
        });
      } else {
        messageApi.error(error?.message || 'AI去噪失败，请稍后重试');
      }
        } finally {
          setDenoiseLoading(false);
        }
      },
    });
  };

  // AI重写处理
  const handleRewrite = async (forceReprocess: boolean = false) => {
    if (!article) return;
    
    const title = forceReprocess ? '重新进行AI重写' : '开始AI重写处理';
    const content = forceReprocess 
      ? '确定要重新对这篇文章进行AI重写处理吗？这将覆盖现有的重写结果。'
      : '确定要对这篇文章进行AI重写处理吗？AI将在保持原意的基础上提升内容的原创性。';
    
    modal.confirm({
      title,
      content,
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          setRewriteLoading(true);
          
          const options: ArticleRewriteRequest = {
            force_reprocess: forceReprocess,
            save_to_file: true,
            auto_denoise: true,
          };
          
          const response = await articleService.rewriteArticle(articleId, options);
      
          if (response.success) {
            messageApi.success({
              content: (
                <div>
                  <div style={{ marginBottom: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '4px' }} />
                    AI重写处理完成
                  </div>
                  {response.data.processing_time && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      处理耗时: {response.data.processing_time.toFixed(2)}秒
                    </div>
                  )}
                  {response.data.auto_denoised && response.data.denoise_processing_time && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      自动去噪耗时: {response.data.denoise_processing_time.toFixed(2)}秒
                    </div>
                  )}
                  {response.data.length_change_rate !== undefined && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      内容长度变化: {(response.data.length_change_rate * 100).toFixed(1)}%
                    </div>
                  )}
                  {response.data.original_length && response.data.rewritten_length && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      原文长度: {response.data.original_length} → 重写后: {response.data.rewritten_length}
                    </div>
                  )}
                </div>
              ),
              duration: 6,
            });
            
            // 刷新文章详情和内容
            await loadArticleDetail();
            await loadAllContents();
            
            // 切换到重写后的标签页
            setActiveTab('markdown_rewritten');
          } else {
            messageApi.error(response.message || 'AI重写失败');
          }
        } catch (error: any) {
          console.error('AI重写失败:', error);
          
          // 处理特定错误
          if (error?.data?.error_code === 'ALREADY_REWRITTEN' || error?.error_code === 'ALREADY_REWRITTEN') {
            messageApi.warning({
              content: (
                <div>
                  <div>文章已经进行过AI重写</div>
                  <div style={{ marginTop: '8px' }}>
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={() => handleRewrite(true)}
                      style={{ padding: 0, height: 'auto' }}
                    >
                      点击强制重新处理
                    </Button>
                  </div>
                </div>
              ),
              duration: 8,
            });
          } else if (error?.data?.error_code === 'INSUFFICIENT_CONTENT' || error?.error_code === 'INSUFFICIENT_CONTENT') {
            messageApi.error('文章内容过短，无法进行AI重写（最少100个字符）');
          } else {
            messageApi.error(error?.message || 'AI重写失败，请稍后重试');
          }
        } finally {
          setRewriteLoading(false);
        }
      },
    });
  };

  // 处理外部链接
  const handleExternalLink = () => {
    if (article?.url) {
      window.open(article.url, '_blank');
    }
  };

  // 格式化发布时间
  const formatPublishTime = (publishTime: string | null, postTime?: number) => {
    try {
      let date: Date | null = null;
      
      // 优先使用可靠的 Unix 时间戳
      if (postTime) {
        date = new Date(postTime * 1000);
        // 验证时间戳是否有效
        if (isNaN(date.getTime())) {
          date = null;
        }
      }
      
      // 如果 post_time 不可用或无效，尝试解析 publish_time
      if (!date && publishTime && publishTime !== 'null') {
        // 尝试解析中文日期格式: "2025年09月26日 09:50"
        const chineseDateMatch = publishTime.match(/(\d{4})年(\d{2})月(\d{2})日\s+(\d{2}):(\d{2})/);
        
        if (chineseDateMatch) {
          const [, year, month, day, hour, minute] = chineseDateMatch;
          date = new Date(
            parseInt(year),
            parseInt(month) - 1, // 月份从0开始
            parseInt(day),
            parseInt(hour),
            parseInt(minute)
          );
        } else {
          // 尝试直接解析（适用于 ISO 格式等标准格式）
          date = new Date(publishTime);
        }
        
        // 验证日期是否有效
        if (isNaN(date.getTime())) {
          date = null;
        }
      }
      
      // 如果所有尝试都失败，返回未知时间
      if (!date) {
        return '未知时间';
      }
      
      return date.toLocaleString('zh-CN');
    } catch {
      return '未知时间';
    }
  };

  // 格式化字数
  const formatWordCount = (count: number) => {
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万`;
    }
    return count.toLocaleString();
  };

  // 初始化加载
  useEffect(() => {
    if (articleId) {
      loadArticleDetail();
    }
  }, [articleId, loadArticleDetail]);

  // 加载内容
  useEffect(() => {
    if (article && article.is_crawled) {
      loadAllContents();
    }
  }, [article, loadAllContents]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="加载文章详情中...">
          <div style={{ height: '200px' }} />
        </Spin>
      </div>
    );
  }

  if (!article) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Title level={4}>文章不存在</Title>
          {showBackButton && onBack && (
            <Button type="primary" onClick={onBack}>
              返回列表
            </Button>
          )}
        </div>
      </Card>
    );
  }

  const tabItems = [
    {
      key: 'markdown_original',
      label: (
        <Space>
          <FileTextOutlined />
          Markdown原文
        </Space>
      ),
      children: (
        <MarkdownRenderer
          content={contents.markdown_original}
          format="markdown_original"
          title="Markdown原文"
          showActions={true}
          enableSourceView={true}
        />
      ),
    },
    {
      key: 'wechat_html',
      label: (
        <Space>
          <WechatOutlined style={{ color: '#07c160' }} />
          微信格式内容
        </Space>
      ),
      children: (
        <WechatHtmlRenderer
          content={contents.wechat_html}
          articleId={articleId}
          currentTheme={wechatTheme}
          onThemeChange={handleWechatThemeChange}
          onRefresh={() => loadWechatContent()}
          loading={wechatContentLoading}
        />
      ),
    },
    {
      key: 'markdown_denoised',
      label: (
        <Space>
          <RobotOutlined />
          AI去噪Markdown
        </Space>
      ),
      children: (
        <MarkdownRenderer
          content={contents.markdown_denoised}
          format="markdown_denoised"
          title="AI去噪Markdown"
          showActions={true}
          enableSourceView={true}
        />
      ),
    },
    {
      key: 'markdown_rewritten',
      label: (
        <Space>
          <EditOutlined />
          AI重写Markdown
        </Space>
      ),
      children: (
        <MarkdownRenderer
          content={contents.markdown_rewritten}
          format="markdown_rewritten"
          title="AI重写Markdown"
          showActions={true}
          enableSourceView={true}
        />
      ),
    },
    {
      key: 'html',
      label: (
        <Space>
          <CodeOutlined />
          原始HTML
        </Space>
      ),
      children: (
        <MarkdownRenderer
          content={contents.html}
          format="html"
          title="原始HTML"
          showActions={true}
          enableSourceView={true}
        />
      ),
    },
    {
      key: 'text_original',
      label: (
        <Space>
          <FileTextOutlined />
          原始文本
        </Space>
      ),
      children: (
        <MarkdownRenderer
          content={contents.text_original}
          format="text_original"
          title="原始文本"
          showActions={true}
        />
      ),
    },
    {
      key: 'text_denoised',
      label: (
        <Space>
          <RobotOutlined />
          AI去噪Text
        </Space>
      ),
      children: (
        <MarkdownRenderer
          content={contents.text_denoised}
          format="text_denoised"
          title="AI去噪Text"
          showActions={true}
        />
      ),
    },
    {
      key: 'text_rewritten',
      label: (
        <Space>
          <EditOutlined />
          AI重写Text
        </Space>
      ),
      children: (
        <MarkdownRenderer
          content={contents.text_rewritten}
          format="text_rewritten"
          title="AI重写Text"
          showActions={true}
        />
      ),
    },
  ];

  return (
    <div className={className} style={style}>
      {/* 页面头部 */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Space size="middle" style={{ marginBottom: '16px' }}>
              {showBackButton && onBack && (
                <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
                  返回列表
                </Button>
              )}
              <Title level={3} style={{ margin: 0 }}>
                {article.title}
              </Title>
            </Space>

            {/* 文章基本信息 */}
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12} lg={8}>
                <Space direction="vertical" size="small">
                  <Space>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    <Text strong>作者:</Text>
                    <Text>{article.author || '未知作者'}</Text>
                  </Space>
                  <Space>
                    <TeamOutlined style={{ color: '#13c2c2' }} />
                    <Text strong>公众号:</Text>
                    <Text>{article.nickname}</Text>
                  </Space>
                </Space>
              </Col>
              
              <Col xs={24} sm={12} lg={8}>
                <Space direction="vertical" size="small">
                  <Space>
                    <CalendarOutlined style={{ color: '#52c41a' }} />
                    <Text strong>发布时间:</Text>
                    <Text>{formatPublishTime(article.publish_time, article.post_time)}</Text>
                  </Space>
                  {article.crawl_time && (
                    <Space>
                      <DownloadOutlined style={{ color: '#722ed1' }} />
                      <Text strong>采集时间:</Text>
                      <Text>{formatPublishTime(article.crawl_time)}</Text>
                    </Space>
                  )}
                </Space>
              </Col>
              
              <Col xs={24} sm={12} lg={8}>
                <Space direction="vertical" size="small">
                  <Space>
                    <FileWordOutlined style={{ color: '#fa8c16' }} />
                    <Text strong>字数:</Text>
                    <Text>{formatWordCount(article.word_count)}</Text>
                  </Space>
                  <Space>
                    <PictureOutlined style={{ color: '#eb2f96' }} />
                    <Text strong>图片数:</Text>
                    <Text>{article.image_count}</Text>
                  </Space>
                </Space>
              </Col>
            </Row>

            <Divider />

            {/* 状态标签 */}
            <Space size="small" wrap>
              {article.is_crawled && (
                <Tag color="green" icon={<FileTextOutlined />}>
                  已采集
                </Tag>
              )}
              {article.ai_denoised && (
                <Tag color="purple" icon={<RobotOutlined />}>
                  AI去噪
                </Tag>
              )}
              {article.ai_rewritten && (
                <Tag color="magenta" icon={<EditOutlined />}>
                  AI重写
                </Tag>
              )}
              {!article.is_crawled && (
                <Tag color="orange">未采集</Tag>
              )}
            </Space>
          </div>

          {/* 右侧按钮组 */}
          <Space direction="vertical" size="middle" align="end" style={{ minWidth: 'fit-content' }}>
            {/* 操作按钮 */}
            <Space wrap>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadArticleDetail}
                loading={loading}
              >
                刷新
              </Button>
              <Button
                icon={<LinkOutlined />}
                onClick={handleExternalLink}
                disabled={!article.url}
              >
                查看原文
              </Button>
            </Space>

            {/* AI处理按钮 */}
            {article.is_crawled && (
              <Space wrap>
                <Button
                  type={article.ai_denoised ? "default" : "primary"}
                  icon={article.ai_denoised ? <ExperimentOutlined /> : <ClockCircleOutlined />}
                  onClick={() => handleDenoise(article.ai_denoised)}
                  loading={denoiseLoading}
                  title={article.ai_denoised ? "重新进行AI去噪" : "开始AI去噪处理"}
                >
                  {article.ai_denoised ? "重新去噪" : "AI去噪"}
                </Button>
                <Button
                  type={contents.markdown_rewritten ? "default" : "primary"}
                  icon={contents.markdown_rewritten ? <SyncOutlined /> : <EditOutlined />}
                  onClick={() => handleRewrite(!!contents.markdown_rewritten)}
                  loading={rewriteLoading}
                  title={contents.markdown_rewritten ? "重新进行AI重写" : "开始AI重写处理"}
                  style={{ 
                    background: contents.markdown_rewritten ? undefined : '#722ed1',
                    borderColor: contents.markdown_rewritten ? undefined : '#722ed1',
                  }}
                >
                  {contents.markdown_rewritten ? "重新重写" : "AI重写"}
                </Button>
              </Space>
            )}
          </Space>
        </div>
      </Card>

      {/* 文章内容 */}
      {article.is_crawled ? (
        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            tabBarExtraContent={
              contentLoading ? (
                <Spin size="small" />
              ) : (
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  onClick={loadAllContents}
                  size="small"
                >
                  刷新内容
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <FileTextOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
            <Title level={4} type="secondary">文章内容未采集</Title>
            <Text type="secondary">该文章尚未采集内容，无法查看详细信息</Text>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ArticleDetail;
