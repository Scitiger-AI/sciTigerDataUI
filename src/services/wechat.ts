import wechatHttp from '@/utils/wechat-http';
import { WECHAT_API_ENDPOINTS } from '@/constants/wechat-api';
import type {
  WechatAccount,
  WechatAccountListResponse,
  WechatAccountDetailResponse,
  CreateWechatAccountRequest,
  UpdateWechatAccountRequest,
  DeleteWechatAccountResponse,
  WechatAccountQuery,
} from '@/types/wechat';

class WechatService {
  /**
   * 获取公众号列表
   */
  async getAccounts(query: WechatAccountQuery = {}): Promise<WechatAccountListResponse> {
    try {
      const response = await wechatHttp.get<WechatAccountListResponse>(
        WECHAT_API_ENDPOINTS.ACCOUNTS,
        query
      );
      return response.data;
    } catch (error) {
      console.error('获取公众号列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取公众号详情
   */
  async getAccountDetail(accountId: string): Promise<WechatAccountDetailResponse> {
    try {
      const response = await wechatHttp.get<WechatAccountDetailResponse>(
        WECHAT_API_ENDPOINTS.ACCOUNT_DETAIL(accountId)
      );
      return response.data;
    } catch (error) {
      console.error('获取公众号详情失败:', error);
      throw error;
    }
  }

  /**
   * 创建公众号
   */
  async createAccount(data: CreateWechatAccountRequest): Promise<WechatAccountDetailResponse> {
    try {
      const response = await wechatHttp.post<WechatAccountDetailResponse>(
        WECHAT_API_ENDPOINTS.ACCOUNT_CREATE,
        data
      );
      return response.data;
    } catch (error) {
      console.error('创建公众号失败:', error);
      throw error;
    }
  }

  /**
   * 更新公众号
   */
  async updateAccount(
    accountId: string, 
    data: UpdateWechatAccountRequest
  ): Promise<WechatAccountDetailResponse> {
    try {
      const response = await wechatHttp.put<WechatAccountDetailResponse>(
        WECHAT_API_ENDPOINTS.ACCOUNT_UPDATE(accountId),
        data
      );
      return response.data;
    } catch (error) {
      console.error('更新公众号失败:', error);
      throw error;
    }
  }

  /**
   * 删除公众号
   */
  async deleteAccount(accountId: string): Promise<DeleteWechatAccountResponse> {
    try {
      const response = await wechatHttp.delete<DeleteWechatAccountResponse>(
        WECHAT_API_ENDPOINTS.ACCOUNT_DELETE(accountId)
      );
      return response.data;
    } catch (error) {
      console.error('删除公众号失败:', error);
      throw error;
    }
  }

  /**
   * 搜索公众号
   */
  async searchAccounts(
    keyword: string,
    options: Omit<WechatAccountQuery, 'keyword'> = {}
  ): Promise<WechatAccountListResponse> {
    try {
      const query: WechatAccountQuery = {
        keyword,
        ...options,
      };
      return this.getAccounts(query);
    } catch (error) {
      console.error('搜索公众号失败:', error);
      throw error;
    }
  }

  /**
   * 按认证状态筛选公众号
   */
  async getAccountsByVerifyStatus(
    verifyStatus: 'verified' | 'unverified',
    options: Omit<WechatAccountQuery, 'verify_status'> = {}
  ): Promise<WechatAccountListResponse> {
    try {
      const query: WechatAccountQuery = {
        verify_status: verifyStatus,
        ...options,
      };
      return this.getAccounts(query);
    } catch (error) {
      console.error('按认证状态筛选公众号失败:', error);
      throw error;
    }
  }
}

// 创建服务实例
export const wechatService = new WechatService();
export default wechatService;
