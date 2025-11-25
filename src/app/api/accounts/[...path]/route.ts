import { NextRequest, NextResponse } from 'next/server';
import spiderServerHttp from '@/utils/spider-server-http';

/**
 * 账号管理 API 代理路由
 * 将前端请求代理到 sciTigerSpider 后端
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
        const apiPath = `/api/v1/${path}`;

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
        console.error('Account API proxy error:', error);
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
