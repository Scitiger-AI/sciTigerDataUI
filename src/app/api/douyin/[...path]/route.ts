import { NextRequest, NextResponse } from 'next/server';
import spiderServerHttp from '@/utils/spider-server-http';

/**
 * 抖音API代理路由
 * 将前端请求代理到sciTigerSpider后端
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return proxyRequest(request, path, 'GET');
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return proxyRequest(request, path, 'POST');
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return proxyRequest(request, path, 'PUT');
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return proxyRequest(request, path, 'DELETE');
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return proxyRequest(request, path, 'PATCH');
}

async function proxyRequest(
    request: NextRequest,
    pathSegments: string[],
    method: string
) {
    try {
        // 构建目标路径
        const path = pathSegments.join('/');
        const apiPath = `/api/v1/douyin/${path}`;

        // 特殊处理视频代理接口，支持流式传输
        if (path === 'proxy/video' && method === 'GET') {
            const baseUrl = process.env.SCITIGER_SPIDER_API_BASE_URL || 'http://127.0.0.1:8010';
            const targetUrl = new URL(`${baseUrl}${apiPath}`);

            // 复制查询参数
            request.nextUrl.searchParams.forEach((value, key) => {
                targetUrl.searchParams.append(key, value);
            });

            // 准备请求头
            const headers: Record<string, string> = {};

            // 复制 Range 头（关键！）
            const range = request.headers.get('range');
            if (range) {
                headers['Range'] = range;
            }

            // 复制 Auth 头
            const authHeader = request.headers.get('authorization');
            if (authHeader) {
                headers['Authorization'] = authHeader;
            }

            // 发起请求
            const response = await fetch(targetUrl.toString(), {
                method: 'GET',
                headers: headers,
                // @ts-ignore - Next.js 扩展了 fetch，支持 duplex
                duplex: 'half',
            });

            // 准备响应头
            const responseHeaders = new Headers();

            // 转发关键响应头
            const forwardHeaders = [
                'content-type',
                'content-length',
                'content-range',
                'accept-ranges',
                'last-modified',
                'etag'
            ];

            forwardHeaders.forEach(key => {
                const value = response.headers.get(key);
                if (value) {
                    responseHeaders.set(key, value);
                }
            });

            // 返回流式响应
            return new NextResponse(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: responseHeaders,
            });
        }

        // 对于其他接口，继续使用 spiderServerHttp（处理 JSON）
        // 准备请求头
        const headers: Record<string, string> = {};

        // 复制必要的请求头
        const authHeader = request.headers.get('authorization');
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        // 提取查询参数
        const params: Record<string, any> = {};
        request.nextUrl.searchParams.forEach((value, key) => {
            params[key] = value;
        });

        // 提取请求体
        let body;
        if (method !== 'GET' && method !== 'DELETE') {
            try {
                body = await request.json();
            } catch {
                body = undefined;
            }
        }

        // 使用 spiderServerHttp 发送请求
        // 它会自动处理 API Key 和 Base URL
        let response;
        switch (method) {
            case 'GET':
                response = await spiderServerHttp.get(apiPath, params);
                break;
            case 'POST':
                response = await spiderServerHttp.post(apiPath, body, headers, params);
                break;
            case 'PUT':
                response = await spiderServerHttp.put(apiPath, body, headers, params);
                break;
            case 'DELETE':
                response = await spiderServerHttp.delete(apiPath, params, headers);
                break;
            case 'PATCH':
                response = await spiderServerHttp.patch(apiPath, body, headers, params);
                break;
            default:
                throw new Error(`Unsupported method: ${method}`);
        }

        // 返回响应
        return NextResponse.json(response.data, {
            status: response.status,
        });

    } catch (error) {
        console.error('Douyin API proxy error:', error);
        return NextResponse.json(
            {
                success: false,
                message: '代理请求失败',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
