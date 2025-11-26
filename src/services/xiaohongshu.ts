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
  CreateXhsTaskRequest,
  NoteContentInfo,
  XhsNoteDenoiseRequest,
  XhsNoteRewriteRequest,
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

  /**
   * 删除笔记
   */
  async deleteNote(
    noteId: string,
    options: {
      delete_comments?: boolean;
      delete_files?: boolean;
    } = {}
  ): Promise<BaseResponse<{
    note_id: string;
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

      const response = await xhsHttp.delete<BaseResponse<{
        note_id: string;
        deleted_comments_count: number;
        comments_deleted: boolean;
        deleted_files_count: number;
        failed_files: Array<{ path: string; error: string }>;
        files_deleted: boolean;
      }>>(
        XHS_API_ENDPOINTS.ARTICLE_DELETE(noteId),
        params
      );
      return response.data;
    } catch (error) {
      console.error('删除笔记失败:', error);
      throw error;
    }
  }

  /**
   * 下载笔记内容
   */
  async downloadNote(noteId: string): Promise<BaseResponse<NoteContentInfo>> {
    try {
      const response = await xhsHttp.post<BaseResponse<NoteContentInfo>>(
        XHS_API_ENDPOINTS.ARTICLE_DOWNLOAD(noteId),
        {}
      );
      return response.data;
    } catch (error) {
      console.error('下载笔记失败:', error);
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
  async createCreator(data: any): Promise<BaseResponse<XhsCreator>> {
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

  /**
   * 删除创作者
   */
  async deleteCreator(
    userId: string,
    options: {
      delete_notes?: boolean;
    } = {}
  ): Promise<BaseResponse<{
    user_id: string;
    deleted_notes_count: number;
    deleted_comments_count: number;
    deleted_files_count: number;
    failed_files: Array<{ path: string; error: string }>;
    notes_deleted: boolean;
  }>> {
    try {
      const params: Record<string, any> = {};
      if (options.delete_notes !== undefined) {
        params.delete_notes = options.delete_notes;
      }

      const response = await xhsHttp.delete<BaseResponse<{
        user_id: string;
        deleted_notes_count: number;
        deleted_comments_count: number;
        deleted_files_count: number;
        failed_files: Array<{ path: string; error: string }>;
        notes_deleted: boolean;
      }>>(
        XHS_API_ENDPOINTS.CREATOR_DELETE(userId),
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
   * 创建任务（统一接口）
   */
  async createTask(data: CreateXhsTaskRequest): Promise<BaseResponse<XhsTask>> {
    try {
      const response = await xhsHttp.post<BaseResponse<XhsTask>>(
        XHS_API_ENDPOINTS.TASKS,
        data
      );
      return response.data;
    } catch (error) {
      console.error('创建任务失败:', error);
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
  async getTask(taskId: string): Promise<BaseResponse<XhsTask>> {
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
   * 获取任务详情（别名，兼容旧代码）
   */
  async getTaskDetail(taskId: string): Promise<BaseResponse<XhsTask>> {
    return this.getTask(taskId);
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
    deleted_notes_count: number;
    deleted_comments_count: number;
    results_deleted: boolean;
  }>> {
    try {
      const params: Record<string, any> = {};
      if (options.delete_results !== undefined) {
        params.delete_results = options.delete_results;
      }

      const response = await xhsHttp.delete<BaseResponse<{
        task_id: string;
        task_deleted_via_api: boolean;
        api_error: string | null;
        deleted_notes_count: number;
        deleted_comments_count: number;
        results_deleted: boolean;
      }>>(
        XHS_API_ENDPOINTS.TASK_DELETE(taskId),
        params
      );
      return response.data;
    } catch (error) {
      console.error('删除任务失败:', error);
      throw error;
    }
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: string): Promise<BaseResponse<XhsTask>> {
    try {
      const response = await xhsHttp.post<BaseResponse<XhsTask>>(
        XHS_API_ENDPOINTS.TASK_CANCEL(taskId),
        {}
      );
      return response.data;
    } catch (error) {
      console.error('取消任务失败:', error);
      throw error;
    }
  }

  // ============ AI 功能 ============

  /**
   * AI去噪笔记内容
   */
  async denoiseNote(request: XhsNoteDenoiseRequest): Promise<BaseResponse<NoteContentInfo>> {
    try {
      const response = await xhsHttp.post<BaseResponse<NoteContentInfo>>(
        XHS_API_ENDPOINTS.ARTICLE_DENOISE(request.note_id),
        {
          force_reprocess: request.force_reprocess,
          save_to_file: request.save_to_file
        }
      );
      return response.data;
    } catch (error) {
      console.error('去噪笔记内容失败:', error);
      throw error;
    }
  }

  /**
   * AI重写笔记内容
   */
  async rewriteNote(request: XhsNoteRewriteRequest): Promise<BaseResponse<NoteContentInfo>> {
    try {
      const response = await xhsHttp.post<BaseResponse<NoteContentInfo>>(
        XHS_API_ENDPOINTS.ARTICLE_REWRITE(request.note_id),
        {
          force_reprocess: request.force_reprocess,
          save_to_file: request.save_to_file,
          auto_denoise: request.auto_denoise
        }
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
