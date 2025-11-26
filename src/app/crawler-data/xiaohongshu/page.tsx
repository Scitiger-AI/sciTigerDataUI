"use client";

import React, { useState, useCallback, useEffect, Suspense } from 'react';
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
  Modal,
  App,
  Segmented,
  Form,
  InputNumber,
  Switch,
  Tag,
  Statistic,
  Avatar,
  List,
  Tooltip,
  Divider,
  Image,
  DatePicker,
  Tabs,
  Collapse,
  Progress,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  FireOutlined,
  UserOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  FilterOutlined,
  HeartOutlined,
  CommentOutlined,
  StarOutlined,
  ShareAltOutlined,
  EyeOutlined,
  RobotOutlined,
  TeamOutlined,
  DeleteOutlined,
  DownloadOutlined,
  StopOutlined,
  ClockCircleOutlined,
  ScheduleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import MainLayout from '@/layout/MainLayout';
import xiaohongshuService from '@/services/xiaohongshu';
import type {
  XhsNote,
  XhsCreator,
  XhsTask,
  XhsComment,
  XhsNoteQuery,
  XhsCreatorQuery,
  CreateXhsTaskRequest,
  ScheduleType,
  SortType,
} from '@/types/xiaohongshu';
import {
  XHS_NOTE_TYPE_OPTIONS,
  XHS_SORT_OPTIONS,
  XHS_SORT_ORDER_OPTIONS,
  XHS_TASK_STATUS_CONFIG,
  XHS_TASK_TYPE_CONFIG,
  XHS_CREATOR_SORT_OPTIONS,
  SCHEDULE_TYPE_OPTIONS,
  SORT_TYPE_OPTIONS,
} from '@/types/xiaohongshu';
import XhsNoteCard from '@/components/xiaohongshu/XhsNoteCard';
import XhsTaskDetail from '@/components/xiaohongshu/XhsTaskDetail';
import XhsNoteDetail from '@/components/xiaohongshu/XhsNoteDetail';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;

// 视图模式类型
type ViewMode = 'notes' | 'creators' | 'tasks';

