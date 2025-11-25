"use client";

import React, { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Row,
  Col,
  Card,
  Button,
  Input,
  Select,
  Space,
  Typography,
  Spin,
  Empty,
  App,
  Segmented,
  Form,
  InputNumber,
  Switch,
  Tag,
  Statistic,
  Avatar,
  Tooltip,
  Modal,
  List,
  Checkbox,
  Divider,
  DatePicker,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  UserOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  HeartOutlined,
  CommentOutlined,
  StarOutlined,
  ShareAltOutlined,
  EyeOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import MainLayout from '@/layout/MainLayout';
import DouyinVideoCard from '@/components/douyin/DouyinVideoCard';
import douyinService from '@/services/douyin';
import type {
  DouyinVideo,
  DouyinCreator,
  DouyinTask,
  DouyinVideoQuery,
  DouyinCreatorQuery,
  CreateDouyinSearchTaskRequest,
  CreateDouyinDetailTaskRequest,
  CreateDouyinCreatorTaskRequest,
} from '@/types/douyin';
import {
  DOUYIN_SORT_OPTIONS,
  DOUYIN_SORT_ORDER_OPTIONS,
  DOUYIN_TASK_STATUS_CONFIG,
  DOUYIN_TASK_TYPE_CONFIG,
  DOUYIN_CREATOR_SORT_OPTIONS,
  DOUYIN_PUBLISH_TIME_OPTIONS,
  DOUYIN_COMMENT_SORT_OPTIONS,
  DOUYIN_IMAGE_FORMAT_OPTIONS,
  DOUYIN_VIDEO_FORMAT_OPTIONS,
  DOUYIN_SCHEDULE_TYPE_OPTIONS,
  DOUYIN_SCHEDULE_TYPE_CONFIG,
  DOUYIN_TASK_SORT_OPTIONS,
  DouyinTaskType,
  DouyinTaskStatus,
} from '@/types/douyin';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TextArea } = Input;

// 视图模式类型
type ViewMode = 'videos' | 'creators' | 'tasks';

