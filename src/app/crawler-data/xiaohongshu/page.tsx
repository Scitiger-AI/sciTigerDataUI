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
} from '@ant-design/icons';
import MainLayout from '@/layout/MainLayout';
import xiaohongshuService from '@/services/xiaohongshu';
import type {
  XhsNote,
  XhsCreator,
  XhsTask,
  XhsComment,
  XhsNoteQuery,
  XhsCreatorQuery,
  CreateXhsSearchTaskRequest,
  CreateXhsCreatorTaskRequest,
} from '@/types/xiaohongshu';
import {
  XHS_NOTE_TYPE_OPTIONS,
  XHS_SORT_OPTIONS,
  XHS_SORT_ORDER_OPTIONS,
  XHS_TASK_STATUS_CONFIG,
  XHS_TASK_TYPE_CONFIG,
  XHS_CREATOR_SORT_OPTIONS,
} from '@/types/xiaohongshu';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TextArea } = Input;

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
  const [noteComments, setNoteComments] = useState<XhsComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

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
  const [taskType, setTaskType] = useState<'search' | 'detail'>('search');

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

  const handleViewNoteDetail = useCallback(async (note: XhsNote) => {
    setSelectedNote(note);
    setNoteDetailVisible(true);
    setCommentsLoading(true);

    try {
      const response = await xiaohongshuService.getNoteComments({
        note_id: note.note_id,
        page: 1,
        page_size: 50,
      });

      if (response.success && response.data) {
        setNoteComments(response.data.items || []);
      }
    } catch (error: any) {
      console.error('加载评论失败:', error);
    } finally {
      setCommentsLoading(false);
    }
  }, []);

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
      const data: CreateXhsCreatorTaskRequest = {
        user_id: values.user_id,
        creator_url: values.creator_url,
        force_refresh: values.force_refresh || false,
      };

      const response = await xiaohongshuService.createCreator(data);

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
      let response;

      if (taskType === 'search') {
        const data: CreateXhsSearchTaskRequest = {
          task_type: 'search',
          keywords: values.keywords,
          max_count: values.max_count || 50,
          comment_config: {
            enabled: values.enable_comments || false,
            max_per_note: values.max_comments_per_note || 100,
          },
        };
        response = await xiaohongshuService.createSearchTask(data);
      } else {
        const noteIds = values.note_ids?.split('\n').filter((id: string) => id.trim());
        response = await xiaohongshuService.createDetailTask({
          task_type: 'detail',
          note_ids: noteIds,
          comment_config: {
            enabled: values.enable_comments || false,
            max_per_note: values.max_comments_per_note || 100,
          },
        });
      }

      if (response.success) {
        message.success('任务创建成功');
        setTaskFormVisible(false);
        taskForm.resetFields();
        loadTasks();
      }
    } catch (error: any) {
      message.error(error.message || '创建任务失败');
    } finally {
      setTaskCreating(false);
    }
  }, [taskType, taskForm, message, loadTasks]);

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
                      <Card
                        hoverable
                        cover={
                          note.image_list && note.image_list.length > 0 ? (
                            <div style={{ height: 200, overflow: 'hidden', background: '#f0f0f0' }}>
                              <Image
                                alt={note.title}
                                src={note.image_list[0]}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                preview={false}
                              />
                            </div>
                          ) : (
                            <div style={{ height: 200, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FireOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                            </div>
                          )
                        }
                        actions={[
                          <Tooltip title="查看详情" key="view">
                            <EyeOutlined onClick={() => handleViewNoteDetail(note)} />
                          </Tooltip>,
                          <Tooltip title={`${note.liked_count} 点赞`} key="like">
                            <HeartOutlined />
                          </Tooltip>,
                          <Tooltip title={`${note.comment_count} 评论`} key="comment">
                            <CommentOutlined />
                          </Tooltip>,
                        ]}
                      >
                        <Card.Meta
                          avatar={<Avatar src={note.avatar} icon={<UserOutlined />} />}
                          title={
                            <div style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {note.title}
                            </div>
                          }
                          description={
                            <>
                              <div style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                marginBottom: 8,
                              }}>
                                {note.desc}
                              </div>
                              <Space size="small">
                                <Tag color="blue">{note.type === 'video' ? '视频' : '图文'}</Tag>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  @{note.nickname}
                                </Text>
                              </Space>
                            </>
                          }
                        />
                      </Card>
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
                      <Card hoverable>
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
                      <Tag color={XHS_TASK_STATUS_CONFIG[task.status].color} key="status">
                        {XHS_TASK_STATUS_CONFIG[task.status].text}
                      </Tag>,
                      <Tag color={XHS_TASK_TYPE_CONFIG[task.task_type].color} key="type">
                        {XHS_TASK_TYPE_CONFIG[task.task_type].text}
                      </Tag>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{task.task_id}</Text>
                          {task.keywords && <Text type="secondary">关键词: {task.keywords}</Text>}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small">
                          <Text type="secondary">
                            创建时间: {task.created_at || '-'}
                          </Text>
                          {task.total_notes !== undefined && (
                            <Text>
                              进度: {task.crawled_notes || 0} / {task.total_notes || 0}
                            </Text>
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
            setNoteComments([]);
          }}
          width={800}
          footer={[
            <Button key="close" onClick={() => setNoteDetailVisible(false)}>
              关闭
            </Button>,
            <Tooltip title="功能开发中" key="ai">
              <Button icon={<RobotOutlined />} disabled>
                AI去噪
              </Button>
            </Tooltip>,
            <Tooltip title="功能开发中" key="rewrite">
              <Button icon={<RobotOutlined />} disabled>
                AI重写
              </Button>
            </Tooltip>,
          ]}
        >
          {selectedNote && (
            <div>
              <Title level={4}>{selectedNote.title}</Title>
              <Space style={{ marginBottom: 16 }}>
                <Avatar src={selectedNote.avatar} icon={<UserOutlined />} />
                <Text strong>{selectedNote.nickname}</Text>
                <Tag>{selectedNote.type === 'video' ? '视频' : '图文'}</Tag>
              </Space>

              <Paragraph>{selectedNote.desc}</Paragraph>

              {/* 互动数据 */}
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <Statistic
                    title="点赞"
                    value={selectedNote.liked_count}
                    prefix={<HeartOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="收藏"
                    value={selectedNote.collected_count}
                    prefix={<StarOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="评论"
                    value={selectedNote.comment_count}
                    prefix={<CommentOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="分享"
                    value={selectedNote.share_count}
                    prefix={<ShareAltOutlined />}
                  />
                </Col>
              </Row>

              {/* 图片列表 */}
              {selectedNote.image_list && selectedNote.image_list.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <Image.PreviewGroup>
                    <Space wrap>
                      {selectedNote.image_list.map((img, idx) => (
                        <Image
                          key={idx}
                          width={100}
                          height={100}
                          src={img}
                          style={{ objectFit: 'cover' }}
                        />
                      ))}
                    </Space>
                  </Image.PreviewGroup>
                </div>
              )}

              <Divider>评论列表 ({noteComments.length})</Divider>

              {/* 评论列表 */}
              {commentsLoading ? (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <Spin />
                </div>
              ) : noteComments.length === 0 ? (
                <Empty description="暂无评论" />
              ) : (
                <List
                  dataSource={noteComments}
                  renderItem={(comment) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={comment.avatar} icon={<UserOutlined />} />}
                        title={
                          <Space>
                            <Text strong>{comment.nickname}</Text>
                            {comment.ip_location && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {comment.ip_location}
                              </Text>
                            )}
                          </Space>
                        }
                        description={
                          <>
                            <div>{comment.content}</div>
                            <Space size="small" style={{ marginTop: 8 }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {new Date(comment.create_time * 1000).toLocaleString()}
                              </Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                <HeartOutlined /> {comment.like_count}
                              </Text>
                            </Space>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </div>
          )}
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
          width={600}
        >
          <Form
            form={taskForm}
            layout="vertical"
            onFinish={handleCreateTask}
          >
            <Form.Item label="任务类型">
              <Select
                value={taskType}
                onChange={setTaskType}
                options={[
                  { label: '关键词搜索', value: 'search' },
                  { label: '单篇笔记', value: 'detail' },
                ]}
              />
            </Form.Item>

            {taskType === 'search' ? (
              <>
                <Form.Item
                  label="搜索关键词"
                  name="keywords"
                  rules={[{ required: true, message: '请输入关键词' }]}
                >
                  <Input placeholder="请输入搜索关键词" />
                </Form.Item>
                <Form.Item
                  label="采集数量"
                  name="max_count"
                  initialValue={50}
                >
                  <InputNumber min={1} max={500} style={{ width: '100%' }} />
                </Form.Item>
              </>
            ) : (
              <Form.Item
                label="笔记ID列表"
                name="note_ids"
                rules={[{ required: true, message: '请输入笔记ID' }]}
                tooltip="每行一个笔记ID"
              >
                <TextArea
                  rows={6}
                  placeholder="请输入笔记ID，每行一个"
                />
              </Form.Item>
            )}

            <Form.Item
              label="采集评论"
              name="enable_comments"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>

            <Form.Item
              label="每篇笔记最大评论数"
              name="max_comments_per_note"
              initialValue={100}
            >
              <InputNumber min={1} max={1000} style={{ width: '100%' }} />
            </Form.Item>
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
