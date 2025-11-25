/**
 * 账号管理 API 服务
 */
import accountHttp from '@/utils/account-http';
import { ACCOUNT_API_ENDPOINTS } from '@/constants/account-api';
import type {
    Account,
    AccountQuery,
    UpdateAccountRequest,
    HealthCheckRequest,
    BatchHealthCheckRequest,
    AccountStats,
} from '@/types/account';

interface BaseResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
}

interface PaginatedResponse<T = any> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

class AccountService {
    /**
     * 获取账号列表
     */
    async getAccounts(query: AccountQuery = {}): Promise<BaseResponse<PaginatedResponse<Account>>> {
        try {
            const response = await accountHttp.get<BaseResponse<PaginatedResponse<Account>>>(
                ACCOUNT_API_ENDPOINTS.ACCOUNTS,
                query
            );
            return response.data;
        } catch (error) {
            console.error('获取账号列表失败:', error);
            throw error;
        }
    }

    /**
     * 获取账号详情
     */
    async getAccount(accountId: string): Promise<BaseResponse<Account>> {
        try {
            const response = await accountHttp.get<BaseResponse<Account>>(
                ACCOUNT_API_ENDPOINTS.ACCOUNT_DETAIL(accountId)
            );
            return response.data;
        } catch (error) {
            console.error('获取账号详情失败:', error);
            throw error;
        }
    }

    /**
     * 更新账号
     */
    async updateAccount(
        accountId: string,
        data: UpdateAccountRequest
    ): Promise<BaseResponse<void>> {
        try {
            const response = await accountHttp.put<BaseResponse<void>>(
                ACCOUNT_API_ENDPOINTS.ACCOUNT_UPDATE(accountId),
                data
            );
            return response.data;
        } catch (error) {
            console.error('更新账号失败:', error);
            throw error;
        }
    }

    /**
     * 删除账号
     */
    async deleteAccount(accountId: string): Promise<BaseResponse<void>> {
        try {
            const response = await accountHttp.delete<BaseResponse<void>>(
                ACCOUNT_API_ENDPOINTS.ACCOUNT_DELETE(accountId)
            );
            return response.data;
        } catch (error) {
            console.error('删除账号失败:', error);
            throw error;
        }
    }

    /**
     * 健康检查
     */
    async healthCheck(
        accountId: string,
        request: HealthCheckRequest = {}
    ): Promise<BaseResponse<any>> {
        try {
            const response = await accountHttp.post<BaseResponse<any>>(
                ACCOUNT_API_ENDPOINTS.HEALTH_CHECK(accountId),
                request
            );
            return response.data;
        } catch (error) {
            console.error('健康检查失败:', error);
            throw error;
        }
    }

    /**
     * 批量健康检查
     */
    async batchHealthCheck(
        request: BatchHealthCheckRequest
    ): Promise<BaseResponse<any>> {
        try {
            const response = await accountHttp.post<BaseResponse<any>>(
                ACCOUNT_API_ENDPOINTS.BATCH_HEALTH_CHECK,
                request
            );
            return response.data;
        } catch (error) {
            console.error('批量健康检查失败:', error);
            throw error;
        }
    }

    /**
     * 获取账号统计
     */
    async getStats(): Promise<BaseResponse<AccountStats>> {
        try {
            const response = await accountHttp.get<BaseResponse<AccountStats>>(
                ACCOUNT_API_ENDPOINTS.ACCOUNT_STATS
            );
            return response.data;
        } catch (error) {
            console.error('获取账号统计失败:', error);
            throw error;
        }
    }
}

export default new AccountService();