function DouyinPageContent() {
  const { modal, message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 视图模式：从 URL 参数初始化
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'creators') return 'creators';
    if (viewParam === 'tasks') return 'tasks';
    return 'videos'; // 默认视图
  });

  // ============ 视频视图状态 ============
  const [videos, setVideos] = useState<DouyinVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosTotal, setVideosTotal] = useState(0);
  const [videosPage, setVideosPage] = useState(1);
  const [videosHasMore, setVideosHasMore] = useState(true);

  // 视频筛选
  const [videoKeyword, setVideoKeyword] = useState('');
  const [videoSortBy, setVideoSortBy] = useState('create_time');
  const [videoSortOrder, setVideoSortOrder] = useState<'asc' | 'desc'>('desc');


  // ============ 创作者视图状态 ============
  const [creators, setCreators] = useState<DouyinCreator[]>([]);
  const [creatorsLoading, setCreatorsLoading] = useState(false);
  const [creatorsTotal, setCreatorsTotal] = useState(0);
  const [creatorsPage, setCreatorsPage] = useState(1);
  const [creatorsHasMore, setCreatorsHasMore] = useState(true);

  // 创作者筛选
  const [creatorKeyword, setCreatorKeyword] = useState('');
  const [creatorSortBy, setCreatorSortBy] = useState('fans');
  const [creatorSortOrder, setCreatorSortOrder] = useState<'asc' | 'desc'>('desc');

  // 创作者表单
  const [creatorFormVisible, setCreatorFormVisible] = useState(false);
  const [creatorForm] = Form.useForm();
  const [creatorCreating, setCreatorCreating] = useState(false);

  // ============ 任务视图状态 ============
  const [tasks, setTasks] = useState<DouyinTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksTotal, setTasksTotal] = useState(0);
  const [tasksPage, setTasksPage] = useState(1);
  const [tasksHasMore, setTasksHasMore] = useState(true);

  // 任务调度类型tab
  const [taskScheduleTab, setTaskScheduleTab] = useState<'immediate' | 'once' | 'cron'>('immediate');

  // 任务搜索和筛选
  const [taskKeyword, setTaskKeyword] = useState('');
  const [taskTypeFilter, setTaskTypeFilter] = useState<DouyinTaskType | undefined>();
  const [taskStatusFilter, setTaskStatusFilter] = useState<DouyinTaskStatus | undefined>();
  const [taskSortBy, setTaskSortBy] = useState('created_at');
  const [taskSortOrder, setTaskSortOrder] = useState<'asc' | 'desc'>('desc');

  // 任务表单
  const [taskFormVisible, setTaskFormVisible] = useState(false);
  const [taskForm] = Form.useForm();
  const [taskCreating, setTaskCreating] = useState(false);
  const [taskType, setTaskType] = useState<'search' | 'detail' | 'creator'>('search');
  const [scheduleType, setScheduleType] = useState<'immediate' | 'once' | 'cron'>('immediate');

  // 无限滚动相关 - 哨兵元素 ref
  const videosSentinelRef = useRef<HTMLDivElement>(null);
  const creatorsSentinelRef = useRef<HTMLDivElement>(null);
  const tasksSentinelRef = useRef<HTMLDivElement>(null);

  // ============ 视频相关函数 ============

  const loadVideos = useCallback(async (append = false, keyword?: string) => {
    setVideosLoading(true);
    try {
      const query: DouyinVideoQuery = {
        keyword: keyword !== undefined ? keyword : (videoKeyword || undefined),
        sort_by: videoSortBy,
        sort_order: videoSortOrder,
        page: append ? videosPage + 1 : 1,
        page_size: 20,
      };

      const response = await douyinService.getVideos(query);

      if (response.success && response.data) {
        const newVideos = response.data.items || [];
        setVideos(append ? [...videos, ...newVideos] : newVideos);
        setVideosTotal(response.data.total || 0);
        setVideosPage(append ? videosPage + 1 : 1);
        setVideosHasMore(newVideos.length === 20);
      }
    } catch (error: any) {
      message.error(error.message || '加载视频失败');
    } finally {
      setVideosLoading(false);
    }
  }, [videoKeyword, videoSortBy, videoSortOrder, videosPage, videos, message]);

  const handleVideoSearch = useCallback((value: string) => {
    setVideoKeyword(value);
    setVideosPage(1);
    // 直接使用新的 keyword 值触发搜索
    loadVideos(false, value);
  }, [loadVideos]);

  const handleViewVideoDetail = useCallback((video: DouyinVideo) => {
    // 从视频列表进入详情页,不携带 from 参数,返回时会回到视频列表
    if (video.aweme_id) {
      router.push(`/crawler-data/douyin/videos/${video.aweme_id}`);
    }
  }, [router]);

  const handleDeleteVideo = useCallback((video: DouyinVideo) => {
    const awemeId = video.aweme_id || video.id;
    if (!awemeId) {
      message.error('视频ID不存在');
      return;
    }

    let deleteComments = true;
    let deleteFiles = false;

    modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <p style={{ marginBottom: 8 }}>确定要删除视频吗？此操作不可恢复。</p>
            <p style={{ fontSize: '12px', color: '#999' }}>
              视频标题: {video.title || video.desc || '无标题'}
            </p>
          </div>
          <Checkbox
            defaultChecked={true}
            onChange={(e) => { deleteComments = e.target.checked; }}
          >
            同时删除关联的评论数据
          </Checkbox>
          <Checkbox
            defaultChecked={false}
            onChange={(e) => { deleteFiles = e.target.checked; }}
          >
            同时删除本地文件（视频和图片文件）
          </Checkbox>
        </Space>
      ),
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await douyinService.deleteVideo(awemeId, {
            delete_comments: deleteComments,
            delete_files: deleteFiles,
          });

          if (response.success) {
            message.success('视频删除成功');
            // 从列表中移除
            setVideos(prev => prev.filter(v => (v.aweme_id || v.id) !== awemeId));
            setVideosTotal(prev => Math.max(0, prev - 1));
          } else {
            message.error(response.message || '删除视频失败');
          }
        } catch (error: any) {
          console.error('删除视频失败:', error);
          const errorMessage = error?.message || error?.data?.detail || '删除视频时发生错误';
          message.error(errorMessage);
        }
      },
    });
  }, [modal, message]);

  // ============ 创作者相关函数 ============

  const loadCreators = useCallback(async (append = false, keyword?: string) => {
    setCreatorsLoading(true);
    try {
      const query: DouyinCreatorQuery = {
        keyword: keyword !== undefined ? keyword : (creatorKeyword || undefined),
        sort_by: creatorSortBy,
        sort_order: creatorSortOrder,
        page: append ? creatorsPage + 1 : 1,
        page_size: 20,
      };

      const response = await douyinService.getCreators(query);

      if (response.success && response.data) {
        const newCreators = response.data.items || [];
        setCreators(append ? [...creators, ...newCreators] : newCreators);
        setCreatorsTotal(response.data.total || 0);
        setCreatorsPage(append ? creatorsPage + 1 : 1);
        setCreatorsHasMore(newCreators.length === 20);
      }
    } catch (error: any) {
      message.error(error.message || '加载创作者失败');
    } finally {
      setCreatorsLoading(false);
    }
  }, [creatorKeyword, creatorSortBy, creatorSortOrder, creatorsPage, creators, message]);

  const handleCreatorSearch = useCallback((value: string) => {
    setCreatorKeyword(value);
    setCreatorsPage(1);
    // 直接使用新的 keyword 值触发搜索
    loadCreators(false, value);
  }, [loadCreators]);

  const handleCreateCreator = useCallback(async (values: any) => {
    setCreatorCreating(true);
    try {
      const data: any = {
        user_id: values.user_id,
        creator_url: values.creator_url,
        force_refresh: values.force_refresh || false,
      };

      const response = await douyinService.createCreator(data);

      if (response.success) {
        message.success('创作者导入成功');
        setCreatorFormVisible(false);
        creatorForm.resetFields();
        loadCreators(false);
      }
    } catch (error: any) {
      message.error(error.message || '创建创作者失败');
    } finally {
      setCreatorCreating(false);
    }
  }, [creatorForm, message, loadCreators]);

  const handleDeleteCreator = useCallback((creator: DouyinCreator) => {
    const userId = creator.user_id;
    if (!userId) {
      message.error('创作者ID不存在');
      return;
    }

    let deleteVideos = false;

    modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <p style={{ marginBottom: 8 }}>确定要删除创作者"{creator.nickname}"吗？此操作不可恢复。</p>
          </div>
          <Checkbox
            defaultChecked={false}
            onChange={(e) => { deleteVideos = e.target.checked; }}
          >
            同时删除该创作者的所有视频和评论数据（包括本地文件）
          </Checkbox>
          <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
            注意：如果勾选此项，将删除该创作者的所有视频、评论及相关文件
          </p>
        </Space>
      ),
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await douyinService.deleteCreator(userId, {
            delete_videos: deleteVideos,
          });

          if (response.success) {
            message.success('创作者删除成功');
            // 从列表中移除
            setCreators(prev => prev.filter(c => c.user_id !== userId));
            setCreatorsTotal(prev => Math.max(0, prev - 1));
          } else {
            message.error(response.message || '删除创作者失败');
          }
        } catch (error: any) {
          console.error('删除创作者失败:', error);
          const errorMessage = error?.message || error?.data?.detail || '删除创作者时发生错误';
          message.error(errorMessage);
        }
      },
    });
  }, [modal, message]);

  // ============ 任务相关函数 ============

  const loadTasks = useCallback(async (append = false, keyword?: string) => {
    setTasksLoading(true);
    try {
      const response = await douyinService.getTasks({
        keyword: keyword !== undefined ? keyword : (taskKeyword || undefined),
        task_type: taskTypeFilter,
        status: taskStatusFilter,
        schedule_type: taskScheduleTab,
        sort_by: taskSortBy,
        sort_order: taskSortOrder,
        page: append ? tasksPage + 1 : 1,
        page_size: 20,
      });

      if (response.success && response.data) {
        const newTasks = response.data.items || [];
        setTasks(append ? [...tasks, ...newTasks] : newTasks);
        setTasksTotal(response.data.total || 0);
        setTasksPage(append ? tasksPage + 1 : 1);
        setTasksHasMore(newTasks.length === 20);
      }
    } catch (error: any) {
      message.error(error.message || '加载任务失败');
    } finally {
      setTasksLoading(false);
    }
  }, [taskKeyword, taskTypeFilter, taskStatusFilter, taskScheduleTab, taskSortBy, taskSortOrder, tasksPage, tasks, message]);

  const handleTaskSearch = useCallback((value: string) => {
    setTaskKeyword(value);
    setTasksPage(1);
    // 直接使用新的 keyword 值触发搜索
    loadTasks(false, value);
  }, [loadTasks]);

  const handleCreateTask = useCallback(async (values: any) => {
    setTaskCreating(true);
    try {
      let response;

      // 构建评论配置
      const commentConfig = values.enable_comments ? {
        enabled: true,
        max_per_note: values.max_comments_per_video || 100,
        include_sub_comments: values.include_sub_comments || false,
        max_sub_per_comment: values.max_sub_per_comment || 5,
        sort_by: values.comment_sort_by || 'hot',
      } : {
        enabled: false,
      };

      // 构建媒体下载配置（默认启用）
      const mediaDownloadConfig = {
        enabled: values.enable_media_download !== false,
        download_images: values.download_images !== false,
        download_videos: values.download_videos !== false,
        save_path: values.media_save_path || '/opt/data/douyin_media',
        max_image_size_mb: values.max_image_size_mb || 50,
        max_video_size_mb: values.max_video_size_mb || 5000,
        image_format: values.image_format || 'jpg',
        video_format: values.video_format || 'mp4',
      };

      // 构建后处理配置
      const postProcessingConfig = {
        enabled: values.post_processing_config?.enabled || false,
        extract_transcript: values.post_processing_config?.extract_transcript || false,
        denoise_transcript: values.post_processing_config?.denoise_transcript || false,
        rewrite_transcript: values.post_processing_config?.rewrite_transcript || false,
        rewrite_style: values.post_processing_config?.rewrite_style || 'natural',
        force_reprocess: values.post_processing_config?.force_reprocess || false,
        batch_size: values.post_processing_config?.batch_size || 10,
        concurrent_limit: values.post_processing_config?.concurrent_limit || 3,
      };

      if (taskType === 'search') {
        const data: CreateDouyinSearchTaskRequest = {
          name: values.task_name || `搜索任务-${values.keywords}`,
          task_type: 'search',
          keywords: values.keywords,
          publish_time_type: values.publish_time_type || 0,
          max_count: values.max_count || 50,
          start_page: values.start_page || 1,

          // 调度配置
          schedule_type: values.schedule_type || 'immediate',
          scheduled_time: values.scheduled_time,
          cron_expression: values.cron_expression,

          comment_config: commentConfig,
          enable_resume: values.enable_resume !== false,
          enable_proxy: values.enable_proxy || false,
          media_download_config: mediaDownloadConfig,
          post_processing_config: postProcessingConfig,
        };
        response = await douyinService.createSearchTask(data);
      } else if (taskType === 'detail') {
        const awemeIds = values.aweme_ids?.split('\n').filter((id: string) => id.trim());
        if (!awemeIds || awemeIds.length === 0) {
          message.error('请输入至少一个视频ID');
          return;
        }
        response = await douyinService.createDetailTask({
          name: values.task_name || `详情任务-${awemeIds.length}个视频`,
          task_type: 'detail',
          aweme_ids: awemeIds,
          max_count: values.max_count || awemeIds.length,
          start_page: values.start_page || 1,

          // 调度配置
          schedule_type: values.schedule_type || 'immediate',
          scheduled_time: values.scheduled_time,
          cron_expression: values.cron_expression,

          comment_config: commentConfig,
          enable_resume: values.enable_resume !== false,
          enable_proxy: values.enable_proxy || false,
          media_download_config: mediaDownloadConfig,
          post_processing_config: postProcessingConfig,
        });
      } else if (taskType === 'creator') {
        if (!values.user_id) {
          message.error('请输入用户ID');
          return;
        }
        const data: CreateDouyinCreatorTaskRequest = {
          name: values.task_name || `创作者任务-${values.user_id}`,
          task_type: 'creator',
          user_id: values.user_id,
          max_count: values.max_count || 50,
          start_page: values.start_page || 1,

          // 调度配置
          schedule_type: values.schedule_type || 'immediate',
          scheduled_time: values.scheduled_time,
          cron_expression: values.cron_expression,

          comment_config: commentConfig,
          enable_resume: values.enable_resume !== false,
          enable_proxy: values.enable_proxy || false,
          media_download_config: mediaDownloadConfig,
          post_processing_config: postProcessingConfig,
        };
        response = await douyinService.createCreatorTask(data);
      }

      if (response?.success) {
        message.success('任务创建成功');
        setTaskFormVisible(false);
        taskForm.resetFields();

        // 如果当前不在任务视图,跳转到任务视图
        if (viewMode !== 'tasks') {
          handleViewModeChange('tasks');
        } else {
          loadTasks(false);
        }
      }
    } catch (error: any) {
      message.error(error.message || '创建任务失败');
    } finally {
      setTaskCreating(false);
    }
  }, [taskType, taskForm, message, loadTasks]);

  const handleDeleteTask = useCallback((task: DouyinTask) => {
    const taskId = task.id;
    if (!taskId) {
      message.error('任务ID不存在');
      return;
    }

    let deleteResults = false;

    modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <p style={{ marginBottom: 8 }}>确定要删除任务吗？此操作不可恢复。</p>
            <p style={{ fontSize: '12px', color: '#999' }}>
              任务名称: {task.name}
            </p>
          </div>
          <Checkbox
            defaultChecked={false}
            onChange={(e) => { deleteResults = e.target.checked; }}
          >
            同时删除该任务采集的所有结果数据（视频和评论）
          </Checkbox>
          <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
            注意：如果勾选此项，将删除该任务采集的所有视频和评论数据
          </p>
        </Space>
      ),
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await douyinService.deleteTask(taskId, {
            delete_results: deleteResults,
          });

          if (response.success) {
            message.success('任务删除成功');
            // 从列表中移除
            setTasks(prev => prev.filter(t => t.id !== taskId));
            setTasksTotal(prev => Math.max(0, prev - 1));
          } else {
            message.error(response.message || '删除任务失败');
          }
        } catch (error: any) {
          console.error('删除任务失败:', error);
          const errorMessage = error?.message || error?.data?.detail || '删除任务时发生错误';
          message.error(errorMessage);
        }
      },
    });
  }, [modal, message]);

  // ============ 视图切换处理 ============

  // 监听 URL 参数变化，同步视图模式
  useEffect(() => {
    const viewParam = searchParams.get('view');
    let newViewMode: ViewMode = 'videos';
    if (viewParam === 'creators') newViewMode = 'creators';
    else if (viewParam === 'tasks') newViewMode = 'tasks';

    if (newViewMode !== viewMode) {
      setViewMode(newViewMode);
    }
  }, [searchParams, viewMode]);

  // ============ 无限滚动观察器 ============

  // 视频视图 - 无限滚动观察器
  useEffect(() => {
    if (viewMode !== 'videos') return;

    const sentinel = videosSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && videosHasMore && !videosLoading) {
          loadVideos(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [viewMode, videosHasMore, videosLoading, loadVideos]);

  // 创作者视图 - 无限滚动观察器
  useEffect(() => {
    if (viewMode !== 'creators') return;

    const sentinel = creatorsSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && creatorsHasMore && !creatorsLoading) {
          loadCreators(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [viewMode, creatorsHasMore, creatorsLoading, loadCreators]);

  // 任务视图 - 无限滚动观察器
  useEffect(() => {
    if (viewMode !== 'tasks') return;

    const sentinel = tasksSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && tasksHasMore && !tasksLoading) {
          loadTasks(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [viewMode, tasksHasMore, tasksLoading, loadTasks]);

  // 切换视图模式（同步更新 URL）
  const handleViewModeChange = useCallback((value: string | number) => {
    const newViewMode = value as ViewMode;
    setViewMode(newViewMode);

    // 更新 URL 参数
    const params = new URLSearchParams(searchParams.toString());
    if (newViewMode === 'videos') {
      params.delete('view'); // 默认视图不需要参数
    } else {
      params.set('view', newViewMode);
    }

    const queryString = params.toString();
    router.push(`/crawler-data/douyin${queryString ? '?' + queryString : ''}`);
  }, [router, searchParams]);

  // ============ 初始化加载 ============

  useEffect(() => {
    if (viewMode === 'videos') {
      loadVideos(false);
    } else if (viewMode === 'creators') {
      loadCreators(false);
    } else if (viewMode === 'tasks') {
      loadTasks(false);
    }
  }, [viewMode, videoSortBy, videoSortOrder, creatorSortBy, creatorSortOrder, taskTypeFilter, taskStatusFilter, taskScheduleTab, taskSortBy, taskSortOrder]);

  return (
    <MainLayout fullWidth>
      <div style={{ padding: '24px' }}>
        {/* 页面标题和操作栏 */}
        <Card>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Title level={2} style={{ margin: 0, marginBottom: '8px' }}>
                  <PlayCircleOutlined style={{ color: '#fe2c55', marginRight: '12px' }} />
                  抖音数据管理
                </Title>
                <Text type="secondary">
                  {viewMode === 'videos' && '浏览和管理抖音视频，支持搜索和筛选'}
                  {viewMode === 'creators' && '管理抖音创作者信息'}
                  {viewMode === 'tasks' && '创建和管理采集任务'}
                </Text>
                <div style={{ marginTop: '8px' }}>
                  <Text strong>
                    {viewMode === 'videos' && `总计: ${videosTotal.toLocaleString()} 个视频`}
                    {viewMode === 'creators' && `总计: ${creatorsTotal.toLocaleString()} 个创作者`}
                    {viewMode === 'tasks' && `总计: ${tasksTotal.toLocaleString()} 个任务`}
                  </Text>
                </div>
              </div>
              <Space>
                {/* 视图切换 */}
                <Segmented
                  value={viewMode}
                  onChange={handleViewModeChange}
                  options={[
                    {
                      label: (
                        <Space>
                          <PlayCircleOutlined />
                          <span>视频</span>
                        </Space>
                      ),
                      value: 'videos',
                    },
                    {
                      label: (
                        <Space>
                          <TeamOutlined />
                          <span>创作者</span>
                        </Space>
                      ),
                      value: 'creators',
                    },
                    {
                      label: (
                        <Space>
                          <UnorderedListOutlined />
                          <span>任务</span>
                        </Space>
                      ),
                      value: 'tasks',
                    },
                  ]}
                />
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    if (viewMode === 'videos') loadVideos(false);
                    else if (viewMode === 'creators') loadCreators(false);
                    else loadTasks(false);
                  }}
                  loading={videosLoading || creatorsLoading || tasksLoading}
                >
                  刷新
                </Button>
                {viewMode === 'creators' && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setCreatorFormVisible(true)}
                  >
                    导入创作者
                  </Button>
                )}
                {/* 创建任务按钮在所有视图都显示 */}
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setTaskFormVisible(true)}
                >
                  创建任务
                </Button>
              </Space>
            </div>
          </div>

          {/* 视频视图 - 搜索和筛选 */}
          {viewMode === 'videos' && (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={10}>
                <Search
                  placeholder="搜索视频标题、描述"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  value={videoKeyword}
                  onChange={(e) => setVideoKeyword(e.target.value)}
                  onSearch={handleVideoSearch}
                />
              </Col>
              <Col xs={24} sm={6} lg={4}>
                <Select
                  style={{ width: '100%' }}
                  size="large"
                  value={videoSortBy}
                  onChange={setVideoSortBy}
                  options={[...DOUYIN_SORT_OPTIONS]}
                />
              </Col>
              <Col xs={24} sm={6} lg={4}>
                <Select
                  style={{ width: '100%' }}
                  size="large"
                  value={videoSortOrder}
                  onChange={setVideoSortOrder}
                  options={[...DOUYIN_SORT_ORDER_OPTIONS]}
                />
              </Col>
            </Row>
          )}

          {/* 创作者视图 - 搜索和筛选 */}
          {viewMode === 'creators' && (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={10}>
                <Search
                  placeholder="搜索创作者昵称"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  value={creatorKeyword}
                  onChange={(e) => setCreatorKeyword(e.target.value)}
                  onSearch={handleCreatorSearch}
                />
              </Col>
              <Col xs={24} sm={6} lg={4}>
                <Select
                  style={{ width: '100%' }}
                  size="large"
                  value={creatorSortBy}
                  onChange={setCreatorSortBy}
                  options={[...DOUYIN_CREATOR_SORT_OPTIONS]}
                />
              </Col>
              <Col xs={24} sm={6} lg={4}>
                <Select
                  style={{ width: '100%' }}
                  size="large"
                  value={creatorSortOrder}
                  onChange={setCreatorSortOrder}
                  options={[...DOUYIN_SORT_ORDER_OPTIONS]}
                />
              </Col>
            </Row>
          )}
        </Card>

        {/* 视频列表 */}
        {viewMode === 'videos' && (
          <div style={{ marginTop: '24px' }}>
            {videos.length === 0 && !videosLoading ? (
              <Card>
                <Empty description="暂无视频数据" />
              </Card>
            ) : (
              <>
                <Row gutter={[16, 16]}>
                  {videos.map((video) => (
                    <Col key={video.aweme_id || video.id} xs={24} sm={12} lg={8} xl={6}>
                      <div style={{ height: '100%' }}>
                        <DouyinVideoCard
                          video={video}
                          onView={handleViewVideoDetail}
                          onDelete={handleDeleteVideo}
                          loading={videosLoading}
                        />
                      </div>
                    </Col>
                  ))}
                </Row>
                {/* 加载更多指示器 */}
                <div ref={videosSentinelRef} style={{ textAlign: 'center', padding: '20px' }}>
                  {videosLoading && (
                    <Spin tip="加载中...">
                      <div style={{ height: '60px' }} />
                    </Spin>
                  )}
                  {!videosLoading && videosHasMore && videos.length > 0 && (
                    <Button onClick={() => loadVideos(true)}>加载更多</Button>
                  )}
                  {!videosLoading && !videosHasMore && videos.length > 0 && (
                    <Text type="secondary">已加载全部数据</Text>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* 创作者列表 */}
        {viewMode === 'creators' && (
          <div style={{ marginTop: '24px' }}>
            {creators.length === 0 && !creatorsLoading ? (
              <Card>
                <Empty description="暂无创作者数据" />
              </Card>
            ) : (
              <>
                <Row gutter={[16, 16]}>
                  {creators.map((creator) => {
                    // 格式化时间戳
                    const formatTime = (timestamp?: number): string => {
                      if (!timestamp) return '-';
                      const date = new Date(timestamp);
                      return date.toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                    };

                    // 格式化数字（添加千分位）
                    const formatNumber = (num?: number): string => {
                      if (num === undefined || num === null) return '-';
                      return num.toLocaleString('zh-CN');
                    };

                    return (
                      <Col key={creator.id || creator.user_id} xs={24} sm={12} lg={8} xl={6}>
                        <Card
                          hoverable
                          onClick={() => router.push(`/crawler-data/douyin/creators/${creator.user_id}?view=creators`)}
                          style={{ cursor: 'pointer' }}
                          actions={[
                            <Tooltip key="delete" title="删除创作者">
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCreator(creator);
                                }}
                                disabled={creatorsLoading}
                              />
                            </Tooltip>,
                          ]}
                        >
                          <Card.Meta
                            avatar={<Avatar size={64} src={creator.avatar} icon={<UserOutlined />} />}
                            title={
                              <Space>
                                <span>{creator.nickname}</span>
                                {creator.gender && (
                                  <Tag color={creator.gender === '女' ? 'pink' : 'blue'} style={{ margin: 0 }}>
                                    {creator.gender}
                                  </Tag>
                                )}
                              </Space>
                            }
                            description={
                              <>
                                {/* 简介 */}
                                <Paragraph
                                  ellipsis={{ rows: 2, tooltip: creator.desc || creator.signature }}
                                  style={{ marginBottom: 12, minHeight: 44 }}
                                >
                                  {creator.desc || creator.signature || '暂无简介'}
                                </Paragraph>

                                {/* IP属地 */}
                                {creator.ip_location && (
                                  <div style={{ marginBottom: 8 }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      {creator.ip_location}
                                    </Text>
                                  </div>
                                )}

                                {/* 统计数据 */}
                                <Row gutter={8} style={{ marginBottom: 8 }}>
                                  <Col span={12}>
                                    <Statistic
                                      title="粉丝"
                                      value={formatNumber(creator.fans)}
                                      valueStyle={{ fontSize: 16 }}
                                    />
                                  </Col>
                                  <Col span={12}>
                                    <Statistic
                                      title="关注"
                                      value={formatNumber(creator.follows)}
                                      valueStyle={{ fontSize: 16 }}
                                    />
                                  </Col>
                                </Row>
                                <Row gutter={8} style={{ marginBottom: 8 }}>
                                  <Col span={12}>
                                    <Statistic
                                      title="获赞"
                                      value={formatNumber(creator.interaction)}
                                      valueStyle={{ fontSize: 16 }}
                                    />
                                  </Col>
                                  <Col span={12}>
                                    <Statistic
                                      title="视频"
                                      value={formatNumber(creator.videos_count)}
                                      valueStyle={{ fontSize: 16 }}
                                    />
                                  </Col>
                                </Row>

                                {/* 最后修改时间 */}
                                {creator.last_modify_ts && (
                                  <div style={{ marginTop: 8 }}>
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                      更新: {formatTime(creator.last_modify_ts)}
                                    </Text>
                                  </div>
                                )}
                              </>
                            }
                          />
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
                {/* 加载更多指示器 */}
                <div ref={creatorsSentinelRef} style={{ textAlign: 'center', padding: '20px' }}>
                  {creatorsLoading && (
                    <Spin tip="加载中...">
                      <div style={{ height: '60px' }} />
                    </Spin>
                  )}
                  {!creatorsLoading && creatorsHasMore && creators.length > 0 && (
                    <Button onClick={() => loadCreators(true)}>加载更多</Button>
                  )}
                  {!creatorsLoading && !creatorsHasMore && creators.length > 0 && (
                    <Text type="secondary">已加载全部数据</Text>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* 任务列表 */}
        {viewMode === 'tasks' && (
          <div style={{ marginTop: '24px' }}>
            {/* 搜索和筛选栏 */}
            <Card style={{ marginBottom: '16px' }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8} lg={6}>
                  <Search
                    placeholder="搜索任务名称"
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    value={taskKeyword}
                    onChange={(e) => setTaskKeyword(e.target.value)}
                    onSearch={handleTaskSearch}
                  />
                </Col>
                <Col xs={12} sm={4} lg={3}>
                  <Select
                    style={{ width: '100%' }}
                    size="large"
                    placeholder="任务类型"
                    allowClear
                    value={taskTypeFilter}
                    onChange={(value) => {
                      setTaskTypeFilter(value);
                      setTasksPage(1);
                    }}
                    options={[
                      { label: '关键词搜索', value: 'search' },
                      { label: '视频详情', value: 'detail' },
                      { label: '创作者主页', value: 'creator' },
                    ]}
                  />
                </Col>
                <Col xs={12} sm={4} lg={3}>
                  <Select
                    style={{ width: '100%' }}
                    size="large"
                    placeholder="执行状态"
                    allowClear
                    value={taskStatusFilter}
                    onChange={(value) => {
                      setTaskStatusFilter(value);
                      setTasksPage(1);
                    }}
                    options={[
                      { label: '等待执行', value: 'pending' },
                      { label: '正在执行', value: 'running' },
                      { label: '已完成', value: 'completed' },
                      { label: '执行失败', value: 'failed' },
                      { label: '已取消', value: 'cancelled' },
                    ]}
                  />
                </Col>
                <Col xs={12} sm={4} lg={3}>
                  <Select
                    style={{ width: '100%' }}
                    size="large"
                    value={taskSortBy}
                    onChange={(value) => {
                      setTaskSortBy(value);
                      setTasksPage(1);
                    }}
                    options={[...DOUYIN_TASK_SORT_OPTIONS]}
                  />
                </Col>
                <Col xs={12} sm={4} lg={3}>
                  <Select
                    style={{ width: '100%' }}
                    size="large"
                    value={taskSortOrder}
                    onChange={(value) => {
                      setTaskSortOrder(value);
                      setTasksPage(1);
                    }}
                    options={[...DOUYIN_SORT_ORDER_OPTIONS]}
                  />
                </Col>
              </Row>
            </Card>

            {/* 任务列表 - 按调度类型分tab */}
            <Tabs
              activeKey={taskScheduleTab}
              onChange={(key) => {
                setTaskScheduleTab(key as any);
                setTasksPage(1);
                setTasks([]);
              }}
              items={[
                {
                  key: 'immediate',
                  label: `立即执行任务 (${taskScheduleTab === 'immediate' ? tasksTotal : '-'})`,
                  children: (
                    <>
                      {tasks.length === 0 && !tasksLoading ? (
                        <Card>
                          <Empty description="暂无立即执行任务" />
                        </Card>
                      ) : (
                        <>
                          <Row gutter={[16, 16]}>
                            {tasks.map((task) => {
                              // 格式化时间
                              const formatTime = (timeStr?: string | null): string => {
                                if (!timeStr) return '-';
                                try {
                                  return new Date(timeStr).toLocaleString('zh-CN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  });
                                } catch {
                                  return timeStr;
                                }
                              };

                              // 格式化数字
                              const formatNumber = (num?: number): string => {
                                if (num === undefined || num === null) return '-';
                                return num.toLocaleString('zh-CN');
                              };

                              return (
                                <Col key={task.id} xs={24} sm={12} lg={8} xl={6}>
                                  <Card
                                    hoverable
                                    onClick={() => router.push(`/crawler-data/douyin/tasks/${task.id}?view=tasks`)}
                                    style={{ cursor: 'pointer' }}
                                    actions={[
                                      <Tooltip key="delete" title="删除任务">
                                        <Button
                                          type="text"
                                          danger
                                          icon={<DeleteOutlined />}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteTask(task);
                                          }}
                                          disabled={tasksLoading}
                                        />
                                      </Tooltip>,
                                    ]}
                                  >
                                    <Card.Meta
                                      title={
                                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                          <Space>
                                            <Tag color={DOUYIN_TASK_STATUS_CONFIG[task.status].color}>
                                              {DOUYIN_TASK_STATUS_CONFIG[task.status].text}
                                            </Tag>
                                            <Tag color={DOUYIN_TASK_TYPE_CONFIG[task.task_type].color}>
                                              {DOUYIN_TASK_TYPE_CONFIG[task.task_type].text}
                                            </Tag>
                                          </Space>
                                          <Text strong style={{ fontSize: '14px' }}>
                                            {task.name}
                                          </Text>
                                        </Space>
                                      }
                                      description={
                                        <>
                                          {/* 任务参数 */}
                                          {task.keywords && (
                                            <div style={{ marginBottom: 8 }}>
                                              <Text type="secondary" style={{ fontSize: 12 }}>
                                                关键词: <Text strong>{task.keywords}</Text>
                                              </Text>
                                            </div>
                                          )}
                                          {task.creator_id && (
                                            <div style={{ marginBottom: 8 }}>
                                              <Text type="secondary" style={{ fontSize: 12 }}>
                                                创作者ID: <Text code>{task.creator_id.substring(0, 20)}...</Text>
                                              </Text>
                                            </div>
                                          )}
                                          {task.aweme_ids && task.aweme_ids.length > 0 && (
                                            <div style={{ marginBottom: 8 }}>
                                              <Text type="secondary" style={{ fontSize: 12 }}>
                                                视频数: <Text strong>{task.aweme_ids.length}</Text>
                                              </Text>
                                            </div>
                                          )}

                                          {/* 调度信息 */}
                                          {task.schedule_type && (
                                            <div style={{ marginBottom: 8 }}>
                                              <Space size="small">
                                                <Tag color={DOUYIN_SCHEDULE_TYPE_CONFIG[task.schedule_type].color}>
                                                  {DOUYIN_SCHEDULE_TYPE_CONFIG[task.schedule_type].text}
                                                </Tag>
                                                {task.schedule_type === 'once' && task.scheduled_time && (
                                                  <Text type="secondary" style={{ fontSize: 11 }}>
                                                    {formatTime(task.scheduled_time)}
                                                  </Text>
                                                )}
                                                {task.schedule_type === 'cron' && task.cron_expression && (
                                                  <Text type="secondary" style={{ fontSize: 11 }} code>
                                                    {task.cron_expression}
                                                  </Text>
                                                )}
                                              </Space>
                                            </div>
                                          )}


                                          {/* 结果统计 */}
                                          {task.status === 'completed' ? (
                                            <Row gutter={8} style={{ marginBottom: 8 }}>
                                              <Col span={12}>
                                                <Statistic
                                                  title="视频数"
                                                  value={formatNumber(task.results_summary?.notes_count || 0)}
                                                  valueStyle={{ fontSize: 14 }}
                                                />
                                              </Col>
                                              <Col span={12}>
                                                <Statistic
                                                  title="评论数"
                                                  value={formatNumber(task.results_summary?.comments_count || 0)}
                                                  valueStyle={{ fontSize: 14 }}
                                                />
                                              </Col>
                                            </Row>
                                          ) : (
                                            <Row gutter={8} style={{ marginBottom: 8 }}>
                                              <Col span={12}>
                                                <Statistic
                                                  title="当前进度"
                                                  value={formatNumber(task.progress?.current)}
                                                  valueStyle={{ fontSize: 14 }}
                                                />
                                              </Col>
                                              <Col span={12}>
                                                <Statistic
                                                  title="总计"
                                                  value={formatNumber(task.progress?.total)}
                                                  valueStyle={{ fontSize: 14 }}
                                                />
                                              </Col>
                                            </Row>
                                          )}

                                          {/* 时间信息 */}
                                          <div style={{ marginTop: 8 }}>
                                            <Text type="secondary" style={{ fontSize: 11 }}>
                                              创建: {formatTime(task.created_at)}
                                            </Text>
                                          </div>

                                          <div>
                                            <Text type="secondary" style={{ fontSize: 11 }}>
                                              完成: {task.completed_at && formatTime(task.completed_at)}
                                            </Text>
                                          </div>


                                          {/* 错误信息 */}
                                          {task.error_message && (
                                            <div style={{ marginTop: 8 }}>
                                              <Text type="danger" style={{ fontSize: 11 }} ellipsis>
                                                {task.error_message}
                                              </Text>
                                            </div>
                                          )}
                                        </>
                                      }
                                    />
                                  </Card>
                                </Col>
                              );
                            })}
                          </Row>
                          {/* 加载更多指示器 */}
                          <div ref={tasksSentinelRef} style={{ textAlign: 'center', padding: '20px' }}>
                            {tasksLoading && (
                              <Spin tip="加载中...">
                                <div style={{ height: '60px' }} />
                              </Spin>
                            )}
                            {!tasksLoading && tasksHasMore && tasks.length > 0 && (
                              <Button onClick={() => loadTasks(true)}>加载更多</Button>
                            )}
                            {!tasksLoading && !tasksHasMore && tasks.length > 0 && (
                              <Text type="secondary">已加载全部数据</Text>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  )
                },
                {
                  key: 'once',
                  label: `定时执行任务 (${taskScheduleTab === 'once' ? tasksTotal : '-'})`,
                  children: (
                    <>
                      {tasks.length === 0 && !tasksLoading ? (
                        <Card>
                          <Empty description="暂无定时执行任务" />
                        </Card>
                      ) : (
                        <>
                          <Row gutter={[16, 16]}>
                            {/* 任务卡片内容与立即执行任务相同,此处省略 */}
                            {tasks.map((task) => (
                              <Col key={task.id} xs={24} sm={12} lg={8} xl={6}>
                                <Card
                                  hoverable
                                  onClick={() => router.push(`/crawler-data/douyin/tasks/${task.id}?view=tasks`)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <Empty description="任务卡片内容" />
                                </Card>
                              </Col>
                            ))}
                          </Row>
                          <div ref={tasksSentinelRef} style={{ textAlign: 'center', padding: '20px' }}>
                            {tasksLoading && <Spin tip="加载中..."><div style={{ height: '60px' }} /></Spin>}
                            {!tasksLoading && tasksHasMore && tasks.length > 0 && (
                              <Button onClick={() => loadTasks(true)}>加载更多</Button>
                            )}
                            {!tasksLoading && !tasksHasMore && tasks.length > 0 && (
                              <Text type="secondary">已加载全部数据</Text>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  )
                },
                {
                  key: 'cron',
                  label: `周期执行任务 (${taskScheduleTab === 'cron' ? tasksTotal : '-'})`,
                  children: (
                    <>
                      {tasks.length === 0 && !tasksLoading ? (
                        <Card>
                          <Empty description="暂无周期执行任务" />
                        </Card>
                      ) : (
                        <>
                          <Row gutter={[16, 16]}>
                            {/* 任务卡片内容与立即执行任务相同,此处省略 */}
                            {tasks.map((task) => (
                              <Col key={task.id} xs={24} sm={12} lg={8} xl={6}>
                                <Card
                                  hoverable
                                  onClick={() => router.push(`/crawler-data/douyin/tasks/${task.id}?view=tasks`)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <Empty description="任务卡片内容" />
                                </Card>
                              </Col>
                            ))}
                          </Row>
                          <div ref={tasksSentinelRef} style={{ textAlign: 'center', padding: '20px' }}>
                            {tasksLoading && <Spin tip="加载中..."><div style={{ height: '60px' }} /></Spin>}
                            {!tasksLoading && tasksHasMore && tasks.length > 0 && (
                              <Button onClick={() => loadTasks(true)}>加载更多</Button>
                            )}
                            {!tasksLoading && !tasksHasMore && tasks.length > 0 && (
                              <Text type="secondary">已加载全部数据</Text>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  )
                }
              ]}
            />
          </div>
        )}


        {/* 创作者表单 */}
        <Modal
          title="导入创作者"
          open={creatorFormVisible}
          onCancel={() => {
            setCreatorFormVisible(false);
            creatorForm.resetFields();
          }}
          onOk={() => creatorForm.submit()}
          confirmLoading={creatorCreating}
        >
          <Form
            form={creatorForm}
            layout="vertical"
            onFinish={handleCreateCreator}
          >
            <Form.Item
              label="用户ID"
              name="user_id"
              rules={[{ required: true, message: '请输入用户ID' }]}
            >
              <Input placeholder="请输入抖音用户ID" />
            </Form.Item>
            <Form.Item
              label="创作者主页URL（可选）"
              name="creator_url"
            >
              <Input placeholder="https://www.douyin.com/user/..." />
            </Form.Item>
            <Form.Item
              label="强制刷新"
              name="force_refresh"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Form>
        </Modal>

        {/* 任务表单 */}
        <Modal
          title="创建采集任务"
          open={taskFormVisible}
          onCancel={() => {
            setTaskFormVisible(false);
            taskForm.resetFields();
          }}
          onOk={() => taskForm.submit()}
          confirmLoading={taskCreating}
          width={800}
          style={{ top: 20 }}
        >
          <Form
            form={taskForm}
            layout="vertical"
            onFinish={handleCreateTask}
            initialValues={{
              max_count: 50,
              start_page: 1,
              publish_time_type: 0,
              enable_comments: true,
              max_comments_per_video: 100,
              include_sub_comments: false,
              max_sub_per_comment: 5,
              comment_sort_by: 'hot',
              enable_resume: true,
              enable_proxy: false,
              enable_media_download: true,
              download_images: true,
              download_videos: true,
              media_save_path: '/opt/data/douyin_media',
              max_image_size_mb: 50,
              max_video_size_mb: 5000,
              image_format: 'jpg',
              video_format: 'mp4',
              post_processing_config: {
                enabled: false,
                extract_transcript: false,
                denoise_transcript: false,
                rewrite_transcript: false,
                rewrite_style: 'natural',
                force_reprocess: false,
                batch_size: 10,
                concurrent_limit: 3,
              },
            }}
          >
            <Form.Item label="任务类型">
              <Select
                value={taskType}
                onChange={setTaskType}
                options={[
                  { label: '关键词搜索', value: 'search' },
                  { label: '单个视频', value: 'detail' },
                  { label: '创作者主页', value: 'creator' },
                ]}
              />
            </Form.Item>

            {/* 任务名称 */}
            <Form.Item
              label="任务名称"
              name="task_name"
              tooltip="为任务设置一个易于识别的名称"
            >
              <Input placeholder="留空将自动生成" />
            </Form.Item>

            <Divider orientation="left">调度配置</Divider>

            {/* 调度类型 */}
            <Form.Item
              label="调度类型"
              name="schedule_type"
              initialValue="immediate"
              rules={[{ required: true, message: '请选择调度类型' }]}
            >
              <Select
                onChange={(value) => setScheduleType(value)}
                options={[...DOUYIN_SCHEDULE_TYPE_OPTIONS]}
              />
            </Form.Item>

            {/* 定时执行时间 */}
            <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.schedule_type !== currentValues.schedule_type}>
              {({ getFieldValue }) =>
                getFieldValue('schedule_type') === 'once' ? (
                  <Form.Item
                    label="执行时间"
                    name="scheduled_time"
                    rules={[{ required: true, message: '请选择执行时间' }]}
                  >
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder="请选择执行时间"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                ) : null
              }
            </Form.Item>

            {/* Cron表达式 */}
            <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.schedule_type !== currentValues.schedule_type}>
              {({ getFieldValue }) =>
                getFieldValue('schedule_type') === 'cron' ? (
                  <Form.Item
                    label="Cron表达式"
                    name="cron_expression"
                    rules={[
                      { required: true, message: '请输入Cron表达式' },
                      {
                        pattern: /^(\*|[0-5]?\d)\s+(\*|[01]?\d|2[0-3])\s+(\*|[012]?\d|3[01])\s+(\*|[01]?\d)\s+(\*|[0-6])$/,
                        message: '请输入有效的Cron表达式（5个字段）'
                      }
                    ]}
                    extra="格式：分 时 日 月 周（例如：0 9 * * * 表示每天早上9点）"
                  >
                    <Input placeholder="0 9 * * *" />
                  </Form.Item>
                ) : null
              }
            </Form.Item>

            <Divider orientation="left">任务参数</Divider>

            {/* 搜索任务参数 */}
            {taskType === 'search' && (
              <>
                <Row gutter={16}>
                  <Col span={16}>
                    <Form.Item
                      label="搜索关键词"
                      name="keywords"
                      rules={[{ required: true, message: '请输入关键词' }]}
                    >
                      <Input placeholder="请输入搜索关键词，多个用逗号分隔" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="起始页码"
                      name="start_page"
                    >
                      <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="发布时间过滤"
                      name="publish_time_type"
                    >
                      <Select options={[...DOUYIN_PUBLISH_TIME_OPTIONS]} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="采集数量"
                      name="max_count"
                    >
                      <InputNumber min={1} max={500} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {/* 详情任务参数 */}
            {taskType === 'detail' && (
              <>
                <Form.Item
                  label="视频ID列表"
                  name="aweme_ids"
                  rules={[{ required: true, message: '请输入视频ID' }]}
                  tooltip="每行一个视频ID"
                >
                  <TextArea
                    rows={6}
                    placeholder="请输入视频ID，每行一个"
                  />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="采集数量"
                      name="max_count"
                      tooltip="如果不设置，将采集所有输入的视频ID"
                    >
                      <InputNumber min={1} max={500} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="起始页码"
                      name="start_page"
                    >
                      <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {/* 创作者任务参数 */}
            {taskType === 'creator' && (
              <>
                <Form.Item
                  label="用户ID"
                  name="user_id"
                  rules={[{ required: true, message: '请输入用户ID' }]}
                  tooltip="抖音创作者的用户ID（sec_uid）"
                >
                  <Input placeholder="请输入抖音用户ID" />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="采集数量"
                      name="max_count"
                    >
                      <InputNumber min={1} max={500} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="起始页码"
                      name="start_page"
                    >
                      <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}


            <Divider orientation="left">评论配置</Divider>

            <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.enable_comments !== currentValues.enable_comments}>
              {({ getFieldValue }) => (
                <>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="采集评论"
                        name="enable_comments"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                    {getFieldValue('enable_comments') && (
                      <Col span={12}>
                        <Form.Item
                          label="每个视频最大评论数"
                          name="max_comments_per_video"
                        >
                          <InputNumber min={0} max={500} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    )}
                  </Row>
                  {getFieldValue('enable_comments') && (
                    <>
                      <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.include_sub_comments !== currentValues.include_sub_comments}>
                        {({ getFieldValue: getSubFieldValue }) => (
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item
                                label="采集二级评论"
                                name="include_sub_comments"
                                valuePropName="checked"
                              >
                                <Switch />
                              </Form.Item>
                            </Col>
                            {getSubFieldValue('include_sub_comments') && (
                              <Col span={12}>
                                <Form.Item
                                  label="每条一级评论最多二级评论数"
                                  name="max_sub_per_comment"
                                >
                                  <InputNumber min={0} max={50} style={{ width: '100%' }} />
                                </Form.Item>
                              </Col>
                            )}
                          </Row>
                        )}
                      </Form.Item>
                      <Form.Item
                        label="评论排序方式"
                        name="comment_sort_by"
                      >
                        <Select options={[...DOUYIN_COMMENT_SORT_OPTIONS]} />
                      </Form.Item>
                    </>
                  )}
                </>
              )}
            </Form.Item>

            <Divider orientation="left">存储与代理配置</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="启用断点续爬"
                  name="enable_resume"
                  valuePropName="checked"
                  tooltip="任务中断后可以从中断处继续采集"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="启用代理"
                  name="enable_proxy"
                  valuePropName="checked"
                  tooltip="是否使用代理进行采集"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">媒体下载配置</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="下载图片"
                  name="download_images"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="下载视频"
                  name="download_videos"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="保存路径"
              name="media_save_path"
              tooltip="保存基础路径（相对于项目根目录或绝对路径）"
            >
              <Input placeholder="默认路径：/opt/data/douyin_media" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="图片最大大小(MB)"
                  name="max_image_size_mb"
                >
                  <InputNumber min={1} max={500} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="视频最大大小(MB)"
                  name="max_video_size_mb"
                >
                  <InputNumber min={1} max={5000} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="图片格式"
                  name="image_format"
                >
                  <Select options={[...DOUYIN_IMAGE_FORMAT_OPTIONS]} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="视频格式"
                  name="video_format"
                >
                  <Select options={[...DOUYIN_VIDEO_FORMAT_OPTIONS]} />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">后处理配置</Divider>

            <Form.Item
              label="启用后处理"
              name={['post_processing_config', 'enabled']}
              valuePropName="checked"
              tooltip="是否在采集完成后自动进行视频内容处理"
            >
              <Switch />
            </Form.Item>

            <Form.Item noStyle shouldUpdate={(prevValues, currentValues) =>
              prevValues.post_processing_config?.enabled !== currentValues.post_processing_config?.enabled
            }>
              {({ getFieldValue }) =>
                getFieldValue(['post_processing_config', 'enabled']) ? (
                  <>
                    <Row gutter={16}>
                      <Col span={6}>
                        <Form.Item
                          label="提取视频内容"
                          name={['post_processing_config', 'extract_transcript']}
                          valuePropName="checked"
                          tooltip="是否提取视频中的语音内容"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          label="内容去噪"
                          name={['post_processing_config', 'denoise_transcript']}
                          valuePropName="checked"
                          tooltip="是否对提取的内容进行去噪处理"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          label="内容重写"
                          name={['post_processing_config', 'rewrite_transcript']}
                          valuePropName="checked"
                          tooltip="是否对内容进行重写优化"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          label="强制重新处理"
                          name={['post_processing_config', 'force_reprocess']}
                          valuePropName="checked"
                          tooltip="是否强制重新处理已处理过的视频"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      label="重写风格"
                      name={['post_processing_config', 'rewrite_style']}
                      tooltip="内容重写时使用的风格"
                    >
                      <Select options={[
                        { label: '自然风格', value: 'natural' },
                        { label: '正式风格', value: 'formal' },
                        { label: '随意风格', value: 'casual' },
                      ]} />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="批量处理大小"
                          name={['post_processing_config', 'batch_size']}
                          tooltip="每次批量处理的视频数量"
                        >
                          <InputNumber min={1} max={50} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="并发处理数"
                          name={['post_processing_config', 'concurrent_limit']}
                          tooltip="同时处理视频的最大并发数"
                        >
                          <InputNumber min={1} max={10} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                ) : null
              }
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
}

// 导出的主组件
export default function DouyinPage() {
  return (
    <Suspense fallback={
      <MainLayout fullWidth>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    }>
      <DouyinPageContent />
    </Suspense>
  );
}
