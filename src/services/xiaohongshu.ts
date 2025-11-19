import xhsHttp from '@/utils/xiaohongshu-http';
import { XHS_API_ENDPOINTS } from '@/constants/xiaohongshu-api';
import type {
  XhsNote,
  XhsComment,
  XhsCreator,
  XhsTask,
  BaseResponse,
  PaginatedResponse,
  XhsNoteQuery,
  XhsCreatorQuery,
  XhsCommentQuery,
  XhsTaskQuery,
  CreateXhsSearchTaskRequest,
  CreateXhsDetailTaskRequest,
  CreateXhsCreatorTaskRequest,
} from '@/types/xiaohongshu';

class XiaohongshuService {
  // ============ 笔记相关 ============

  /**
   * 获取笔记列表
   */
  async getNotes(query: XhsNoteQuery = {}): Promise<BaseResponse<PaginatedResponse<XhsNote>>> {
    try {
      const response = await xhsHttp.get<BaseResponse<PaginatedResponse<XhsNote>>>(
        XHS_API_ENDPOINTS.ARTICLES,
        query
      );
      return response.data;
    } catch (error) {
      console.error('获取笔记列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取笔记详情
   */
  async getNoteDetail(noteId: string): Promise<BaseResponse<XhsNote>> {
    try {
      const response = await xhsHttp.get<BaseResponse<XhsNote>>(
        XHS_API_ENDPOINTS.ARTICLE_DETAIL(noteId)
      );
      return response.data;
    } catch (error) {
      console.error('获取笔记详情失败:', error);
      throw error;
    }
  }

  /**
   * 获取笔记评论
   */
  async getNoteComments(query: XhsCommentQuery): Promise<BaseResponse<PaginatedResponse<XhsComment>>> {
    try {
      const { note_id, ...params } = query;
      const response = await xhsHttp.get<BaseResponse<PaginatedResponse<XhsComment>>>(
        XHS_API_ENDPOINTS.ARTICLE_COMMENTS(note_id),
        params
      );
      return response.data;
    } catch (error) {
      console.error('获取笔记评论失败:', error);
      throw error;
    }
  }

  // ============ 创作者相关 ============

  /**
   * 获取创作者列表
   */
  async getCreators(query: XhsCreatorQuery = {}): Promise<BaseResponse<PaginatedResponse<XhsCreator>>> {
    try {
      const response = await xhsHttp.get<BaseResponse<PaginatedResponse<XhsCreator>>>(
        XHS_API_ENDPOINTS.CREATORS,
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
  async getCreatorDetail(userId: string): Promise<BaseResponse<XhsCreator>> {
    try {
      const response = await xhsHttp.get<BaseResponse<XhsCreator>>(
        XHS_API_ENDPOINTS.CREATOR_DETAIL(userId)
      );
      return response.data;
    } catch (error) {
      console.error('获取创作者详情失败:', error);
      throw error;
    }
  }

  /**
   * 创建/导入创作者
   */
  async createCreator(data: CreateXhsCreatorTaskRequest): Promise<BaseResponse<XhsCreator>> {
    try {
      const response = await xhsHttp.post<BaseResponse<XhsCreator>>(
        XHS_API_ENDPOINTS.CREATOR_CREATE,
        data
      );
      return response.data;
    } catch (error) {
      console.error('创建创作者失败:', error);
      throw error;
    }
  }

  // ============ 任务相关 ============

  /**
   * 创建搜索任务
   */
  async createSearchTask(data: CreateXhsSearchTaskRequest): Promise<BaseResponse<XhsTask>> {
    try {
      const response = await xhsHttp.post<BaseResponse<XhsTask>>(
        XHS_API_ENDPOINTS.TASKS,
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
  async createDetailTask(data: CreateXhsDetailTaskRequest): Promise<BaseResponse<XhsTask>> {
    try {
      const response = await xhsHttp.post<BaseResponse<XhsTask>>(
        XHS_API_ENDPOINTS.TASKS,
        data
      );
      return response.data;
    } catch (error) {
      console.error('创建详情任务失败:', error);
      throw error;
    }
  }

  /**
   * 获取任务列表
   */
  async getTasks(query: XhsTaskQuery = {}): Promise<BaseResponse<PaginatedResponse<XhsTask>>> {
    try {
      const response = await xhsHttp.get<BaseResponse<PaginatedResponse<XhsTask>>>(
        XHS_API_ENDPOINTS.TASKS,
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
  async getTaskDetail(taskId: string): Promise<BaseResponse<XhsTask>> {
    try {
      const response = await xhsHttp.get<BaseResponse<XhsTask>>(
        XHS_API_ENDPOINTS.TASK_DETAIL(taskId)
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
  ): Promise<BaseResponse<PaginatedResponse<XhsNote>>> {
    try {
      const response = await xhsHttp.get<BaseResponse<PaginatedResponse<XhsNote>>>(
        XHS_API_ENDPOINTS.TASK_RESULTS(taskId),
        { page, page_size: pageSize }
      );
      return response.data;
    } catch (error) {
      console.error('获取任务结果失败:', error);
      throw error;
    }
  }

  // ============ AI 功能（预留）============

  /**
   * AI提取笔记文案（预留）
   */
  async extractNote(noteId: string, forceReprocess: boolean = false): Promise<BaseResponse<any>> {
    try {
      const response = await xhsHttp.post<BaseResponse<any>>(
        XHS_API_ENDPOINTS.ARTICLE_EXTRACT(noteId),
        { force_reprocess: forceReprocess }
      );
      return response.data;
    } catch (error) {
      console.error('提取笔记文案失败:', error);
      throw error;
    }
  }

  /**
   * AI去噪笔记内容（预留）
   */
  async denoiseNote(noteId: string, forceReprocess: boolean = false): Promise<BaseResponse<any>> {
    try {
      const response = await xhsHttp.post<BaseResponse<any>>(
        XHS_API_ENDPOINTS.ARTICLE_DENOISE(noteId),
        { force_reprocess: forceReprocess }
      );
      return response.data;
    } catch (error) {
      console.error('去噪笔记内容失败:', error);
      throw error;
    }
  }

  /**
   * AI重写笔记内容（预留）
   */
  async rewriteNote(noteId: string, forceReprocess: boolean = false): Promise<BaseResponse<any>> {
    try {
      const response = await xhsHttp.post<BaseResponse<any>>(
        XHS_API_ENDPOINTS.ARTICLE_REWRITE(noteId),
        { force_reprocess: forceReprocess, auto_denoise: true }
      );
      return response.data;
    } catch (error) {
      console.error('重写笔记内容失败:', error);
      throw error;
    }
  }
}

// 创建全局实例
const xiaohongshuService = new XiaohongshuService();
export default xiaohongshuService;
