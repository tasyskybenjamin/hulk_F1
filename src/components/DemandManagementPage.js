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
    region: [], // 多选数组
    clusterType: [], // 多选数组
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
        totalDemand: 1250,
        pendingEvaluation: 85,
        confirmedPending: 320,
        delivered: 680,
        recycled: 120,
        rejected: 45
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

      for (let i = 30; i >= -30; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);

        // 模拟数据，过去是实线，未来是虚线
        const isPast = i >= 0;
        totalDemand.push({
          value: Math.floor(Math.random() * 100) + 50,
          isPast
        });
        pendingEvaluation.push({
          value: Math.floor(Math.random() * 20) + 5,
          isPast
        });
        confirmedPending.push({
          value: Math.floor(Math.random() * 30) + 10,
          isPast
        });
        delivered.push({
          value: Math.floor(Math.random() * 40) + 20,
          isPast
        });
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
            label: '已交付',
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
      title: distributionBy === 'region' ? (showRoomDetail ? '机房' : '地域') : distributionBy === 'channel' ? '渠道' : '状态',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '需求量',
      dataIndex: 'value',
      key: 'value',
      render: (value) => <strong>{value}</strong>
    },
    {
      title: '占比',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (value) => `${value}%`
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => console.log('查看详情:', record)}
        >
          查看详情
        </Button>
      )
    }
  ];

  // 需求总览内容
  const renderOverviewContent = () => (
    <div>
      {/* 汇总统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="需求总量"
              value={summaryData.totalDemand}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title={
                <span>
                  待评估需求
                  <Tooltip title="不保障SLA的需求">
                    <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                  </Tooltip>
                </span>
              }
              value={summaryData.pendingEvaluation}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title={
                <span>
                  确认待交付
                  <Tooltip title="保障SLA的需求">
                    <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                  </Tooltip>
                </span>
              }
              value={summaryData.confirmedPending}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="已交付"
              value={summaryData.delivered}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="已回收"
              value={summaryData.recycled}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="驳回"
              value={summaryData.rejected}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 需求分布 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>需求分布（按{distributionBy === 'region' ? '地域' : distributionBy === 'channel' ? '渠道' : '状态'}）</span>
                <Space>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    分布维度：
                  </span>
                  <Button.Group size="small">
                    <Button
                      type={distributionBy === 'region' ? 'primary' : 'default'}
                      onClick={() => setDistributionBy('region')}
                    >
                      地域
                    </Button>
                    <Button
                      type={distributionBy === 'channel' ? 'primary' : 'default'}
                      onClick={() => setDistributionBy('channel')}
                    >
                      渠道
                    </Button>
                    <Button
                      type={distributionBy === 'status' ? 'primary' : 'default'}
                      onClick={() => setDistributionBy('status')}
                    >
                      状态
                    </Button>
                  </Button.Group>
                  {distributionBy === 'region' && (
                    <>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        机房详情：
                      </span>
                      <Switch
                        size="small"
                        checked={showRoomDetail}
                        onChange={setShowRoomDetail}
                        checkedChildren="显示"
                        unCheckedChildren="隐藏"
                      />
                    </>
                  )}
                  <Switch
                    checkedChildren={<TableOutlined />}
                    unCheckedChildren={<BarChartOutlined />}
                    checked={viewMode === 'table'}
                    onChange={(checked) => setViewMode(checked ? 'table' : 'chart')}
                  />
                </Space>
              </div>
            }
            className="distribution-card"
          >
            {viewMode === 'chart' ? (
              <div style={{ height: '300px' }}>
                <DemandDistributionChart
                  data={distributionData}
                  distributionBy={distributionBy}
                  showRoomDetail={showRoomDetail}
                />
              </div>
            ) : (
              <Table
                columns={distributionColumns}
                dataSource={distributionData}
                pagination={false}
                size="small"
                rowKey="name"
              />
            )}
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
                <Tooltip title="图表上的气泡表示需求量级突增，点击可查看详情">
                  <InfoCircleOutlined style={{ color: '#999' }} />
                </Tooltip>
              </div>
            }
            className="trend-card"
            extra={
              <div style={{ fontSize: '12px', color: '#666' }}>
                支持点击异常点查看需求详情
              </div>
            }
          >
            <div style={{ height: '400px' }}>
              <DemandTrendChart data={trendData} />
            </div>
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
