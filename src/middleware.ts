import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { STORAGE_KEYS } from '@/constants/api';

/**
 * 简单的JWT解码函数（服务端环境）
 * @param token JWT token
 * @returns 解码后的payload或null
 */
function decodeToken(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const payload = parts[1];
    // 在Node.js环境中使用Buffer进行base64解码
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    return decoded;
  } catch (error) {
    console.error('中间件解码token失败:', error);
    return null;
  }
}

/**
 * 检查token是否过期
 * @param token JWT token
 * @returns true表示已过期，false表示未过期
 */
function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true; // 无法解码或没有过期时间，视为已过期
  }
  
  // exp是以秒为单位的Unix时间戳
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  
  // 直接检查是否过期，不添加缓冲时间（缓冲时间在客户端处理）
  return currentTime >= expirationTime;
}

// 不需要登录就能访问的路径
const publicPaths = [
  '/privacy',
  '/activate',
  '/terms',
  '/login',
  '/register',
  '/forgot-password',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 检查标准键名和STORAGE_KEYS中定义的键名
  const token = request.cookies.get(STORAGE_KEYS.ACCESS_TOKEN)?.value;
  
  // 增强的认证检查：不仅检查token存在，还要检查是否过期
  let isAuthenticated = false;
  let shouldClearCookies = false;
  
  if (token) {
    // 检查token是否过期
    if (isTokenExpired(token)) {
      console.log('⚠️ 中间件检测到过期token，将清除cookie');
      shouldClearCookies = true;
      isAuthenticated = false;
    } else {
      console.log('✅ 中间件验证token有效');
      isAuthenticated = true;
    }
  }

  // 检查是否是公开的路径
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  // 任何不在公开路径列表中的路径都被视为受保护的路径
  const isProtectedPath = !isPublicPath;

  // 如果token过期，清除所有认证相关的cookies
  if (shouldClearCookies) {
    const response = isProtectedPath 
      ? NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(pathname)}`, request.url))
      : NextResponse.next();
    
    // 清除所有认证相关的cookies
    response.cookies.delete(STORAGE_KEYS.ACCESS_TOKEN);
    response.cookies.delete(STORAGE_KEYS.REFRESH_TOKEN);
    response.cookies.delete(STORAGE_KEYS.SESSION_ID);
    response.cookies.delete(STORAGE_KEYS.AUTH_SYNC_NEEDED);
    
    console.log('🧹 中间件已清除过期的认证cookies');
    return response;
  }

  // 如果是受保护的路径但未登录，重定向到登录页面
  if (isProtectedPath && !isAuthenticated) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    console.log(`🔒 未认证用户访问受保护路径 ${pathname}，重定向到登录页面`);
    return NextResponse.redirect(url);
  }

  // 只有当用户已登录并尝试访问登录/注册页面时，才重定向到首页
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    console.log(`🔄 已登录用户访问登录页面，重定向到首页`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了:
     * - api 路由
     * - 静态文件
     * - favicon.ico
     * - 服务器端组件资源
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 