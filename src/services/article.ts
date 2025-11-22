import wechatHttp from '@/utils/wechat-http';
import type {
  Article,
  ArticleListResponse,
  ArticleDetailResponse,
  ArticleContentResponse,
  ArticleQuery,
  ArticleContentFormat,
  ArticleContent,
  ArticleDenoiseRequest,
  ArticleDenoiseResponse,
  ArticleRewriteRequest,
  ArticleRewriteResponse,
  ArticleDeleteRequest,
  ArticleDeleteResponse,
  MarkdownToWechatResponse,
  WechatTheme,
  ArticleImagesResponse,
  ArticleVideosResponse,
} from '@/types/article';

class ArticleService {
  /**
   * 搜索文章列表
   */
  async getArticles(query: ArticleQuery = {}): Promise<ArticleListResponse> {
    try {
      const response = await wechatHttp.get<ArticleListResponse>(
        '/articles/',
        query
      );
      return response.data;
    } catch (error) {
      console.error('获取文章列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取文章详情
   */
  async getArticleDetail(articleId: string): Promise<ArticleDetailResponse> {
    try {
      const response = await wechatHttp.get<ArticleDetailResponse>(
        `/articles/${articleId}`
      );
      return response.data;
    } catch (error) {
      console.error('获取文章详情失败:', error);
      throw error;
    }
  }

  /**
   * 获取文章内容
   */
  async getArticleContent(
    articleId: string, 
    format: ArticleContentFormat = 'markdown',
    wechatTheme?: string
  ): Promise<ArticleContent> {
    try {
      const params: any = { format };
      
      // 如果是微信格式，添加主题参数
      if (format === 'wechat_html' && wechatTheme) {
        params.wechat_theme = wechatTheme;
      }
      
      const response = await wechatHttp.get<ArticleContentResponse>(
        `/articles/${articleId}/content`,
        params
      );
      
      // 处理不同格式的响应
      let content: string;
      if (typeof response.data === 'string') {
        // 直接返回文本内容（markdown、html、text等）
        content = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        // 标准API响应格式
        content = (response.data as any).data.content || '';
      } else {
        content = '';
      }

      return {
        content,
        format,
        article_id: articleId,
      };
    } catch (error) {
      console.error('获取文章内容失败:', error);
      throw error;
    }
  }

  /**
   * 根据公众号BIZ获取文章列表
   */
  async getArticlesByAccountBiz(
    accountBiz: string,
    options: Omit<ArticleQuery, 'account_biz'> = {}
  ): Promise<ArticleListResponse> {
    try {
      const query: ArticleQuery = {
        account_biz: accountBiz,
        ...options,
      };
      return this.getArticles(query);
    } catch (error) {
      console.error('根据公众号BIZ获取文章列表失败:', error);
      throw error;
    }
  }

  /**
   * 根据公众号ID获取文章列表
   */
  async getArticlesByAccountId(
    accountId: string,
    options: Omit<ArticleQuery, 'account_id'> = {}
  ): Promise<ArticleListResponse> {
    try {
      const query: ArticleQuery = {
        account_id: accountId,
        ...options,
      };
      return this.getArticles(query);
    } catch (error) {
      console.error('根据公众号ID获取文章列表失败:', error);
      throw error;
    }
  }

  /**
   * 搜索文章（按关键词）
   */
  async searchArticles(
    keyword: string,
    options: Omit<ArticleQuery, 'keyword'> = {}
  ): Promise<ArticleListResponse> {
    try {
      const query: ArticleQuery = {
        keyword,
        ...options,
      };
      return this.getArticles(query);
    } catch (error) {
      console.error('搜索文章失败:', error);
      throw error;
    }
  }

  /**
   * 获取已爬取的文章
   */
  async getCrawledArticles(
    options: Omit<ArticleQuery, 'is_crawled'> = {}
  ): Promise<ArticleListResponse> {
    try {
      const query: ArticleQuery = {
        is_crawled: true,
        ...options,
      };
      return this.getArticles(query);
    } catch (error) {
      console.error('获取已爬取文章失败:', error);
      throw error;
    }
  }

  /**
   * 按日期范围获取文章
   */
  async getArticlesByDateRange(
    startDate: string,
    endDate: string,
    options: Omit<ArticleQuery, 'start_date' | 'end_date'> = {}
  ): Promise<ArticleListResponse> {
    try {
      const query: ArticleQuery = {
        start_date: startDate,
        end_date: endDate,
        ...options,
      };
      return this.getArticles(query);
    } catch (error) {
      console.error('按日期范围获取文章失败:', error);
      throw error;
    }
  }

  /**
   * 获取多种格式的文章内容
   */
  async getArticleContents(
    articleId: string,
    formats: ArticleContentFormat[] = ['markdown', 'html', 'text']
  ): Promise<Record<ArticleContentFormat, string>> {
    try {
      const promises = formats.map(async (format) => {
        const content = await this.getArticleContent(articleId, format);
        return { format, content: content.content };
      });

      const results = await Promise.all(promises);
      
      return results.reduce((acc, { format, content }) => {
        acc[format] = content;
        return acc;
      }, {} as Record<ArticleContentFormat, string>);
    } catch (error) {
      console.error('获取多种格式文章内容失败:', error);
      throw error;
    }
  }

  /**
   * 对文章进行AI去噪处理
   */
  async denoiseArticle(
    articleId: string,
    options: ArticleDenoiseRequest = {}
  ): Promise<ArticleDenoiseResponse> {
    try {
      const { force_reprocess = false, save_to_file = true } = options;
      
      const response = await wechatHttp.post<ArticleDenoiseResponse>(
        `/articles/${articleId}/denoise`,
        {
          force_reprocess,
          save_to_file,
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('AI去噪失败:', error);
      throw error;
    }
  }

  /**
   * 对文章进行AI重写处理
   */
  async rewriteArticle(
    articleId: string,
    options: ArticleRewriteRequest = {}
  ): Promise<ArticleRewriteResponse> {
    try {
      const { 
        force_reprocess = false, 
        save_to_file = true,
        auto_denoise = true 
      } = options;
      
      const response = await wechatHttp.post<ArticleRewriteResponse>(
        `/articles/${articleId}/rewrite`,
        {
          force_reprocess,
          save_to_file,
          auto_denoise,
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('AI重写失败:', error);
      throw error;
    }
  }

  /**
   * 删除文章
   */
  async deleteArticle(
    articleId: string,
    options: ArticleDeleteRequest = {}
  ): Promise<ArticleDeleteResponse> {
    try {
      const { 
        delete_files = true, 
        force_delete = false 
      } = options;
      
      // 构建查询参数对象
      const queryParams = {
        delete_files: String(delete_files),
        force_delete: String(force_delete),
      };
      
      const response = await wechatHttp.delete<ArticleDeleteResponse>(
        `/articles/${articleId}`,
        queryParams
      );
      
      return response.data;
    } catch (error) {
      console.error('删除文章失败:', error);
      throw error;
    }
  }

  /**
   * Markdown 转微信格式 HTML
   */
  async convertMarkdownToWechat(
    markdownContent: string,
    theme: ArticleContentFormat extends 'wechat_html' ? WechatTheme : WechatTheme = 'default'
  ): Promise<MarkdownToWechatResponse> {
    try {
      const response = await wechatHttp.post<MarkdownToWechatResponse>(
        '/articles/convert/markdown-to-wechat',
        {
          markdown_content: markdownContent,
          theme,
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Markdown转微信格式失败:', error);
      throw error;
    }
  }

  /**
   * 获取文章图片列表
   */
  async getArticleImages(articleId: string): Promise<ArticleImagesResponse> {
    try {
      const response = await wechatHttp.get<ArticleImagesResponse>(
        `/articles/${articleId}/images`
      );
      return response.data;
    } catch (error) {
      console.error('获取文章图片列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取文章视频列表
   */
  async getArticleVideos(articleId: string): Promise<ArticleVideosResponse> {
    try {
      const response = await wechatHttp.get<ArticleVideosResponse>(
        `/articles/${articleId}/videos`
      );
      return response.data;
    } catch (error) {
      console.error('获取文章视频列表失败:', error);
      throw error;
    }
  }
}

// 创建服务实例
export const articleService = new ArticleService();
export default articleService;
