import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 扩展 dayjs 以支持 UTC 和时区转换
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * 格式化UTC时间为本地时区显示
 * @param timeStr UTC时间字符串 (ISO格式)
 * @param format 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的本地时间字符串
 */
export const formatUTCToLocal = (timeStr?: string | null, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  if (!timeStr) return '-';
  
  try {
    // 使用 dayjs.utc() 解析UTC时间，然后转换为本地时区
    return dayjs.utc(timeStr).local().format(format);
  } catch (error) {
    console.warn('时间格式化失败:', error);
    return '时间格式错误';
  }
};

/**
 * 格式化本地时间为UTC时间字符串
 * @param localTime 本地时间 (dayjs对象或时间字符串)
 * @returns UTC时间的ISO字符串
 */
export const formatLocalToUTC = (localTime: any): string => {
  if (!localTime) return '';
  
  try {
    // 如果是 dayjs 对象，直接转换为 ISO 字符串
    if (localTime && typeof localTime.toISOString === 'function') {
      return localTime.toISOString();
    }
    
    // 如果是字符串，先解析为 dayjs 对象再转换
    return dayjs(localTime).toISOString();
  } catch (error) {
    console.warn('时间转换失败:', error);
    return '';
  }
};

/**
 * 获取当前本地时间
 * @param format 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的当前本地时间
 */
export const getCurrentLocalTime = (format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  return dayjs().format(format);
};

/**
 * 获取当前UTC时间
 * @returns UTC时间的ISO字符串
 */
export const getCurrentUTCTime = (): string => {
  return dayjs().utc().toISOString();
};

/**
 * 检查时间字符串是否有效
 * @param timeStr 时间字符串
 * @returns 是否为有效时间
 */
export const isValidTime = (timeStr?: string | null): boolean => {
  if (!timeStr) return false;
  
  try {
    const parsed = dayjs(timeStr);
    return parsed.isValid();
  } catch {
    return false;
  }
};

/**
 * 计算两个时间之间的差值
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @param unit 单位 ('millisecond', 'second', 'minute', 'hour', 'day')
 * @returns 时间差值
 */
export const getTimeDiff = (
  startTime: string | dayjs.Dayjs, 
  endTime: string | dayjs.Dayjs, 
  unit: dayjs.ManipulateType = 'millisecond'
): number => {
  const start = dayjs(startTime);
  const end = dayjs(endTime);
  return end.diff(start, unit);
};

/**
 * 格式化相对时间 (如: 2小时前, 3天前)
 * @param timeStr 时间字符串
 * @returns 相对时间描述
 */
export const formatRelativeTime = (timeStr?: string | null): string => {
  if (!timeStr) return '-';
  
  try {
    const time = dayjs.utc(timeStr).local();
    const now = dayjs();
    const diffInMinutes = now.diff(time, 'minute');
    
    if (diffInMinutes < 1) {
      return '刚刚';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}分钟前`;
    } else if (diffInMinutes < 1440) { // 24小时
      return `${Math.floor(diffInMinutes / 60)}小时前`;
    } else if (diffInMinutes < 10080) { // 7天
      return `${Math.floor(diffInMinutes / 1440)}天前`;
    } else {
      // 超过7天显示具体日期
      return time.format('YYYY-MM-DD');
    }
  } catch (error) {
    console.warn('相对时间格式化失败:', error);
    return '时间格式错误';
  }
};
