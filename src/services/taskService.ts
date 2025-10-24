import {
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskListParams,
  TaskListResponse,
  TaskDetailResponse,
  CreateTaskResponse,
  ExecuteTaskResponse,
  DeleteTaskResponse,
  CrawlTask,
} from '@/types/task';
import wechatHttp from '@/utils/wechat-http';

class TaskService {
  /**
   * 创建新的采集任务
   */
  async createTask(data: CreateTaskRequest): Promise<CrawlTask> {
    const response = await wechatHttp.post<CreateTaskResponse>('/api/v1/wechat/tasks/', data);
    return response.data.data;
  }

  /**
   * 获取任务列表
   */
  async getTaskList(params: TaskListParams = {}): Promise<TaskListResponse['data']> {
    const response = await wechatHttp.get<TaskListResponse>('/api/v1/wechat/tasks/', params);
    return response.data.data;
  }

  /**
   * 获取任务详情
   */
  async getTaskDetail(taskId: string): Promise<CrawlTask> {
    const response = await wechatHttp.get<TaskDetailResponse>(`/api/v1/wechat/tasks/${taskId}`);
    return response.data.data;
  }

  /**
   * 更新任务信息
   */
  async updateTask(taskId: string, data: UpdateTaskRequest): Promise<CrawlTask> {
    const response = await wechatHttp.put<TaskDetailResponse>(`/api/v1/wechat/tasks/${taskId}`, data);
    return response.data.data;
  }

  /**
   * 立即执行任务
   */
  async executeTask(taskId: string): Promise<string> {
    const response = await wechatHttp.post<ExecuteTaskResponse>(`/api/v1/wechat/tasks/${taskId}/execute`);
    return response.data.data;
  }

  /**
   * 删除任务
   */
  async deleteTask(taskId: string): Promise<string> {
    const response = await wechatHttp.delete<DeleteTaskResponse>(`/api/v1/wechat/tasks/${taskId}`);
    return response.data.data;
  }

  /**
   * 获取指定公众号的任务列表
   */
  async getAccountTasks(biz: string, params: Omit<TaskListParams, 'biz'> = {}): Promise<TaskListResponse['data']> {
    return this.getTaskList({
      ...params,
      biz,
    });
  }
}

export const taskService = new TaskService();
export default taskService;
