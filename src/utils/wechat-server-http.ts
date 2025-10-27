import { WECHAT_API_CONFIG } from '@/constants/wechat-api';

interface HttpRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
}

interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

/**
 * 服务端微信HTTP客户端
 * 用于在Next.js API路由中调用真实的微信API
 * 仅在服务端使用，携带真实的API KEY
 */
class WechatServerHttpClient {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = WECHAT_API_CONFIG.BASE_URL;
    this.apiKey = WECHAT_API_CONFIG.API_KEY;
    
    if (!this.apiKey) {
      throw new Error('WECHAT_API_KEY environment variable is required');
    }
  }

  private getDefaultHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Api-Key': this.apiKey,
    };
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    try {
      // 使用URL对象处理完整URL和查询参数
      const url = new URL(`${this.baseURL}${endpoint}`);
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }
      
      return url.toString();
    } catch (error) {
      // 如果URL构造失败，记录错误并回退到字符串拼接
      console.error('URL construction failed:', error);
      let url = `${this.baseURL}${endpoint}`;
      
      if (params && Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        
        const queryString = searchParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }
      
      return url;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: HttpRequestOptions = {}
  ): Promise<HttpResponse<T>> {
    const { method = 'GET', headers = {}, body, params } = options;

    const url = this.buildURL(endpoint, params);
    const requestHeaders = {
      ...this.getDefaultHeaders(),
      ...headers,
    };

    const config: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);
      
      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as any;
      }

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      console.error('Wechat Server API request failed:', error);
      throw error;
    }
  }

  // GET 请求
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET', params });
  }

  // POST 请求
  async post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'POST', body, headers });
  }

  // PUT 请求
  async put<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'PUT', body, headers });
  }

  // DELETE 请求
  async delete<T>(endpoint: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE', params, headers });
  }

  // PATCH 请求
  async patch<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'PATCH', body, headers });
  }
}

// 创建全局实例
export const wechatServerHttp = new WechatServerHttpClient();
export default wechatServerHttp;
