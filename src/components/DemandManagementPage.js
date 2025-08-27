import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Space,
  Tooltip,
  Tag,
  Switch,
  Alert,
  Tabs
} from 'antd';
import {
  EyeOutlined,
  TableOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  UnorderedListOutlined,
  BarChartOutlined as OverviewOutlined
} from '@ant-design/icons';
import DemandFilterPanel from './DemandFilterPanel';
import DemandDistributionChart from './DemandDistributionChart';
import DemandTrendChart from './DemandTrendChart';
import DemandDetailPage from './DemandDetailPage';
import './DemandManagementPage.css';

const DemandManagementPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    dateRange: null,
    demandChannel: [], // 多选数组
    demandScenario: [], // 多选数组
    customerName: [], // 多选数组
    demandStatus: [], // 多选数组
    regionCascader: [], // 地域级联选择器：地域->机房
    clusterCascader: [], // 级联选择器：集群组->专区
    productType: [], // 多选数组
    demandTags: [] // 多选数组
  });

  const [summaryData, setSummaryData] = useState({
    totalDemand: 0,
    pendingEvaluation: 0,
    confirmedPending: 0,
    delivered: 0,
    recycled: 0,
    rejected: 0
  });

  const [distributionData, setDistributionData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'table'
  const [distributionBy, setDistributionBy] = useState('region'); // 'region', 'channel', 'status'
  const [showRoomDetail, setShowRoomDetail] = useState(false); // 是否显示机房详情

  // 模拟数据获取
  const fetchDemandData = async (filterParams) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 模拟汇总数据
      setSummaryData({
        totalDemand: 3200000,
        pendingEvaluation: 150000,
        confirmedPending: 250000,
        delivered: 2800000,
        recycled: 180000,
        rejected: 20000
      });

      // 模拟分布数据
      const mockDistributionData = {
        region: [
          {
            name: '北京',
            value: 450,
            percentage: 36,
            children: [
              { name: '北京-机房1', value: 180, percentage: 40 },
              { name: '北京-机房2', value: 150, percentage: 33.3 },
              { name: '北京-机房3', value: 120, percentage: 26.7 }
            ]
          },
          {
            name: '上海',
            value: 320,
            percentage: 25.6,
            children: [
              { name: '上海-机房1', value: 200, percentage: 62.5 },
              { name: '上海-机房2', value: 120, percentage: 37.5 }
            ]
          },
          {
            name: '怀来',
            value: 280,
            percentage: 22.4,
            children: [
              { name: '怀来-机房1', value: 280, percentage: 100 }
            ]
          },
          {
            name: '其他',
            value: 200,
            percentage: 16,
            children: [
              { name: '其他-Any', value: 200, percentage: 100 }
            ]
          }
        ],
        channel: [
          { name: '日常', value: 400, percentage: 32 },
          { name: '活动', value: 350, percentage: 28 },
          { name: '应急', value: 200, percentage: 16 },
          { name: '专项', value: 180, percentage: 14.4 },
          { name: '资源池', value: 120, percentage: 9.6 }
        ],
        status: [
          { name: '已交付', value: 680, percentage: 54.4 },
          { name: '确认待交付', value: 320, percentage: 25.6 },
          { name: '已回收', value: 120, percentage: 9.6 },
          { name: '待评估', value: 85, percentage: 6.8 },
          { name: '驳回', value: 45, percentage: 3.6 }
        ]
      };

      // 根据是否显示机房详情来处理地域数据
      let currentDistributionData = mockDistributionData[distributionBy] || mockDistributionData.region;
      if (distributionBy === 'region' && showRoomDetail) {
        // 展开地域下的机房数据
        const expandedData = [];
        currentDistributionData.forEach(region => {
          if (region.children && region.children.length > 0) {
            expandedData.push(...region.children);
          } else {
            expandedData.push(region);
          }
        });
        currentDistributionData = expandedData;
      }
      setDistributionData(currentDistributionData);

      // 模拟趋势数据
      const dates = [];
      const totalDemand = [];
      const pendingEvaluation = [];
      const confirmedPending = [];
      const delivered = [];

      // 基础值和趋势参数
      let totalBase = 120;
      let pendingBase = 15;
      let confirmedBase = 35;
      let deliveredBase = 70;

      for (let i = 30; i >= -30; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);

        // 模拟数据，过去是实线，未来是虚线
        const isPast = i >= 0;

        // 添加季节性波动和长期趋势
        const seasonalFactor = 1 + 0.2 * Math.sin((i + 30) * Math.PI / 30); // 季节性波动
        const trendFactor = isPast ? 1 : 1 + (30 - i) * 0.01; // 未来增长趋势
        const randomFactor = 0.9 + Math.random() * 0.2; // 随机波动±10%

        // 总需求：平滑变化，有轻微上升趋势
        const totalValue = Math.round(totalBase * seasonalFactor * trendFactor * randomFactor);
        totalDemand.push({
          value: totalValue,
          isPast
        });
        totalBase = totalBase * 0.95 + totalValue * 0.05; // 平滑基础值

        // 待评估需求：相对稳定，偶有波动
        const pendingValue = Math.round(pendingBase * (0.8 + Math.random() * 0.4) * (isPast ? 1 : 1.1));
        pendingEvaluation.push({
          value: pendingValue,
          isPast
        });
        pendingBase = pendingBase * 0.9 + pendingValue * 0.1;

        // 确认待交付需求：有明显的周期性变化
        const confirmedValue = Math.round(confirmedBase * seasonalFactor * (0.7 + Math.random() * 0.6) * trendFactor);
        confirmedPending.push({
          value: confirmedValue,
          isPast
        });
        confirmedBase = confirmedBase * 0.9 + confirmedValue * 0.1;

        // 已交付+已回收需求：相对平稳，有轻微增长
        const deliveredValue = Math.round(deliveredBase * (0.85 + Math.random() * 0.3) * trendFactor);
        delivered.push({
          value: deliveredValue,
          isPast
        });
        deliveredBase = deliveredBase * 0.95 + deliveredValue * 0.05;
      }

      setTrendData({
        labels: dates,
        datasets: [
          {
            label: '总需求',
            data: totalDemand,
            color: '#1890ff'
          },
          {
            label: '待评估需求',
            data: pendingEvaluation,
            color: '#faad14'
          },
          {
            label: '确认待交付需求',
            data: confirmedPending,
            color: '#f5222d'
          },
          {
            label: '已交付+已回收',
            data: delivered,
            color: '#52c41a'
          }
        ]
      });

    } catch (error) {
      console.error('获取需求数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandData(filters);
  }, []);

  useEffect(() => {
    // 当分布维度变化时，更新分布数据
    const mockDistributionData = {
      region: [
        {
          name: '北京',
          value: 450,
          percentage: 36,
          children: [
            { name: '北京-机房1', value: 180, percentage: 40 },
            { name: '北京-机房2', value: 150, percentage: 33.3 },
            { name: '北京-机房3', value: 120, percentage: 26.7 }
          ]
        },
        {
          name: '上海',
          value: 320,
          percentage: 25.6,
          children: [
            { name: '上海-机房1', value: 200, percentage: 62.5 },
            { name: '上海-机房2', value: 120, percentage: 37.5 }
          ]
        },
        {
          name: '怀来',
          value: 280,
          percentage: 22.4,
          children: [
            { name: '怀来-机房1', value: 280, percentage: 100 }
          ]
        },
        {
          name: '其他',
          value: 200,
          percentage: 16,
          children: [
            { name: '其他-Any', value: 200, percentage: 100 }
          ]
        }
      ],
      channel: [
        { name: '日常', value: 400, percentage: 32 },
        { name: '活动', value: 350, percentage: 28 },
        { name: '应急', value: 200, percentage: 16 },
        { name: '专项', value: 180, percentage: 14.4 },
        { name: '资源池', value: 120, percentage: 9.6 }
      ],
      status: [
        { name: '已交付', value: 680, percentage: 54.4 },
        { name: '确认待交付', value: 320, percentage: 25.6 },
        { name: '已回收', value: 120, percentage: 9.6 },
        { name: '待评估', value: 85, percentage: 6.8 },
        { name: '驳回', value: 45, percentage: 3.6 }
      ]
    };
    // 根据是否显示机房详情来处理地域数据
    let currentDistributionData = mockDistributionData[distributionBy] || mockDistributionData.region;
    if (distributionBy === 'region' && showRoomDetail) {
      // 展开地域下的机房数据
      const expandedData = [];
      currentDistributionData.forEach(region => {
        if (region.children && region.children.length > 0) {
          expandedData.push(...region.children);
        } else {
          expandedData.push(region);
        }
      });
      currentDistributionData = expandedData;
    }
    setDistributionData(currentDistributionData);
  }, [distributionBy, showRoomDetail]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchDemandData(newFilters);
  };

  // 需求分布表格列定义
  const distributionColumns = [
    {
      title: distributionBy === 'region' ? (showRoomDetail ? '机房' : '地域') : '渠道',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      fixed: 'left',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => (
        <div style={{ fontWeight: '500' }}>
          {text}
        </div>
      )
    },
    {
      title: '需求量',
      dataIndex: 'value',
      key: 'value',
      width: 120,
      sorter: (a, b) => a.value - b.value,
      defaultSortOrder: 'descend',
      render: (value) => (
        <div style={{ textAlign: 'right' }}>
          <strong style={{ color: '#1890ff' }}>{value.toLocaleString()}</strong>
          <span style={{ color: '#666', fontSize: '12px', marginLeft: '4px' }}>核</span>
        </div>
      )
    },
    {
      title: '占比',
      dataIndex: 'percentage',
      key: 'percentage',
      width: 100,
      sorter: (a, b) => a.percentage - b.percentage,
      render: (value) => (
        <div style={{ textAlign: 'center' }}>
          <Tag color={value >= 30 ? 'red' : value >= 20 ? 'orange' : value >= 10 ? 'blue' : 'default'}>
            {value}%
          </Tag>
        </div>
      )
    },
    {
      title: '趋势',
      key: 'trend',
      width: 80,
      render: (_, record) => {
        // 模拟趋势数据
        const trendValue = Math.random() > 0.5 ? 1 : -1;
        const trendPercent = (Math.random() * 20).toFixed(1);
        return (
          <div style={{ textAlign: 'center' }}>
            {trendValue > 0 ? (
              <span style={{ color: '#52c41a', fontSize: '12px' }}>
                ↗ +{trendPercent}%
              </span>
            ) : (
              <span style={{ color: '#ff4d4f', fontSize: '12px' }}>
                ↘ -{trendPercent}%
              </span>
            )}
          </div>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => console.log('查看详情:', record)}
          >
            详情
          </Button>
        </Space>
      )
    }
  ];

  // 需求总览内容
  const renderOverviewContent = () => (
    <div>
      {/* 核心指标卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="summary-card">
            <Statistic
              title="总需求"
              value={summaryData.totalDemand}
              valueStyle={{ color: '#1890ff', fontSize: '28px' }}
              suffix="核"
              formatter={(value) => value.toLocaleString()}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="summary-card">
            <Statistic
              title={
                <span>
                  明确需求占比
                  <Tooltip title="明确需求占比 = (确认待交付 + 已交付 + 已回收) / 总需求 × 100%">
                    <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                  </Tooltip>
                </span>
              }
              value={(((summaryData.confirmedPending + summaryData.delivered + summaryData.recycled) / summaryData.totalDemand) * 100).toFixed(1)}
              valueStyle={{ color: '#52c41a', fontSize: '28px' }}
              suffix="%"
                  </Tooltip>
                </span>
              }
        <Col xs={24} sm={12} lg={6}>
              valueStyle={{ color: '#52c41a', fontSize: '28px' }}
              suffix="%"
              title={
                <span>
                  本月新增需求
                  <Tooltip title="本月新增的需求量">
                    <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                  </Tooltip>
                </span>
              }
              value={285000}
              valueStyle={{ color: '#722ed1', fontSize: '28px' }}
        <Col xs={24} sm={12} lg={6}>
          <Card className="summary-card">
            <Statistic
              title={
                <span>
        <Col xs={24} sm={12} lg={6}>
                  <Tooltip title="本月新增的需求量">
                    <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
              title={
                <span>
                  平均交付时长
                  <Tooltip title="从需求提交到完成交付的平均用时">
                    <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                  </Tooltip>
                </span>
              }
              value="2.3"
              title={
              suffix="天"
                  <Tooltip title="从需求提交到完成交付的平均用时">
                    <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                  </Tooltip>
            <Card
              className="status-card pending-evaluation"
              style={{
                textAlign: 'center',
                borderRadius: '8px',
                border: '1px solid #faad14',
                backgroundColor: '#fffbe6'
              }}
              bodyStyle={{ padding: '20px 16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#faad14' }}>待评估</span>
                <Tooltip title="不保障SLA的需求，需要进一步评估资源可行性">
                  <InfoCircleOutlined style={{ color: '#999', marginLeft: '4px' }} />
                </Tooltip>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14', marginBottom: '4px' }}>
                {summaryData.pendingEvaluation.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {((summaryData.pendingEvaluation / summaryData.totalDemand) * 100).toFixed(1)}%
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card
              className="status-card confirmed-pending"
              style={{
                textAlign: 'center',
                borderRadius: '8px',
                border: '1px solid #1890ff',
                backgroundColor: '#e6f7ff'
              }}
              bodyStyle={{ padding: '20px 16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1890ff' }}>确认待交付</span>
                <Tooltip title="保障SLA的需求，已确认资源并等待交付">
                  <InfoCircleOutlined style={{ color: '#999', marginLeft: '4px' }} />
                </Tooltip>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff', marginBottom: '4px' }}>
                {summaryData.confirmedPending.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {((summaryData.confirmedPending / summaryData.totalDemand) * 100).toFixed(1)}%
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card
              className="status-card delivered"
              style={{
                textAlign: 'center',
                borderRadius: '8px',
                border: '1px solid #52c41a',
                backgroundColor: '#f6ffed'
              }}
              bodyStyle={{ padding: '20px 16px' }}
            >
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#52c41a' }}>已交付</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a', marginBottom: '4px' }}>
                {summaryData.delivered.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {((summaryData.delivered / summaryData.totalDemand) * 100).toFixed(1)}%
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card
              className="status-card recycled"
              style={{
                textAlign: 'center',
                borderRadius: '8px',
                border: '1px solid #13c2c2',
                backgroundColor: '#e6fffb'
              }}
              bodyStyle={{ padding: '20px 16px' }}
            >
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#13c2c2' }}>已回收</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#13c2c2', marginBottom: '4px' }}>
                {summaryData.recycled.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {((summaryData.recycled / summaryData.totalDemand) * 100).toFixed(1)}%
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card
              className="status-card rejected"
              style={{
                textAlign: 'center',
                borderRadius: '8px',
                border: '1px solid #ff4d4f',
                backgroundColor: '#fff2f0'
              }}
              bodyStyle={{ padding: '20px 16px' }}
            >
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#ff4d4f' }}>无效</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f', marginBottom: '4px' }}>
                {summaryData.rejected.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {((summaryData.rejected / summaryData.totalDemand) * 100).toFixed(1)}%
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card
              className="status-card urgent"
              style={{
                textAlign: 'center',
                borderRadius: '8px',
                border: '1px solid #722ed1',
                backgroundColor: '#f9f0ff'
              }}
              bodyStyle={{ padding: '20px 16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#722ed1' }}>预期外需求</span>
                <Tooltip title="超出预期的需求，需要特别关注">
                  <InfoCircleOutlined style={{ color: '#999', marginLeft: '4px' }} />
                </Tooltip>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1', marginBottom: '4px' }}>
                58,000
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                1.8%
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 快速洞察 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card
            title="📊 需求洞察"
            className="insight-card"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <div className="insight-item">
                  <div className="insight-label">热点地域</div>
                  <div className="insight-value">北京 (36%)</div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="insight-item">
                  <div className="insight-label">热点渠道</div>
                  <div className="insight-value">日常 (32%)</div>
                  <div className="insight-value">活动 (28%)</div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="insight-item">
                  <div className="insight-label">Top 5 机房</div>
                  <div className="insight-list">
                    <div className="insight-list-item">1. 北京-机房1 (18%)</div>
                    <div className="insight-list-item">2. 上海-机房1 (15%)</div>
                    <div className="insight-list-item">3. 北京-机房2 (12%)</div>
                    <div className="insight-list-item">4. 怀来-机房1 (10%)</div>
                    <div className="insight-list-item">5. 上海-机房2 (8%)</div>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="insight-item">
                  <div className="insight-label">Top 5 客户</div>
                  <div className="insight-list">
                    <div className="insight-list-item">1. 美团外卖 (22%)</div>
                    <div className="insight-list-item">2. 点评事业部 (18%)</div>
                    <div className="insight-list-item">3. 美团优选 (15%)</div>
                    <div className="insight-list-item">4. 美团买菜 (12%)</div>
                    <div className="insight-list-item">5. 美团打车 (10%)</div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 需求分布 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>📈 需求分布</span>
                   <Tag color="blue" style={{ margin: 0 }}>
                     按{distributionBy === 'region' ? '地域' : '渠道'}
                   </Tag>
                  {distributionBy === 'region' && showRoomDetail && (
                    <Tag color="green" style={{ margin: 0 }}>机房详情</Tag>
                  )}
                </div>
                <Space wrap>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#666', whiteSpace: 'nowrap' }}>
                      分布维度：
                    </span>
                     <Button.Group size="small" className="dimension-button-group">
                       <Button
                         type={distributionBy === 'region' ? 'primary' : 'default'}
                         onClick={() => setDistributionBy('region')}
                         style={{ borderRadius: '4px 0 0 4px' }}
                       >
                         地域
                       </Button>
                       <Button
                         type={distributionBy === 'channel' ? 'primary' : 'default'}
                         onClick={() => setDistributionBy('channel')}
                         style={{ borderRadius: '0 4px 4px 0' }}
                       >
                         渠道
                       </Button>
                     </Button.Group>
                  </div>
                  {distributionBy === 'region' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#666', whiteSpace: 'nowrap' }}>
                        机房详情：
                      </span>
                      <Switch
                        size="small"
                        checked={showRoomDetail}
                        onChange={setShowRoomDetail}
                        checkedChildren="显示"
                        unCheckedChildren="隐藏"
                      />
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#666', whiteSpace: 'nowrap' }}>
                      视图模式：
                    </span>
                    <Switch
                      checkedChildren={<TableOutlined />}
                      unCheckedChildren={<BarChartOutlined />}
                      checked={viewMode === 'table'}
                      onChange={(checked) => setViewMode(checked ? 'table' : 'chart')}
                    />
                  </div>
                </Space>
              </div>
            }
            className="distribution-card"
          >
            <div>
              {/* 图表或表格视图 */}
              {viewMode === 'chart' ? (
                <div style={{ height: '350px' }}>
                  <DemandDistributionChart
                    data={distributionData}
                    distributionBy={distributionBy}
                    showRoomDetail={showRoomDetail}
                  />
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#666' }}>
                      共 {distributionData.length} 条记录，总需求量 {distributionData.reduce((sum, item) => sum + item.value, 0).toLocaleString()} 核
                    </span>
                    <Space>
                      <Button size="small" onClick={() => console.log('导出数据')}>
                        导出数据
                      </Button>
                    </Space>
                  </div>
                   <Table
                     className="distribution-table"
                     columns={distributionColumns}
                     dataSource={distributionData.map((item, index) => ({ ...item, key: item.name || index }))}
                     pagination={{
                       size: 'small',
                       showSizeChanger: true,
                       showQuickJumper: true,
                       showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                       pageSizeOptions: ['10', '20', '50', '100']
                     }}
                     size="small"
                     rowKey="key"
                     scroll={{ x: 'max-content' }}
                     bordered
                   />
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 需求变化趋势 */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>需求变化趋势</span>
                <Tag color="blue">实线：历史数据</Tag>
                <Tag color="purple">虚线：预测数据</Tag>
              </div>
            }
            className="trend-card"
          >
            <Tabs
              defaultActiveKey="total"
              items={[
                {
                  key: 'total',
                  label: '总需求',
                  children: (
                    <div style={{ height: '400px' }}>
                      <DemandTrendChart
                        data={{
                          labels: trendData.labels,
                          datasets: trendData.datasets ? [trendData.datasets[0]] : []
                        }}
                        disableAnomalyClick={true}
                      />
                    </div>
                  )
                },
                {
                  key: 'pending',
                  label: '待评估需求',
                  children: (
                    <div style={{ height: '400px' }}>
                      <DemandTrendChart
                        data={{
                          labels: trendData.labels,
                          datasets: trendData.datasets ? [trendData.datasets[1]] : []
                        }}
                        disableAnomalyClick={true}
                      />
                    </div>
                  )
                },
                {
                  key: 'confirmed',
                  label: '确认待交付需求',
                  children: (
                    <div style={{ height: '400px' }}>
                      <DemandTrendChart
                        data={{
                          labels: trendData.labels,
                          datasets: trendData.datasets ? [trendData.datasets[2]] : []
                        }}
                        disableAnomalyClick={true}
                      />
                    </div>
                  )
                },
                {
                  key: 'delivered',
                  label: '已交付+已回收需求',
                  children: (
                    <div style={{ height: '400px' }}>
                      <DemandTrendChart
                        data={{
                          labels: trendData.labels,
                          datasets: trendData.datasets ? [trendData.datasets[3]] : []
                        }}
                        disableAnomalyClick={true}
                      />
                    </div>
                  )
                }
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Tab配置
  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <OverviewOutlined />
          需求总览
        </span>
      ),
      children: renderOverviewContent()
    },
    {
      key: 'detail',
      label: (
        <span>
          <UnorderedListOutlined />
          需求明细
        </span>
      ),
      children: (
        <DemandDetailPage
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )
    }
  ];

  return (
    <div className="demand-management-page">
      {/* 筛选面板 */}
      <Card className="filter-card" size="small" style={{ marginBottom: 16 }}>
        <DemandFilterPanel
          filters={filters}
          onChange={handleFilterChange}
          loading={loading}
        />
      </Card>

      {/* Tab切换区域 */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          tabBarStyle={{
            marginBottom: 24,
            borderBottom: '1px solid #f0f0f0'
          }}
        />
      </Card>
    </div>
  );
};

export default DemandManagementPage;
