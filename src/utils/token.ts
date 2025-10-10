"use client";

/**
 * Token验证工具函数
 * 用于验证JWT token的有效性、解码和过期检查
 */

/**
 * 解码JWT token（不验证签名）
 * @param token JWT token
 * @returns 解码后的payload或null
 */
export const decodeToken = (token: string): any | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('⚠️ Token格式不正确，应该包含3个部分');
      return null;
    }
    
    const payload = parts[1];
    // 使用atob进行base64解码（浏览器环境）
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('❌ 解码token失败:', error);
    return null;
  }
};

/**
 * 检查token是否过期
 * @param token JWT token
 * @returns true表示已过期，false表示未过期
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    console.warn('⚠️ Token无法解码或缺少过期时间，视为已过期');
    return true; // 无法解码或没有过期时间，视为已过期
  }
  
  // exp是以秒为单位的Unix时间戳
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  
  // 提前5分钟判定为过期，给token刷新留出时间
  const bufferTime = 5 * 60 * 1000; // 5分钟
  
  const isExpired = currentTime >= (expirationTime - bufferTime);
  
  if (isExpired) {
    const expiredDate = new Date(expirationTime);
    console.log('⏰ Token已过期或即将过期:', {
      过期时间: expiredDate.toLocaleString(),
      当前时间: new Date(currentTime).toLocaleString(),
      缓冲时间: '5分钟'
    });
  }
  
  return isExpired;
};

/**
 * 验证token是否有效
 * @param token JWT token
 * @returns true表示有效，false表示无效
 */
export const isTokenValid = (token: string | null): boolean => {
  if (!token) {
    console.log('❌ Token不存在');
    return false;
  }
  
  // 检查token格式
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.warn('⚠️ Token格式不正确');
    return false;
  }
  
  // 检查是否过期
  if (isTokenExpired(token)) {
    console.log('⏰ Token已过期');
    return false;
  }
  
  console.log('✅ Token有效');
  return true;
};

/**
 * 获取token的剩余有效时间（秒）
 * @param token JWT token
 * @returns 剩余有效时间（秒），如果token无效则返回0
 */
export const getTokenRemainingTime = (token: string): number => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return 0;
  }
  
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  const remainingTime = Math.max(0, expirationTime - currentTime);
  
  return Math.floor(remainingTime / 1000); // 返回秒数
};

/**
 * 从token中提取用户信息
 * @param token JWT token
 * @returns 用户信息对象或null
 */
export const extractUserInfoFromToken = (token: string): any | null => {
  const decoded = decodeToken(token);
  if (!decoded) {
    return null;
  }
  
  // 通常JWT的payload中会包含用户信息
  // 根据实际后端返回的token结构调整
  return {
    userId: decoded.user_id || decoded.sub,
    username: decoded.username,
    email: decoded.email,
    exp: decoded.exp,
    iat: decoded.iat,
  };
};
