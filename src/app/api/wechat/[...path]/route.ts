import { NextRequest, NextResponse } from 'next/server';
import wechatServerHttp from '@/utils/wechat-server-http';

/**
 * 验证JWT Token
 * 从请求头中提取并验证用户的JWT Token
 */
function validateAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7); // 移除 "Bearer " 前缀
  
  // 这里可以添加更严格的JWT验证逻辑
  // 目前简单检查token是否存在
  return token || null;
}

/**
 * 构建微信API的真实路径
 */
function buildWechatApiPath(path: string[]): string {
  return `/${path.join('/')}`;
}

/**
 * 提取查询参数
 */
function extractQueryParams(request: NextRequest): Record<string, any> {
  const params: Record<string, any> = {};
  
  request.nextUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
}

/**
 * 处理GET请求
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // 验证用户身份
    const token = validateAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问', message: '请先登录' },
        { status: 401 }
      );
    }

    // 等待并获取动态路由参数
    const resolvedParams = await params;
    
    // 构建API路径
    const apiPath = buildWechatApiPath(resolvedParams.path);
    const queryParams = extractQueryParams(request);

    // 调用真实的微信API
    const response = await wechatServerHttp.get(apiPath, queryParams);

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('微信API代理请求失败 (GET):', error);
    
    return NextResponse.json(
      { error: '请求失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * 处理POST请求
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // 验证用户身份
    const token = validateAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问', message: '请先登录' },
        { status: 401 }
      );
    }

    // 等待并获取动态路由参数
    const resolvedParams = await params;
    
    // 构建API路径
    const apiPath = buildWechatApiPath(resolvedParams.path);
    
    // 提取请求体
    let body;
    try {
      body = await request.json();
    } catch {
      body = undefined;
    }

    // 调用真实的微信API
    const response = await wechatServerHttp.post(apiPath, body);

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('微信API代理请求失败 (POST):', error);
    
    return NextResponse.json(
      { error: '请求失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * 处理PUT请求
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // 验证用户身份
    const token = validateAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问', message: '请先登录' },
        { status: 401 }
      );
    }

    // 等待并获取动态路由参数
    const resolvedParams = await params;
    
    // 构建API路径
    const apiPath = buildWechatApiPath(resolvedParams.path);
    
    // 提取请求体
    let body;
    try {
      body = await request.json();
    } catch {
      body = undefined;
    }

    // 调用真实的微信API
    const response = await wechatServerHttp.put(apiPath, body);

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('微信API代理请求失败 (PUT):', error);
    
    return NextResponse.json(
      { error: '请求失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * 处理DELETE请求
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // 验证用户身份
    const token = validateAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问', message: '请先登录' },
        { status: 401 }
      );
    }

    // 等待并获取动态路由参数
    const resolvedParams = await params;
    
    // 构建API路径
    const apiPath = buildWechatApiPath(resolvedParams.path);

    // 调用真实的微信API
    const response = await wechatServerHttp.delete(apiPath);

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('微信API代理请求失败 (DELETE):', error);
    
    return NextResponse.json(
      { error: '请求失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * 处理PATCH请求
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // 验证用户身份
    const token = validateAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问', message: '请先登录' },
        { status: 401 }
      );
    }

    // 等待并获取动态路由参数
    const resolvedParams = await params;
    
    // 构建API路径
    const apiPath = buildWechatApiPath(resolvedParams.path);
    
    // 提取请求体
    let body;
    try {
      body = await request.json();
    } catch {
      body = undefined;
    }

    // 调用真实的微信API
    const response = await wechatServerHttp.patch(apiPath, body);

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('微信API代理请求失败 (PATCH):', error);
    
    return NextResponse.json(
      { error: '请求失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
