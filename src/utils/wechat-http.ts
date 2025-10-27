import { WECHAT_CLIENT_CONFIG } from '@/constants/wechat-api';
import { getAccessToken } from '@/utils/storage';

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
 * 客户端微信HTTP客户端
 * 通过Next.js API路由代理访问微信API
 * 使用JWT Token进行身份验证
 */
class WechatHttpClient {
  private baseURL: string;

  constructor() {
    this.baseURL = WECHAT_CLIENT_CONFIG.BASE_URL;
  }

  private getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // 添加JWT Token到请求头
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    // 构建基础URL路径
    let url = `${this.baseURL}${endpoint}`;
    
    // 添加查询参数
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
        // 提取详细错误信息
        let errorMessage = `HTTP Error: ${response.status} - ${response.statusText}`;
        let errorDetail = null;
        
        // 尝试从响应体中提取详细错误信息
        if (data && typeof data === 'object') {
          // 优先使用 detail 字段（FastAPI 标准错误格式）
          if ('detail' in data) {
            errorDetail = (data as any).detail;
            errorMessage = typeof errorDetail === 'string' 
              ? errorDetail 
              : errorMessage;
          }
          // 其次使用 message 字段
          else if ('message' in data) {
            errorDetail = (data as any).message;
            errorMessage = typeof errorDetail === 'string' 
              ? errorDetail 
              : errorMessage;
          }
        }
        
        // 创建包含详细信息的错误对象
        const error: any = new Error(errorMessage);
        error.status = response.status;
        error.statusText = response.statusText;
        error.detail = errorDetail;
        error.data = data;
        
        throw error;
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      console.error('Wechat API Proxy request failed:', error);
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
export const wechatHttp = new WechatHttpClient();
export default wechatHttp;