function XiaohongshuPageContent() {
  const { modal, message } = App.useApp();

  // 视图模式
  const [viewMode, setViewMode] = useState<ViewMode>('notes');

  // ============ 笔记视图状态 ============
  const [notes, setNotes] = useState<XhsNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesTotal, setNotesTotal] = useState(0);
  const [notesPage, setNotesPage] = useState(1);
  const [notesHasMore, setNotesHasMore] = useState(true);

  // 笔记筛选
  const [noteKeyword, setNoteKeyword] = useState('');
  const [noteType, setNoteType] = useState<string | undefined>();
  const [noteSortBy, setNoteSortBy] = useState('time');
  const [noteSortOrder, setNoteSortOrder] = useState<'asc' | 'desc'>('desc');

  // 笔记详情
  const [selectedNote, setSelectedNote] = useState<XhsNote | null>(null);
  const [noteDetailVisible, setNoteDetailVisible] = useState(false);

  // ============ 创作者视图状态 ============
  const [creators, setCreators] = useState<XhsCreator[]>([]);
  const [creatorsLoading, setCreatorsLoading] = useState(false);
  const [creatorsTotal, setCreatorsTotal] = useState(0);
  const [creatorsPage, setCreatorsPage] = useState(1);
  const [creatorsHasMore, setCreatorsHasMore] = useState(true);

  // 创作者筛选
  const [creatorKeyword, setCreatorKeyword] = useState('');
  const [creatorSortBy, setCreatorSortBy] = useState('fans');

  // 创作者表单
  const [creatorFormVisible, setCreatorFormVisible] = useState(false);
  const [creatorForm] = Form.useForm();
  const [creatorCreating, setCreatorCreating] = useState(false);

  // ============ 任务视图状态 ============
  const [tasks, setTasks] = useState<XhsTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksTotal, setTasksTotal] = useState(0);
  const [tasksPage, setTasksPage] = useState(1);

  // 任务表单
  const [taskFormVisible, setTaskFormVisible] = useState(false);
  const [taskForm] = Form.useForm();
  const [taskCreating, setTaskCreating] = useState(false);
  const [taskType, setTaskType] = useState<'search' | 'detail' | 'creator'>('search');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('immediate');

  // 任务详情
  const [selectedTask, setSelectedTask] = useState<XhsTask | null>(null);
  const [taskDetailVisible, setTaskDetailVisible] = useState(false);

  // ============ 笔记相关函数 ============

  const loadNotes = useCallback(async (append = false) => {
    setNotesLoading(true);
    try {
      const query: XhsNoteQuery = {
        keyword: noteKeyword || undefined,
        note_type: noteType,
        sort_by: noteSortBy,
        sort_order: noteSortOrder,
        page: append ? notesPage + 1 : 1,
        page_size: 20,
      };

      const response = await xiaohongshuService.getNotes(query);

      if (response.success && response.data) {
        const newNotes = response.data.items || [];
        setNotes(append ? [...notes, ...newNotes] : newNotes);
        setNotesTotal(response.data.total || 0);
        setNotesPage(append ? notesPage + 1 : 1);
        setNotesHasMore(newNotes.length === 20);
      }
    } catch (error: any) {
      message.error(error.message || '加载笔记失败');
    } finally {
      setNotesLoading(false);
    }
  }, [noteKeyword, noteType, noteSortBy, noteSortOrder, notesPage, notes, message]);

  const handleNoteSearch = useCallback((value: string) => {
    setNoteKeyword(value);
    setNotesPage(1);
  }, []);

  const handleViewNoteDetail = useCallback((note: XhsNote) => {
    setSelectedNote(note);
    setNoteDetailVisible(true);
  }, []);

  const handleDeleteNote = useCallback((note: XhsNote) => {
    modal.confirm({
      title: '确认删除',
      content: (
        <div>
          <p>确定要删除笔记 <strong>{note.title}</strong> 吗？</p>
          <p style={{ color: '#ff4d4f', fontSize: '12px' }}>
            此操作将同时删除笔记的评论和本地文件
          </p>
        </div>
      ),
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await xiaohongshuService.deleteNote(note.note_id, {
            delete_comments: true,
            delete_files: true,
          });
          message.success('删除成功');
          loadNotes(false);
        } catch (error: any) {
          message.error(error.response?.data?.message || '删除失败');
        }
      },
    });
  }, [modal, message, loadNotes]);

  const handleDownloadNote = useCallback(async (note: XhsNote) => {
    try {
      message.loading('正在下载笔记内容...', 0);
      await xiaohongshuService.downloadNote(note.note_id);
      message.destroy();
      message.success('下载成功');
      loadNotes(false);
    } catch (error: any) {
      message.destroy();
      message.error(error.response?.data?.message || '下载失败');
    }
  }, [message, loadNotes]);

  // ============ 创作者相关函数 ============

  const loadCreators = useCallback(async (append = false) => {
    setCreatorsLoading(true);
    try {
      const query: XhsCreatorQuery = {
        keyword: creatorKeyword || undefined,
        sort_by: creatorSortBy,
        page: append ? creatorsPage + 1 : 1,
        page_size: 20,
      };

      const response = await xiaohongshuService.getCreators(query);

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
  }, [creatorKeyword, creatorSortBy, creatorsPage, creators, message]);

  const handleCreateCreator = useCallback(async (values: any) => {
    setCreatorCreating(true);
    try {
      const response = await xiaohongshuService.createCreator(values);

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

  const handleDeleteCreator = useCallback((creator: XhsCreator) => {
    modal.confirm({
      title: '确认删除',
      content: (
        <div>
          <p>确定要删除创作者 <strong>{creator.nickname}</strong> 吗？</p>
          <p style={{ color: '#ff4d4f', fontSize: '12px' }}>
            此操作将同时删除创作者的所有笔记、评论和本地文件
          </p>
        </div>
      ),
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await xiaohongshuService.deleteCreator(creator.user_id, {
            delete_notes: true,
          });
          message.success('删除成功');
          loadCreators(false);
        } catch (error: any) {
          message.error(error.response?.data?.message || '删除失败');
        }
      },
    });
  }, [modal, message, loadCreators]);

  // ============ 任务相关函数 ============

  const loadTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const response = await xiaohongshuService.getTasks({
        page: tasksPage,
        page_size: 20,
      });

      if (response.success && response.data) {
        setTasks(response.data.items || []);
        setTasksTotal(response.data.total || 0);
      }
    } catch (error: any) {
      message.error(error.message || '加载任务失败');
    } finally {
      setTasksLoading(false);
    }
  }, [tasksPage, message]);

  const handleCreateTask = useCallback(async (values: any) => {
    setTaskCreating(true);
    try {
      const taskData: CreateXhsTaskRequest = {
        name: values.name,
        task_type: taskType,
        schedule_type: scheduleType,

        // 任务参数
        keywords: taskType === 'search' ? values.keywords : undefined,
        note_urls: taskType === 'detail' ? values.note_urls?.split('\n').filter((url: string) => url.trim()) : undefined,
        creator_urls: taskType === 'creator' ? values.creator_urls?.split('\n').filter((url: string) => url.trim()) : undefined,
        max_count: values.max_count,
        start_page: values.start_page,
        sort_type: values.sort_type,

        // 调度配置
        scheduled_time: scheduleType === 'once' && values.scheduled_time
          ? values.scheduled_time.toISOString()
          : undefined,
        cron_config: scheduleType === 'cron' && values.cron_expression
          ? {
              expression: values.cron_expression,
              timezone: values.cron_timezone || 'Asia/Shanghai',
            }
          : undefined,

        // 评论配置
        comment_config: {
          enabled: values.enable_comments || false,
          max_per_note: values.max_comments_per_note || 100,
          fetch_sub_comments: values.fetch_sub_comments || false,
        },

        // 媒体下载配置
        media_download_config: {
          enabled: values.enable_media_download || false,
          download_images: values.download_images !== false,
          download_videos: values.download_videos !== false,
          save_path: values.media_save_path || null,
          max_image_size_mb: values.max_image_size_mb || 50,
          max_video_size_mb: values.max_video_size_mb || 500,
          image_format: values.image_format || 'jpg',
          video_format: values.video_format || 'mp4',
        },

        // 后处理配置
        post_processing_config: {
          enabled: values.enable_post_processing || false,
          asr: values.enable_asr ? {
            enabled: true,
            provider: values.asr_provider || 'whisper',
            language: values.asr_language || 'zh',
            save_to_file: values.asr_save_to_file !== false,
          } : undefined,
          denoise: values.enable_denoise ? {
            enabled: true,
            save_to_file: values.denoise_save_to_file !== false,
          } : undefined,
          rewrite: values.enable_rewrite ? {
            enabled: true,
            save_to_file: values.rewrite_save_to_file !== false,
          } : undefined,
          extract_keywords: values.extract_keywords || false,
          auto_classify: values.auto_classify || false,
        },

        // 其他配置
        enable_proxy: values.enable_proxy || false,
        enable_resume: values.enable_resume !== false,
        save_to_mongodb: values.save_to_mongodb !== false,
      };

      const response = await xiaohongshuService.createTask(taskData);

      if (response.success) {
        message.success('任务创建成功');
        setTaskFormVisible(false);
        taskForm.resetFields();
        loadTasks();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '创建任务失败');
    } finally {
      setTaskCreating(false);
    }
  }, [taskType, scheduleType, taskForm, message, loadTasks]);

  const handleViewTaskDetail = useCallback((task: XhsTask) => {
    setSelectedTask(task);
    setTaskDetailVisible(true);
  }, []);

  const handleDeleteTask = useCallback((task: XhsTask) => {
    modal.confirm({
      title: '确认删除',
      content: (
        <div>
          <p>确定要删除任务 <strong>{task.name}</strong> 吗？</p>
          <p style={{ color: '#ff4d4f', fontSize: '12px' }}>
            此操作将同时删除任务的所有结果数据
          </p>
        </div>
      ),
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await xiaohongshuService.deleteTask(task.id, {
            delete_results: true,
          });
          message.success('删除成功');
          loadTasks();
        } catch (error: any) {
          message.error(error.response?.data?.message || '删除失败');
        }
      },
    });
  }, [modal, message, loadTasks]);

  const handleCancelTask = useCallback(async (task: XhsTask) => {
    try {
      await xiaohongshuService.cancelTask(task.id);
      message.success('任务已取消');
      loadTasks();
    } catch (error: any) {
      message.error(error.response?.data?.message || '取消失败');
    }
  }, [message, loadTasks]);

  // ============ 初始化加载 ============

  useEffect(() => {
    if (viewMode === 'notes') {
      loadNotes(false);
    } else if (viewMode === 'creators') {
      loadCreators(false);
    } else if (viewMode === 'tasks') {
      loadTasks();
    }
  }, [viewMode, noteKeyword, noteType, noteSortBy, noteSortOrder, creatorKeyword, creatorSortBy]);

  return (
    <MainLayout fullWidth>
      <div style={{ padding: '24px' }}>
        {/* 页面标题和操作栏 */}
        <Card>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Title level={2} style={{ margin: 0, marginBottom: '8px' }}>
                  <FireOutlined style={{ color: '#ff2442', marginRight: '12px' }} />
                  小红书数据管理
                </Title>
                <Text type="secondary">
                  {viewMode === 'notes' && '浏览和管理小红书笔记，支持搜索和筛选'}
                  {viewMode === 'creators' && '管理小红书创作者信息'}
                  {viewMode === 'tasks' && '创建和管理采集任务'}
                </Text>
                <div style={{ marginTop: '8px' }}>
                  <Text strong>
                    {viewMode === 'notes' && `总计: ${notesTotal.toLocaleString()} 篇笔记`}
                    {viewMode === 'creators' && `总计: ${creatorsTotal.toLocaleString()} 个创作者`}
                    {viewMode === 'tasks' && `总计: ${tasksTotal.toLocaleString()} 个任务`}
                  </Text>
                </div>
              </div>
              <Space>
                {/* 视图切换 */}
                <Segmented
                  value={viewMode}
                  onChange={(value) => setViewMode(value as ViewMode)}
                  options={[
                    {
                      label: (
                        <Space>
                          <AppstoreOutlined />
                          <span>笔记</span>
                        </Space>
                      ),
                      value: 'notes',
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
                    if (viewMode === 'notes') loadNotes(false);
                    else if (viewMode === 'creators') loadCreators(false);
                    else loadTasks();
                  }}
                  loading={notesLoading || creatorsLoading || tasksLoading}
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
                {viewMode === 'tasks' && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setTaskFormVisible(true)}
                  >
                    创建任务
                  </Button>
                )}
              </Space>
            </div>
          </div>

          {/* 笔记视图 - 搜索和筛选 */}
          {viewMode === 'notes' && (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={8}>
                <Search
                  placeholder="搜索笔记标题、描述"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  value={noteKeyword}
                  onChange={(e) => setNoteKeyword(e.target.value)}
                  onSearch={handleNoteSearch}
                />
              </Col>
              <Col xs={24} sm={6} lg={4}>
                <Select
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="笔记类型"
                  allowClear
                  value={noteType}
                  onChange={setNoteType}
                  options={XHS_NOTE_TYPE_OPTIONS}
                />
              </Col>
              <Col xs={24} sm={6} lg={4}>
                <Select
                  style={{ width: '100%' }}
                  size="large"
                  value={noteSortBy}
                  onChange={setNoteSortBy}
                  options={XHS_SORT_OPTIONS}
                />
              </Col>
              <Col xs={24} sm={6} lg={4}>
                <Select
                  style={{ width: '100%' }}
                  size="large"
                  value={noteSortOrder}
                  onChange={setNoteSortOrder}
                  options={XHS_SORT_ORDER_OPTIONS}
                />
              </Col>
            </Row>
          )}

          {/* 创作者视图 - 搜索和筛选 */}
          {viewMode === 'creators' && (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={12}>
                <Search
                  placeholder="搜索创作者昵称"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  value={creatorKeyword}
                  onChange={(e) => setCreatorKeyword(e.target.value)}
                />
              </Col>
              <Col xs={24} sm={6} lg={6}>
                <Select
                  style={{ width: '100%' }}
                  size="large"
                  value={creatorSortBy}
                  onChange={setCreatorSortBy}
                  options={XHS_CREATOR_SORT_OPTIONS}
                />
              </Col>
            </Row>
          )}
        </Card>

        {/* 笔记列表 */}
        {viewMode === 'notes' && (
          <div style={{ marginTop: '24px' }}>
            {notes.length === 0 && !notesLoading ? (
              <Card>
                <Empty description="暂无笔记数据" />
              </Card>
            ) : (
              <>
                <Row gutter={[16, 16]}>
                  {notes.map((note) => (
                    <Col key={note.id} xs={24} sm={12} lg={8} xl={6}>
                      <XhsNoteCard
                        note={note}
                        onView={handleViewNoteDetail}
                        onDelete={handleDeleteNote}
                        onDownload={handleDownloadNote}
                      />
                    </Col>
                  ))}
                </Row>
                {notesLoading && (
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <Spin />
                  </div>
                )}
                {!notesLoading && notesHasMore && (
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <Button onClick={() => loadNotes(true)}>加载更多</Button>
                  </div>
                )}
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
                  {creators.map((creator) => (
                    <Col key={creator.id} xs={24} sm={12} lg={8} xl={6}>
                      <Card
                        hoverable
                        actions={[
                          <Tooltip title="查看详情" key="view">
                            <EyeOutlined />
                          </Tooltip>,
                          <Popconfirm
                            key="delete"
                            title="确认删除"
                            description="此操作将同时删除创作者的所有笔记"
                            onConfirm={() => handleDeleteCreator(creator)}
                            okText="确认"
                            cancelText="取消"
                          >
                            <DeleteOutlined style={{ color: '#ff4d4f' }} />
                          </Popconfirm>,
                        ]}
                      >
                        <Card.Meta
                          avatar={<Avatar size={64} src={creator.avatar} icon={<UserOutlined />} />}
                          title={creator.nickname}
                          description={
                            <>
                              <Paragraph
                                ellipsis={{ rows: 2 }}
                                style={{ marginBottom: 12, minHeight: 44 }}
                              >
                                {creator.desc || '暂无简介'}
                              </Paragraph>
                              <Row gutter={8}>
                                <Col span={12}>
                                  <Statistic
                                    title="粉丝"
                                    value={creator.fans}
                                    valueStyle={{ fontSize: 16 }}
                                  />
                                </Col>
                                <Col span={12}>
                                  <Statistic
                                    title="笔记"
                                    value={creator.notes_count}
                                    valueStyle={{ fontSize: 16 }}
                                  />
                                </Col>
                              </Row>
                            </>
                          }
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
                {creatorsLoading && (
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <Spin />
                  </div>
                )}
                {!creatorsLoading && creatorsHasMore && (
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <Button onClick={() => loadCreators(true)}>加载更多</Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* 任务列表 */}
        {viewMode === 'tasks' && (
          <div style={{ marginTop: '24px' }}>
            <Card>
              <List
                loading={tasksLoading}
                dataSource={tasks}
                locale={{ emptyText: '暂无任务' }}
                renderItem={(task) => (
                  <List.Item
                    actions={[
                      <Button
                        key="view"
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewTaskDetail(task)}
                      >
                        详情
                      </Button>,
                      task.status === 'running' && (
                        <Popconfirm
                          key="cancel"
                          title="确认取消"
                          description="确定要取消此任务吗？"
                          onConfirm={() => handleCancelTask(task)}
                          okText="确认"
                          cancelText="取消"
                        >
                          <Button type="link" danger icon={<StopOutlined />}>
                            取消
                          </Button>
                        </Popconfirm>
                      ),
                      <Popconfirm
                        key="delete"
                        title="确认删除"
                        description="此操作将同时删除任务的所有结果"
                        onConfirm={() => handleDeleteTask(task)}
                        okText="确认"
                        cancelText="取消"
                      >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                          删除
                        </Button>
                      </Popconfirm>,
                    ].filter(Boolean)}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{task.name}</Text>
                          <Tag color={XHS_TASK_STATUS_CONFIG[task.status].color}>
                            {XHS_TASK_STATUS_CONFIG[task.status].text}
                          </Tag>
                          <Tag color={XHS_TASK_TYPE_CONFIG[task.task_type].color}>
                            {XHS_TASK_TYPE_CONFIG[task.task_type].text}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Text type="secondary">
                            创建时间: {task.created_at ? new Date(task.created_at).toLocaleString() : '-'}
                          </Text>
                          {task.progress && (
                            <div>
                              <Text type="secondary" style={{ marginRight: 8 }}>
                                进度: {task.progress.current} / {task.progress.total}
                              </Text>
                              <Progress
                                percent={task.progress.percentage}
                                size="small"
                                style={{ maxWidth: 200 }}
                              />
                            </div>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>
        )}

        {/* 笔记详情弹窗 */}
        <Modal
          title="笔记详情"
          open={noteDetailVisible}
          onCancel={() => {
            setNoteDetailVisible(false);
            setSelectedNote(null);
          }}
          width={1000}
          footer={null}
        >
          <XhsNoteDetail
            note={selectedNote}
            showActions={true}
            onRefresh={() => {
              setNoteDetailVisible(false);
              loadNotes(false);
            }}
          />
        </Modal>

        {/* 任务详情弹窗 */}
        <Modal
          title="任务详情"
          open={taskDetailVisible}
          onCancel={() => {
            setTaskDetailVisible(false);
            setSelectedTask(null);
          }}
          width={1000}
          footer={[
            <Button key="close" onClick={() => setTaskDetailVisible(false)}>
              关闭
            </Button>,
          ]}
        >
          <XhsTaskDetail task={selectedTask} />
        </Modal>

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
              <Input placeholder="请输入小红书用户ID" />
            </Form.Item>
            <Form.Item
              label="创作者主页URL（可选）"
              name="creator_url"
            >
              <Input placeholder="https://www.xiaohongshu.com/user/profile/..." />
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

        {/* 任务创建表单 - 完全重构 */}
        <Modal
          title="创建采集任务"
          open={taskFormVisible}
          onCancel={() => {
            setTaskFormVisible(false);
            taskForm.resetFields();
            setScheduleType('immediate');
          }}
          onOk={() => taskForm.submit()}
          confirmLoading={taskCreating}
          width={800}
          styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
        >
          <Form
            form={taskForm}
            layout="vertical"
            onFinish={handleCreateTask}
          >
            {/* 基础配置 */}
            <Divider orientation="left">基础配置</Divider>

            <Form.Item
              label="任务名称"
              name="name"
              rules={[{ required: true, message: '请输入任务名称' }]}
            >
              <Input placeholder="为任务起一个名字" />
            </Form.Item>

            <Form.Item label="任务类型">
              <Select
                value={taskType}
                onChange={setTaskType}
                options={[
                  { label: '关键词搜索', value: 'search' },
                  { label: '笔记详情', value: 'detail' },
                  { label: '创作者主页', value: 'creator' },
                ]}
              />
            </Form.Item>

            <Form.Item label="调度类型">
              <Select
                value={scheduleType}
                onChange={setScheduleType}
                options={SCHEDULE_TYPE_OPTIONS}
              />
            </Form.Item>

            {scheduleType === 'once' && (
              <Form.Item
                label="执行时间"
                name="scheduled_time"
                rules={[{ required: true, message: '请选择执行时间' }]}
              >
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder="选择任务执行时间"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            )}

            {scheduleType === 'cron' && (
              <>
                <Form.Item
                  label="Cron 表达式"
                  name="cron_expression"
                  rules={[{ required: true, message: '请输入 Cron 表达式' }]}
                  tooltip="例如: 0 9 * * * (每天9点执行)"
                >
                  <Input placeholder="0 9 * * *" />
                </Form.Item>
                <Form.Item
                  label="时区"
                  name="cron_timezone"
                  initialValue="Asia/Shanghai"
                >
                  <Input />
                </Form.Item>
              </>
            )}

            {/* 任务参数 */}
            <Divider orientation="left">任务参数</Divider>

            {taskType === 'search' && (
              <>
                <Form.Item
                  label="搜索关键词"
                  name="keywords"
                  rules={[{ required: true, message: '请输入关键词' }]}
                >
                  <Input placeholder="请输入搜索关键词" />
                </Form.Item>
                <Form.Item
                  label="排序方式"
                  name="sort_type"
                  initialValue="general"
                >
                  <Select options={SORT_TYPE_OPTIONS} />
                </Form.Item>
                <Form.Item
                  label="采集数量"
                  name="max_count"
                  initialValue={50}
                >
                  <InputNumber min={1} max={1000} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                  label="起始页码"
                  name="start_page"
                  initialValue={1}
                >
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </>
            )}

            {taskType === 'detail' && (
              <Form.Item
                label="笔记URL列表"
                name="note_urls"
                rules={[{ required: true, message: '请输入笔记URL' }]}
                tooltip="每行一个笔记URL"
              >
                <TextArea
                  rows={6}
                  placeholder="请输入笔记URL，每行一个&#10;https://www.xiaohongshu.com/explore/..."
                />
              </Form.Item>
            )}

            {taskType === 'creator' && (
              <Form.Item
                label="创作者URL列表"
                name="creator_urls"
                rules={[{ required: true, message: '请输入创作者URL' }]}
                tooltip="每行一个创作者URL"
              >
                <TextArea
                  rows={6}
                  placeholder="请输入创作者URL，每行一个&#10;https://www.xiaohongshu.com/user/profile/..."
                />
              </Form.Item>
            )}

            {/* 评论配置 */}
            <Divider orientation="left">评论配置</Divider>

            <Form.Item
              label="采集评论"
              name="enable_comments"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>

            <Form.Item dependencies={['enable_comments']} noStyle>
              {({ getFieldValue }) =>
                getFieldValue('enable_comments') ? (
                  <>
                    <Form.Item
                      label="每篇笔记最大评论数"
                      name="max_comments_per_note"
                      initialValue={100}
                    >
                      <InputNumber min={1} max={1000} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                      label="采集子评论"
                      name="fetch_sub_comments"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </>
                ) : null
              }
            </Form.Item>

            {/* 媒体下载配置 */}
            <Divider orientation="left">媒体下载</Divider>

            <Form.Item
              label="启用媒体下载"
              name="enable_media_download"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item dependencies={['enable_media_download']} noStyle>
              {({ getFieldValue }) =>
                getFieldValue('enable_media_download') ? (
                  <>
                    <Form.Item
                      label="下载图片"
                      name="download_images"
                      valuePropName="checked"
                      initialValue={true}
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      label="下载视频"
                      name="download_videos"
                      valuePropName="checked"
                      initialValue={true}
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      label="保存路径"
                      name="media_save_path"
                      tooltip="留空使用默认路径"
                    >
                      <Input placeholder="留空使用默认路径" />
                    </Form.Item>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="图片最大尺寸(MB)"
                          name="max_image_size_mb"
                          initialValue={50}
                        >
                          <InputNumber min={1} max={500} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="视频最大尺寸(MB)"
                          name="max_video_size_mb"
                          initialValue={500}
                        >
                          <InputNumber min={1} max={5000} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                ) : null
              }
            </Form.Item>

            {/* 后处理配置 */}
            <Divider orientation="left">后处理配置</Divider>

            <Form.Item
              label="启用后处理"
              name="enable_post_processing"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item dependencies={['enable_post_processing']} noStyle>
              {({ getFieldValue }) =>
                getFieldValue('enable_post_processing') ? (
                  <Collapse>
                    <Panel header="ASR 语音识别" key="asr">
                      <Form.Item
                        label="启用 ASR"
                        name="enable_asr"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      <Form.Item dependencies={['enable_asr']} noStyle>
                        {({ getFieldValue: getASRFieldValue }) =>
                          getASRFieldValue('enable_asr') ? (
                            <>
                              <Form.Item
                                label="ASR 提供商"
                                name="asr_provider"
                                initialValue="whisper"
                              >
                                <Select
                                  options={[
                                    { label: 'Whisper', value: 'whisper' },
                                    { label: 'Azure', value: 'azure' },
                                    { label: 'Aliyun', value: 'aliyun' },
                                  ]}
                                />
                              </Form.Item>
                              <Form.Item
                                label="语言"
                                name="asr_language"
                                initialValue="zh"
                              >
                                <Select
                                  options={[
                                    { label: '中文', value: 'zh' },
                                    { label: '英文', value: 'en' },
                                  ]}
                                />
                              </Form.Item>
                            </>
                          ) : null
                        }
                      </Form.Item>
                    </Panel>

                    <Panel header="内容去噪" key="denoise">
                      <Form.Item
                        label="启用去噪"
                        name="enable_denoise"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      <Form.Item
                        label="保存为文件"
                        name="denoise_save_to_file"
                        valuePropName="checked"
                        initialValue={true}
                      >
                        <Switch />
                      </Form.Item>
                    </Panel>

                    <Panel header="内容重写" key="rewrite">
                      <Form.Item
                        label="启用重写"
                        name="enable_rewrite"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      <Form.Item
                        label="保存为文件"
                        name="rewrite_save_to_file"
                        valuePropName="checked"
                        initialValue={true}
                      >
                        <Switch />
                      </Form.Item>
                    </Panel>

                    <Panel header="其他处理" key="other">
                      <Form.Item
                        label="提取关键词"
                        name="extract_keywords"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      <Form.Item
                        label="自动分类"
                        name="auto_classify"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Panel>
                  </Collapse>
                ) : null
              }
            </Form.Item>

            {/* 高级选项 */}
            <Divider orientation="left">高级选项</Divider>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="启用代理"
                  name="enable_proxy"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="断点续爬"
                  name="enable_resume"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="保存到MongoDB"
                  name="save_to_mongodb"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
}

// 导出的主组件
export default function XiaohongshuPage() {
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
      <XiaohongshuPageContent />
    </Suspense>
  );
}
