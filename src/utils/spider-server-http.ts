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
 * SciTigerSpider 服务端HTTP客户端
 * 用于在Next.js API路由中调用真实的后端API
 * 仅在服务端使用，自动携带 API KEY
 */
class SpiderServerHttpClient {
    private baseURL: string;
    private apiKey: string;

    constructor() {
        // 优先使用新的环境变量，回退到旧的配置以保持兼容（虽然我们已经改了env，但为了稳健性）
        this.baseURL = process.env.SCITIGER_SPIDER_API_BASE_URL || 'http://127.0.0.1:8010';
        this.apiKey = process.env.SCITIGER_SPIDER_API_KEY || '';

        if (!this.apiKey) {
            console.warn('SCITIGER_SPIDER_API_KEY environment variable is missing');
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
            // 确保 endpoint 以 / 开头
            const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

            // 使用URL对象处理完整URL和查询参数
            const url = new URL(`${this.baseURL}${normalizedEndpoint}`);

            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        url.searchParams.append(key, String(value));
                    }
                });
            }

            return url.toString();
        } catch (error) {
            console.error('URL construction failed:', error);
            const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
            let url = `${this.baseURL}${normalizedEndpoint}`;

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
                // 尝试从响应体中获取错误信息
                const errorMessage = (data as any)?.detail || (data as any)?.message || response.statusText;
                throw new Error(`HTTP Error: ${response.status} - ${errorMessage}`);
            }

            return {
                data,
                status: response.status,
                statusText: response.statusText,
            };
        } catch (error) {
            console.error(`Spider Server API request failed (${method} ${endpoint}):`, error);
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
export const spiderServerHttp = new SpiderServerHttpClient();
export default spiderServerHttp;
