"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    Card,
    Button,
    Space,
    Typography,
    Tag,
    Spin,
    message,
    Tabs,
    Statistic,
    Row,
    Col,
    Alert,
    List,
    Tooltip,
} from 'antd';
import {
    FileTextOutlined,
    ThunderboltOutlined,
    ClearOutlined,
    EditOutlined,
    CopyOutlined,
    ReloadOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import type { DouyinVideo } from '@/types/douyin';
import douyinService from '@/services/douyin';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

interface VideoTranscriptCardProps {
    video: DouyinVideo;
    onRefresh?: () => void;
    videoRef?: React.RefObject<HTMLVideoElement | null>; // 视频播放器引用,用于同步
}

// 时间格式化工具函数:将毫秒转换为 MM:SS 格式
const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const VideoTranscriptCard: React.FC<VideoTranscriptCardProps> = ({ video, onRefresh, videoRef }) => {
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState<'extract' | 'denoise' | 'rewrite' | null>(null);
    const [currentTime, setCurrentTime] = useState(0); // 当前视频播放时间(秒)
    const listContainerRef = useRef<HTMLDivElement>(null); // 滚动容器引用

    // 检查是否有文案数据
    const hasTranscript = video.transcript_info?.has_transcript;
    const hasDenoised = video.denoised_transcript?.has_denoised;
    const hasRewritten = video.rewritten_transcript?.has_rewritten;

    // 检查是否有时间轴数据
    const hasSegments = video.transcript_info?.transcript_segments &&
        video.transcript_info.transcript_segments.length > 0;

    // 计算去噪文案字数(优先使用后端字段,否则前端计算)
    const denoisedWordCount = video.denoised_transcript?.denoised_length
        || video.denoised_transcript?.denoised_text?.length
        || 0;

    // 计算重写文案字数(优先使用后端字段,否则前端计算)
    const rewrittenWordCount = video.rewritten_transcript?.rewritten_length
        || video.rewritten_transcript?.rewritten_text?.length
        || 0;

    // 提取文案
    const handleExtract = async () => {
        try {
            setProcessing('extract');
            setLoading(true);

            const response = await douyinService.extractTranscript(video.aweme_id, true);

            if (response.success) {
                message.success(`文案提取成功！字数：${response.data.word_count}，耗时：${response.data.processing_time}秒`);
                onRefresh?.();
            } else {
                message.error(response.message || '提取失败');
            }
        } catch (error: any) {
            console.error('提取文案失败:', error);
            message.error(error.message || '提取文案失败');
        } finally {
            setLoading(false);
            setProcessing(null);
        }
    };

    // 去噪文案
    const handleDenoise = async () => {
        try {
            setProcessing('denoise');
            setLoading(true);

            const response = await douyinService.denoiseTranscript(video.aweme_id, {
                force_reprocess: hasDenoised,  // 如果已去噪,则强制重新处理
                auto_extract: true
            });

            if (response.success) {
                message.success(`去噪成功！压缩率：${(response.data.reduction_rate * 100).toFixed(1)}%`);
                onRefresh?.();
            } else {
                message.error(response.message || '去噪失败');
            }
        } catch (error: any) {
            console.error('去噪文案失败:', error);
            message.error(error.message || '去噪文案失败');
        } finally {
            setLoading(false);
            setProcessing(null);
        }
    };

    // 重写文案
    const handleRewrite = async () => {
        try {
            setProcessing('rewrite');
            setLoading(true);

            const response = await douyinService.rewriteTranscript(video.aweme_id, {
                force_reprocess: hasRewritten,  // 如果已重写,则强制重新处理
                auto_denoise: true,
                style: 'natural'
            });

            if (response.success) {
                message.success(`重写成功！耗时：${response.data.processing_time}秒`);
                onRefresh?.();
            } else {
                message.error(response.message || '重写失败');
            }
        } catch (error: any) {
            console.error('重写文案失败:', error);
            message.error(error.message || '重写文案失败');
        } finally {
            setLoading(false);
            setProcessing(null);
        }
    };

    // 复制文本
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        message.success('已复制到剪贴板');
    };

    // 监听视频播放时间更新
    React.useEffect(() => {
        if (!videoRef?.current) return;

        const videoElement = videoRef.current;
        const handleTimeUpdate = () => {
            setCurrentTime(videoElement.currentTime);
        };

        videoElement.addEventListener('timeupdate', handleTimeUpdate);
        return () => {
            videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [videoRef]);

    // 跳转到视频指定时间
    const handleSeekToTime = (timeInMs: number) => {
        if (!videoRef?.current) {
            message.warning('视频播放器未就绪');
            return;
        }

        const timeInSeconds = timeInMs / 1000;
        videoRef.current.currentTime = timeInSeconds;

        // 如果视频暂停,则播放
        if (videoRef.current.paused) {
            videoRef.current.play();
        }
    };

    // 计算当前激活的片段索引
    const activeSegmentIndex = useMemo(() => {
        const segments = video.transcript_info?.transcript_segments;
        if (!segments || segments.length === 0) return -1;

        const currentTimeMs = currentTime * 1000;
        return segments.findIndex(segment =>
            currentTimeMs >= segment.begin_time && currentTimeMs < segment.end_time
        );
    }, [video.transcript_info?.transcript_segments, currentTime]);

    // 自动滚动到当前激活的片段
    useEffect(() => {
        if (activeSegmentIndex !== -1 && listContainerRef.current) {
            const container = listContainerRef.current;
            const activeElement = container.querySelector(`[data-segment-index="${activeSegmentIndex}"]`) as HTMLElement;

            if (activeElement) {
                // 计算滚动位置，使激活元素居中
                const containerHeight = container.clientHeight;
                const elementTop = activeElement.offsetTop;
                const elementHeight = activeElement.clientHeight;

                // 目标滚动位置 = 元素顶部位置 - (容器高度 - 元素高度) / 2
                // 这样可以尽量让元素居中显示
                const targetScrollTop = elementTop - (containerHeight - elementHeight) / 2;

                container.scrollTo({
                    top: targetScrollTop,
                    behavior: 'smooth'
                });
            }
        }
    }, [activeSegmentIndex]);

    // 判断某个句子是否处于当前播放时间范围内
    const isSegmentActive = (index: number): boolean => {
        return index === activeSegmentIndex;
    };

    return (
        <>
            <style jsx>{`
                .timeline-segment-item:hover {
                    background-color: #f5f5f5 !important;
                }
                .timeline-segment-item:active {
                    background-color: #e6f7ff !important;
                }
            `}</style>
            <Card
                title={
                    <Space>
                        <FileTextOutlined />
                        <span>视频文案</span>
                    </Space>
                }
                style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                styles={{
                    body: {
                        flex: 1,
                        overflow: 'hidden',
                        minHeight: 0,
                        display: 'flex',
                        flexDirection: 'column'
                    }
                }}
                extra={
                    <Space>
                        {!hasTranscript && (
                            <Button
                                type="primary"
                                icon={<ThunderboltOutlined />}
                                onClick={handleExtract}
                                loading={processing === 'extract'}
                                disabled={loading}
                            >
                                提取文案
                            </Button>
                        )}
                        {hasTranscript && (
                            <Tooltip title={hasDenoised ? '重新执行去噪处理,将覆盖现有结果' : '使用AI去除文案中的冗余内容'}>
                                <Button
                                    type={hasDenoised ? 'default' : 'primary'}
                                    icon={<ClearOutlined />}
                                    onClick={handleDenoise}
                                    loading={processing === 'denoise'}
                                    disabled={loading}
                                >
                                    {hasDenoised ? '重新去噪' : '去噪'}
                                </Button>
                            </Tooltip>
                        )}
                        {hasTranscript && (
                            <Tooltip title={hasRewritten ? '重新执行重写处理,将覆盖现有结果' : '使用AI重写文案,使其更加流畅自然'}>
                                <Button
                                    type={hasRewritten ? 'default' : 'primary'}
                                    icon={<EditOutlined />}
                                    onClick={handleRewrite}
                                    loading={processing === 'rewrite'}
                                    disabled={loading}
                                >
                                    {hasRewritten ? '重新重写' : '重写'}
                                </Button>
                            </Tooltip>
                        )}
                        {hasTranscript && (
                            <Tooltip title="重新提取视频文案,将覆盖现有结果">
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={handleExtract}
                                    loading={processing === 'extract'}
                                    disabled={loading}
                                >
                                    重新提取
                                </Button>
                            </Tooltip>
                        )}
                    </Space>
                }
            >
                {/* 提取文案时显示全局加载 */}
                {processing === 'extract' && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Spin size="large" tip="正在提取文案..." />
                    </div>
                )}

                {/* 未提取文案时显示提示 */}
                {!hasTranscript && processing !== 'extract' && (
                    <Alert
                        message="未提取文案"
                        description="点击「提取文案」按钮开始语音识别,将视频中的语音转换为文字。"
                        type="info"
                        showIcon
                    />
                )}

                {/* Tab内容 - 提取时隐藏,其他时候始终显示 */}
                {hasTranscript && processing !== 'extract' && (
                    <Tabs
                        defaultActiveKey={hasSegments ? 'timeline' : hasRewritten ? 'rewritten' : hasDenoised ? 'denoised' : 'original'}
                        style={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                        className="transcript-tabs"
                    >
                        {/* 时间轴文案 - 放在第一位 */}
                        {hasSegments && (
                            <TabPane
                                tab={
                                    <Space>
                                        <ClockCircleOutlined />
                                        <span>时间轴文案</span>
                                        <Tag color="cyan">{video.transcript_info?.segment_count || video.transcript_info?.transcript_segments?.length}句</Tag>
                                    </Space>
                                }
                                key="timeline"
                            >
                                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                    <Alert
                                        message="时间轴功能说明"
                                        description="点击任意句子可跳转到视频对应时间点。视频播放时,当前时间对应的句子会高亮显示。"
                                        type="info"
                                        showIcon
                                        closable
                                        style={{ marginBottom: 8 }}
                                    />

                                    <div
                                        ref={listContainerRef}
                                        style={{
                                            maxHeight: '500px',
                                            overflow: 'auto',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '4px',
                                            position: 'relative', // 确保 offsetTop 计算正确
                                        }}
                                    >
                                        <List
                                            dataSource={video.transcript_info?.transcript_segments || []}
                                            renderItem={(segment, index) => {
                                                const isActive = isSegmentActive(index);
                                                return (
                                                    <List.Item
                                                        key={index}
                                                        data-segment-index={index}
                                                        onClick={() => handleSeekToTime(segment.begin_time)}
                                                        style={{
                                                            padding: '12px 16px',
                                                            cursor: 'pointer',
                                                            backgroundColor: isActive ? '#e6f7ff' : 'transparent',
                                                            borderLeft: isActive ? '3px solid #1890ff' : '3px solid transparent',
                                                            transition: 'all 0.3s ease',
                                                        }}
                                                        className="timeline-segment-item"
                                                    >
                                                        <Space direction="vertical" style={{ width: '100%' }} size={4}>
                                                            <Space>
                                                                <Tag color={isActive ? 'blue' : 'default'}>
                                                                    {formatTime(segment.begin_time)} - {formatTime(segment.end_time)}
                                                                </Tag>
                                                                {isActive && <Tag color="processing">播放中</Tag>}
                                                            </Space>
                                                            <Text
                                                                style={{
                                                                    fontSize: '14px',
                                                                    color: isActive ? '#1890ff' : 'inherit',
                                                                    fontWeight: isActive ? 500 : 400,
                                                                }}
                                                            >
                                                                {segment.text}
                                                            </Text>
                                                        </Space>
                                                    </List.Item>
                                                );
                                            }}
                                        />
                                    </div>
                                </Space>
                            </TabPane>
                        )}
                        {/* 原始文案 */}
                        <TabPane
                            tab={
                                <Space>
                                    <span>原始文案</span>
                                    <Tag color="blue">{video.transcript_info?.word_count}字</Tag>
                                </Space>
                            }
                            key="original"
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Statistic title="字数" value={video.transcript_info?.word_count} />
                                    </Col>
                                    <Col span={8}>
                                        <Statistic
                                            title="音频时长"
                                            value={video.transcript_info?.asr_metadata?.audio_duration}
                                            suffix="秒"
                                            precision={1}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <Statistic
                                            title="识别成本"
                                            value={video.transcript_info?.asr_metadata?.cost}
                                            prefix="¥"
                                            precision={4}
                                        />
                                    </Col>
                                </Row>

                                <div>
                                    <Space style={{ marginBottom: 8 }}>
                                        <Text strong>文案内容：</Text>
                                        <Button
                                            size="small"
                                            icon={<CopyOutlined />}
                                            onClick={() => handleCopy(video.transcript_info?.transcript_text || '')}
                                        >
                                            复制
                                        </Button>
                                    </Space>
                                    <Paragraph
                                        style={{
                                            background: '#f5f5f5',
                                            padding: '12px',
                                            borderRadius: '4px',
                                            whiteSpace: 'pre-wrap',
                                            flex: 1,
                                            overflow: 'auto',
                                            minHeight: 0
                                        }}
                                    >
                                        {video.transcript_info?.transcript_text}
                                    </Paragraph>
                                </div>
                            </Space>
                        </TabPane>



                        {/* 去噪文案 */}
                        {hasDenoised && (
                            <TabPane
                                tab={
                                    <Space>
                                        <span>去噪文案</span>
                                        {denoisedWordCount > 0 && (
                                            <Tag color="blue">{denoisedWordCount}字</Tag>
                                        )}
                                        {processing === 'denoise' ? (
                                            <Tag color="processing">处理中</Tag>
                                        ) : (
                                            <Tag color="green">已优化</Tag>
                                        )}
                                    </Space>
                                }
                                key="denoised"
                            >
                                {processing === 'denoise' ? (
                                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                        <Spin size="large" tip="正在去噪,请稍候..." />
                                    </div>
                                ) : (
                                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                        <div>
                                            <Space style={{ marginBottom: 8 }}>
                                                <Text strong>去噪后内容:</Text>
                                                <Button
                                                    size="small"
                                                    icon={<CopyOutlined />}
                                                    onClick={() => handleCopy(video.denoised_transcript?.denoised_text || '')}
                                                >
                                                    复制
                                                </Button>
                                            </Space>
                                            <Paragraph
                                                style={{
                                                    background: '#f6ffed',
                                                    padding: '12px',
                                                    borderRadius: '4px',
                                                    whiteSpace: 'pre-wrap',
                                                    flex: 1,
                                                    overflow: 'auto',
                                                    minHeight: 0,
                                                    border: '1px solid #b7eb8f'
                                                }}
                                            >
                                                {video.denoised_transcript?.denoised_text}
                                            </Paragraph>
                                        </div>
                                    </Space>
                                )}
                            </TabPane>
                        )}

                        {/* 重写文案 */}
                        {hasRewritten && (
                            <TabPane
                                tab={
                                    <Space>
                                        <span>重写文案</span>
                                        {rewrittenWordCount > 0 && (
                                            <Tag color="blue">{rewrittenWordCount}字</Tag>
                                        )}
                                        {processing === 'rewrite' ? (
                                            <Tag color="processing">处理中</Tag>
                                        ) : (
                                            <Tag color="purple">AI生成</Tag>
                                        )}
                                    </Space>
                                }
                                key="rewritten"
                            >
                                {processing === 'rewrite' ? (
                                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                        <Spin size="large" tip="正在重写,请稍候..." />
                                    </div>
                                ) : (
                                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                        <div>
                                            <Space style={{ marginBottom: 8 }}>
                                                <Text strong>重写后内容:</Text>
                                                <Tag>{video.rewritten_transcript?.style || 'natural'}</Tag>
                                                <Button
                                                    size="small"
                                                    icon={<CopyOutlined />}
                                                    onClick={() => handleCopy(video.rewritten_transcript?.rewritten_text || '')}
                                                >
                                                    复制
                                                </Button>
                                            </Space>
                                            <Paragraph
                                                style={{
                                                    background: '#f9f0ff',
                                                    padding: '12px',
                                                    borderRadius: '4px',
                                                    whiteSpace: 'pre-wrap',
                                                    flex: 1,
                                                    overflow: 'auto',
                                                    minHeight: 0,
                                                    border: '1px solid #d3adf7'
                                                }}
                                            >
                                                {video.rewritten_transcript?.rewritten_text}
                                            </Paragraph>
                                        </div>
                                    </Space>
                                )}
                            </TabPane>
                        )}
                    </Tabs>
                )}
            </Card>
        </>
    );
};

export default VideoTranscriptCard;
