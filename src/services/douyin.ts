import douyinHttp from '@/utils/douyin-http';
import { DOUYIN_API_ENDPOINTS } from '@/constants/douyin-api';
import type {
  DouyinVideo,
  DouyinComment,
  DouyinCreator,
  DouyinTask,
  BaseResponse,
  PaginatedResponse,
  DouyinVideoQuery,
  DouyinCreatorQuery,
  DouyinCommentQuery,
  DouyinTaskQuery,
  CreateDouyinSearchTaskRequest,
  CreateDouyinDetailTaskRequest,
  CreateDouyinCreatorTaskRequest,
  CreateDouyinCreatorAccountRequest,
} from '@/types/douyin';

class DouyinService {
  // ============ 视频相关 ============

  /**
   * 获取视频列表
   */
  async getVideos(query: DouyinVideoQuery = {}): Promise<BaseResponse<PaginatedResponse<DouyinVideo>>> {
    try {
      const response = await douyinHttp.get<BaseResponse<PaginatedResponse<DouyinVideo>>>(
        DOUYIN_API_ENDPOINTS.VIDEOS,
        query
      );
      return response.data;
    } catch (error) {
      console.error('获取视频列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取视频详情
   */
  async getVideoDetail(awemeId: string): Promise<BaseResponse<DouyinVideo>> {
    try {
      const response = await douyinHttp.get<BaseResponse<DouyinVideo>>(
        DOUYIN_API_ENDPOINTS.VIDEO_DETAIL(awemeId)
      );
      return response.data;
    } catch (error) {
      console.error('获取视频详情失败:', error);
      throw error;
    }
  }

  /**
   * 获取视频评论
   */
  async getVideoComments(query: DouyinCommentQuery): Promise<BaseResponse<PaginatedResponse<DouyinComment>>> {
    try {
      const { aweme_id, ...params } = query;
      const response = await douyinHttp.get<BaseResponse<PaginatedResponse<DouyinComment>>>(
        DOUYIN_API_ENDPOINTS.VIDEO_COMMENTS(aweme_id),
        params
      );
      return response.data;
    } catch (error) {
      console.error('获取视频评论失败:', error);
      throw error;
    }
  }

  /**
   * 删除视频
   */
  async deleteVideo(
    awemeId: string,
    options: {
      delete_comments?: boolean;
      delete_files?: boolean;
    } = {}
  ): Promise<BaseResponse<{
    aweme_id: string;
    deleted_comments_count: number;
    comments_deleted: boolean;
    deleted_files_count: number;
    failed_files: Array<{ path: string; error: string }>;
    files_deleted: boolean;
  }>> {
    try {
      const params: Record<string, any> = {};
      if (options.delete_comments !== undefined) {
        params.delete_comments = options.delete_comments;
      }
      if (options.delete_files !== undefined) {
        params.delete_files = options.delete_files;
      }
      
      const response = await douyinHttp.delete<BaseResponse<{
        aweme_id: string;
        deleted_comments_count: number;
        comments_deleted: boolean;
        deleted_files_count: number;
        failed_files: Array<{ path: string; error: string }>;
        files_deleted: boolean;
      }>>(
        DOUYIN_API_ENDPOINTS.VIDEO_DELETE(awemeId),
        params
      );
      return response.data;
    } catch (error) {
      console.error('删除视频失败:', error);
      throw error;
    }
  }

  // ============ 创作者相关 ============

  /**
   * 获取创作者列表
   */
  async getCreators(query: DouyinCreatorQuery = {}): Promise<BaseResponse<PaginatedResponse<DouyinCreator>>> {
    try {
      const response = await douyinHttp.get<BaseResponse<PaginatedResponse<DouyinCreator>>>(
        DOUYIN_API_ENDPOINTS.CREATORS,
        query
      );
      return response.data;
    } catch (error) {
      console.error('获取创作者列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取创作者详情
   */
  async getCreatorDetail(userId: string): Promise<BaseResponse<DouyinCreator>> {
    try {
      const response = await douyinHttp.get<BaseResponse<DouyinCreator>>(
        DOUYIN_API_ENDPOINTS.CREATOR_DETAIL(userId)
      );
      return response.data;
    } catch (error) {
      console.error('获取创作者详情失败:', error);
      throw error;
    }
  }

  /**
   * 创建/导入创作者账号（快速导入，不是采集任务）
   */
  async createCreator(data: CreateDouyinCreatorAccountRequest): Promise<BaseResponse<DouyinCreator>> {
    try {
      const response = await douyinHttp.post<BaseResponse<DouyinCreator>>(
        DOUYIN_API_ENDPOINTS.CREATOR_CREATE,
        data
      );
      return response.data;
    } catch (error) {
      console.error('创建创作者失败:', error);
      throw error;
    }
  }

  /**
   * 删除创作者
   */
  async deleteCreator(
    userId: string,
    options: {
      delete_videos?: boolean;
    } = {}
  ): Promise<BaseResponse<{
    user_id: string;
    deleted_videos_count: number;
    deleted_comments_count: number;
    deleted_files_count: number;
    failed_files: Array<{ path: string; error: string }>;
    videos_deleted: boolean;
  }>> {
    try {
      const params: Record<string, any> = {};
      if (options.delete_videos !== undefined) {
        params.delete_videos = options.delete_videos;
      }
      
      const response = await douyinHttp.delete<BaseResponse<{
        user_id: string;
        deleted_videos_count: number;
        deleted_comments_count: number;
        deleted_files_count: number;
        failed_files: Array<{ path: string; error: string }>;
        videos_deleted: boolean;
      }>>(
        DOUYIN_API_ENDPOINTS.CREATOR_DELETE(userId),
        params
      );
      return response.data;
    } catch (error) {
      console.error('删除创作者失败:', error);
      throw error;
    }
  }

  // ============ 任务相关 ============

  /**
   * 创建搜索任务
   */
  async createSearchTask(data: CreateDouyinSearchTaskRequest): Promise<BaseResponse<DouyinTask>> {
    try {
      const response = await douyinHttp.post<BaseResponse<DouyinTask>>(
        DOUYIN_API_ENDPOINTS.TASKS,
        data
      );
      return response.data;
    } catch (error) {
      console.error('创建搜索任务失败:', error);
      throw error;
    }
  }

  /**
   * 创建详情任务
   */
  async createDetailTask(data: CreateDouyinDetailTaskRequest): Promise<BaseResponse<DouyinTask>> {
    try {
      const response = await douyinHttp.post<BaseResponse<DouyinTask>>(
        DOUYIN_API_ENDPOINTS.TASKS,
        data
      );
      return response.data;
    } catch (error) {
      console.error('创建详情任务失败:', error);
      throw error;
    }
  }

  /**
   * 创建创作者任务
   */
  async createCreatorTask(data: CreateDouyinCreatorTaskRequest): Promise<BaseResponse<DouyinTask>> {
    try {
      const response = await douyinHttp.post<BaseResponse<DouyinTask>>(
        DOUYIN_API_ENDPOINTS.TASKS,
        data
      );
      return response.data;
    } catch (error) {
      console.error('创建创作者任务失败:', error);
      throw error;
    }
  }

  /**
   * 获取任务列表
   */
  async getTasks(query: DouyinTaskQuery = {}): Promise<BaseResponse<PaginatedResponse<DouyinTask>>> {
    try {
      const response = await douyinHttp.get<BaseResponse<PaginatedResponse<DouyinTask>>>(
        DOUYIN_API_ENDPOINTS.TASKS,
        query
      );
      return response.data;
    } catch (error) {
      console.error('获取任务列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取任务详情
   */
  async getTaskDetail(taskId: string): Promise<BaseResponse<DouyinTask>> {
    try {
      const response = await douyinHttp.get<BaseResponse<DouyinTask>>(
        DOUYIN_API_ENDPOINTS.TASK_DETAIL(taskId)
      );
      return response.data;
    } catch (error) {
      console.error('获取任务详情失败:', error);
      throw error;
    }
  }

  /**
   * 获取任务结果
   */
  async getTaskResults(
    taskId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<BaseResponse<PaginatedResponse<DouyinVideo>>> {
    try {
      const response = await douyinHttp.get<BaseResponse<PaginatedResponse<DouyinVideo>>>(
        DOUYIN_API_ENDPOINTS.TASK_RESULTS(taskId),
        { page, page_size: pageSize }
      );
      return response.data;
    } catch (error) {
      console.error('获取任务结果失败:', error);
      throw error;
    }
  }

  /**
   * 删除任务
   */
  async deleteTask(
    taskId: string,
    options: {
      delete_results?: boolean;
    } = {}
  ): Promise<BaseResponse<{
    task_id: string;
    task_deleted_via_api: boolean;
    api_error: string | null;
    deleted_videos_count: number;
    deleted_comments_count: number;
    results_deleted: boolean;
  }>> {
    try {
      const params: Record<string, any> = {};
      if (options.delete_results !== undefined) {
        params.delete_results = options.delete_results;
      }
      
      const response = await douyinHttp.delete<BaseResponse<{
        task_id: string;
        task_deleted_via_api: boolean;
        api_error: string | null;
        deleted_videos_count: number;
        deleted_comments_count: number;
        results_deleted: boolean;
      }>>(
        DOUYIN_API_ENDPOINTS.TASK_DELETE(taskId),
        params
      );
      return response.data;
    } catch (error) {
      console.error('删除任务失败:', error);
      throw error;
    }
  }

  // ============ AI 功能（预留）============

  /**
   * AI提取视频文案（预留）
   */
  async extractVideoScript(awemeId: string, forceReprocess: boolean = false): Promise<BaseResponse<any>> {
    try {
      const response = await douyinHttp.post<BaseResponse<any>>(
        DOUYIN_API_ENDPOINTS.VIDEO_EXTRACT_SCRIPT(awemeId),
        { force_reprocess: forceReprocess }
      );
      return response.data;
    } catch (error) {
      console.error('提取视频文案失败:', error);
      throw error;
    }
  }

  /**
   * AI去噪视频内容（预留）
   */
  async denoiseVideo(awemeId: string, forceReprocess: boolean = false): Promise<BaseResponse<any>> {
    try {
      const response = await douyinHttp.post<BaseResponse<any>>(
        DOUYIN_API_ENDPOINTS.VIDEO_DENOISE(awemeId),
        { force_reprocess: forceReprocess }
      );
      return response.data;
    } catch (error) {
      console.error('去噪视频内容失败:', error);
      throw error;
    }
  }

  /**
   * AI重写视频内容（预留）
   */
  async rewriteVideo(awemeId: string, forceReprocess: boolean = false): Promise<BaseResponse<any>> {
    try {
      const response = await douyinHttp.post<BaseResponse<any>>(
        DOUYIN_API_ENDPOINTS.VIDEO_REWRITE(awemeId),
        { force_reprocess: forceReprocess, auto_denoise: true }
      );
      return response.data;
    } catch (error) {
      console.error('重写视频内容失败:', error);
      throw error;
    }
  }
}

// 创建全局实例
const douyinService = new DouyinService();
export default douyinService;
