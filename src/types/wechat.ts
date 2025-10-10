// 公众号账号类型定义
export interface WechatAccount {
  id: string;
  biz: string | null;
  wx_id: string | null;
  gh_id: string | null;
  nick_name: string;
  name: string | null;                    // 公众号内部名称
  company_name: string | null;
  verify_status: string | null;           // 认证状态，现在是字符串格式
  verify_customer_type: string | null;    // 认证客户类型
  verify_date: string | null;             // 认证日期
  customer_type: string | null;           // 客户类型，现在是字符串格式
  description: string | null;
  reg_time: string | null;                // 注册时间
  reg_time_stamp: number | null;          // 注册时间戳
  registered_country: string | null;      // 注册国家
  is_overseas: number | null;
  service_phone: string | null;           // 服务电话
  last_login_country: string | null;      // 最后登录国家
  last_login_province: string | null;     // 最后登录省份
  auth_3rd_list: any[];                   // 第三方认证列表
  change_info_list: any[];                // 信息变更列表
  owner_name: string | null;              // 所有者名称
  registered_id: string | null;           // 注册ID
  province: string | null;                // 省份
  gender: string | null;                  // 性别
  total_articles: number;
  crawled_articles: number;
  created_at: string;
  updated_at: string;
}

// 公众号列表响应类型
export interface WechatAccountListResponse {
  success: boolean;
  message: string;
  data: {
    items: WechatAccount[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
  error_code: string | null;
}

// 公众号详情响应类型
export interface WechatAccountDetailResponse {
  success: boolean;
  message: string;
  data: WechatAccount;
  error_code: string | null;
}

// 创建公众号请求类型
export interface CreateWechatAccountRequest {
  biz: string;              // 公众号 BIZ 标识符
  nick_name?: string;       // 公众号名称
  description?: string;     // 公众号描述
}

// 更新公众号请求类型
export interface UpdateWechatAccountRequest {
  nick_name?: string;
  description?: string;
}

// 公众号查询参数类型
export interface WechatAccountQuery {
  keyword?: string;
  verify_status?: string;
  customer_type?: string;
  page?: number;
  page_size?: number;
}

// 删除公众号响应类型
export interface DeleteWechatAccountResponse {
  success: boolean;
  message: string;
  data: boolean;
  error_code: string | null;
}

// 公众号API错误响应类型
export interface WechatApiError {
  success: false;
  message: string;
  data: null;
  error_code: string;
  details?: {
    field: string;
    error: string;
  };
}

// 认证状态选项（基于后端实际返回值）
export const VERIFY_STATUS_OPTIONS = [
  { label: '已认证', value: '已认证' },
  { label: '未认证', value: '未认证' },
] as const;

// 客户类型选项（基于后端实际返回值）
export const CUSTOMER_TYPE_OPTIONS = [
  { label: '个人', value: '个人' },
  { label: '媒体', value: '媒体' },
  { label: '企业', value: '企业' },
  { label: '政府', value: '政府' },
  { label: '其他', value: '其他' },
] as const;

// 性别选项
export const GENDER_OPTIONS = [
  { label: '男', value: '男' },
  { label: '女', value: '女' },
] as const;
