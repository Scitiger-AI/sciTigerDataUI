/**
 * 账号管理相关类型定义
 */

// 账号状态
export type AccountStatus = 'active' | 'cooling' | 'banned';

// 平台类型
export type PlatformType = 'douyin' | 'xhs' | 'bilibili' | 'weibo' | 'zhihu' | 'kuaishou' | 'tieba';

// 账号信息
export interface Account {
    account_id: string;
    platform: PlatformType;
    username?: string;
    status: AccountStatus;
    priority?: number;
    max_requests_per_day?: number;
    today_requests?: number;
    total_requests?: number;
    last_used_at?: string;
    cooling_until?: string;
    user_data_dir?: string;
    remark?: string;
    created_at?: string;
    updated_at?: string;
}

// 账号查询参数
export interface AccountQuery {
    platform?: PlatformType;
    status?: AccountStatus;
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

// 更新账号请求
export interface UpdateAccountRequest {
    status?: AccountStatus;
    max_requests_per_day?: number;
    cooling_time?: number;
    priority?: number;
    remark?: string;
}

// 健康检查请求
export interface HealthCheckRequest {
    auto_update?: boolean;
    timeout?: number;
}

// 批量健康检查请求
export interface BatchHealthCheckRequest {
    account_ids?: string[];
    platform?: PlatformType;
    status?: AccountStatus;
    max_concurrent?: number;
    timeout?: number;
    auto_update?: boolean;
}

// 账号统计
export interface AccountStats {
    total: number;
    by_platform: Record<string, {
        total: number;
        active: number;
        cooling: number;
        banned: number;
    }>;
    by_status: {
        active: number;
        cooling: number;
        banned: number;
    };
}

// 平台配置
export const PLATFORM_CONFIG: Record<PlatformType, {
    label: string;
    color: string;
    icon: string;
}> = {
    douyin: { label: '抖音', color: '#fe2c55', icon: 'PlaySquareOutlined' },
    xhs: { label: '小红书', color: '#ff2442', icon: 'FireOutlined' },
    bilibili: { label: 'B站', color: '#00a1d6', icon: 'YoutubeOutlined' },
    weibo: { label: '微博', color: '#e6162d', icon: 'WeiboOutlined' },
    zhihu: { label: '知乎', color: '#0084ff', icon: 'QuestionCircleOutlined' },
    kuaishou: { label: '快手', color: '#ff6600', icon: 'ThunderboltOutlined' },
    tieba: { label: '贴吧', color: '#2b6edc', icon: 'CommentOutlined' },
};

// 状态配置
export const STATUS_CONFIG: Record<AccountStatus, {
    label: string;
    color: 'success' | 'warning' | 'error';
}> = {
    active: { label: '可用', color: 'success' },
    cooling: { label: '冷却中', color: 'warning' },
    banned: { label: '已封禁', color: 'error' },
};

// 排序选项
export const ACCOUNT_SORT_OPTIONS = [
    { label: '优先级', value: 'priority' },
    { label: '最后使用时间', value: 'last_used_at' },
    { label: '今日请求数', value: 'today_requests' },
    { label: '总请求数', value: 'total_requests' },
    { label: '创建时间', value: 'created_at' },
];

// 排序方向选项
export const ACCOUNT_SORT_ORDER_OPTIONS = [
    { label: '降序', value: 'desc' },
    { label: '升序', value: 'asc' },
];
