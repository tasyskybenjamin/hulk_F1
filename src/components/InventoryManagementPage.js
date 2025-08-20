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
  Tabs,
  Select,
  DatePicker,
  Input,
  Form
} from 'antd';
import {
  EyeOutlined,
  TableOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  UnorderedListOutlined,
  BarChartOutlined as OverviewOutlined,
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './InventoryManagementPage.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

const InventoryManagementPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // 获取当前日期前后两个月的日期范围
  const getDefaultDateRange = () => {
    const today = dayjs();
    const startDate = today.subtract(2, 'month').startOf('day');
    const endDate = today.add(2, 'month').endOf('day');
    return [startDate, endDate];
  };

  const [filters, setFilters] = useState({
    dateRange: getDefaultDateRange(),
    clusterGroup: [], // 集群组
    zone: [], // 专区
    caller: [], // 调用方
    region: [], // 地域/机房
    inventoryStatus: ['available', 'delivered'], // 库存状态：可用库存、已出库
    productType: ['general', 'economy', 'highPerformance'], // 产品类型：通用、经济、高性能
    inventoryScenario: ['business', 'selfUse', 'operation', 'platform', 'emergency'] // 库存场景
  });

  const [summaryData, setSummaryData] = useState({
    totalInventory: 0,
    availableInventory: 0,
    reservedInventory: 0,
    allocatedInventory: 0,
    pendingDelivery: 0,
    pendingRecycle: 0
  });

  const [distributionData, setDistributionData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'table'
  const [distributionBy, setDistributionBy] = useState('region'); // 'region', 'status', 'pool'

  // 模拟集群组数据
  const clusterGroupOptions = [
    { value: 'group1', label: '集群组1' },
    { value: 'group2', label: '集群组2' },
    { value: 'group3', label: '集群组3' }
  ];

  // 模拟专区数据
  const zoneOptions = {
    group1: [
      { value: 'zone1', label: '专区1' },
      { value: 'zone2', label: '专区2' },
      { value: 'non_zone1', label: '非专区1 (HRS)' }
    ],
    group2: [
      { value: 'zone3', label: '专区3' },
      { value: 'zone4', label: '专区4' },
      { value: 'non_zone2', label: '非专区2 (HRS)' }
    ],
    group3: [
      { value: 'zone5', label: '专区5' },
      { value: 'zone6', label: '专区6' },
      { value: 'non_zone3', label: '非专区3 (HRS)' }
    ]
  };

  // 模拟调用方数据
  const callerOptions = {
    // 业务调用方
    business: [
      { value: 'avatar', label: 'avatar (公共池)' },
      { value: 'unit_a', label: 'unit_a (A结算单元池)' },
      { value: 'unit_b', label: 'unit_b (B结算单元池)' },
      { value: 'holiday', label: 'holiday' },
      { value: 'avatar_reserved', label: 'avatar_reserved (预约扩容)' }
    ],
    // 平台调用方
    platform: [
      { value: 'policy', label: 'policy (弹性)' },
      { value: 'quake', label: 'quake' },
      { value: 'maoyan', label: 'maoyan' }
    ],
    // 运维调用方
    operation: [
      { value: 'n_plus_one', label: 'n_plus_one (n+1容灾)' },
      { value: 'hdr', label: 'hdr (宕机迁移)' },
      { value: 'migration_donate_common', label: 'migration_donate_common (资源赠予池)' }
    ],
    // 自用调用方
    selfUse: [
      { value: 'buffer', label: 'buffer' },
      { value: 'hulk_overassign', label: 'hulk_overassign' }
    ],
    // 紧急资源调用方
    emergency: [
      { value: 'emergency_resource', label: 'emergency_resource' }
    ]
  };

  // 模拟地域/机房数据
  const regionOptions = [
    { value: 'beijing', label: '北京' },
    { value: 'beijing_room1', label: '北京-机房1' },
    { value: 'beijing_room2', label: '北京-机房2' },
    { value: 'shanghai', label: '上海' },
    { value: 'shanghai_room1', label: '上海-机房1' },
    { value: 'huailai', label: '怀来' },
    { value: 'huailai_room1', label: '怀来-机房1' }
  ];

  // 模拟数据获取
  const fetchInventoryData = async (filterParams) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 模拟汇总数据
      setSummaryData({
        totalInventory: 2500,
        availableInventory: 850,
        reservedInventory: 320,
        allocatedInventory: 1100,
        pendingDelivery: 180,
        pendingRecycle: 50
      });

      // 模拟分布数据
      const mockDistributionData = {
        region: [
          { name: '北京', value: 1200, percentage: 48 },
          { name: '上海', value: 800, percentage: 32 },
          { name: '怀来', value: 350, percentage: 14 },
          { name: '其他', value: 150, percentage: 6 }
        ],
        status: [
          { name: '可用', value: 850, percentage: 34 },
          { name: '已分配', value: 1100, percentage: 44 },
          { name: '已预留', value: 320, percentage: 12.8 },
          { name: '待交付', value: 180, percentage: 7.2 },
          { name: '待回收', value: 50, percentage: 2 }
        ],
        pool: [
          { name: '通用资源池', value: 1500, percentage: 60 },
          { name: '关键业务池', value: 500, percentage: 20 },
          { name: '活动资源池', value: 300, percentage: 12 },
          { name: '应急资源池', value: 200, percentage: 8 }
        ]
      };

      setDistributionData(mockDistributionData[distributionBy] || mockDistributionData.region);

      // 模拟趋势数据
      const dates = [];
      const totalInventory = [];
      const availableInventory = [];
      const allocatedInventory = [];

      for (let i = 30; i >= -30; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);

        // 模拟数据，过去是实线，未来是虚线
        const isPast = i >= 0;
        totalInventory.push({
          value: Math.floor(Math.random() * 500) + 2000,
          isPast
        });
        availableInventory.push({
          value: Math.floor(Math.random() * 300) + 700,
          isPast
        });
        allocatedInventory.push({
          value: Math.floor(Math.random() * 200) + 900,
          isPast
        });
      }

      setTrendData({
        labels: dates,
        datasets: [
          {
            label: '总库存',
            data: totalInventory,
            color: '#1890ff'
          },
          {
            label: '可用库存',
            data: availableInventory,
            color: '#52c41a'
          },
          {
            label: '已分配',
            data: allocatedInventory,
            color: '#f5222d'
          }
        ]
      });

    } catch (error) {
      console.error('获取库存数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData(filters);
  }, []);

  useEffect(() => {
    // 当分布维度变化时，更新分布数据
    const mockDistributionData = {
      region: [
        { name: '北京', value: 1200, percentage: 48 },
        { name: '上海', value: 800, percentage: 32 },
        { name: '怀来', value: 350, percentage: 14 },
        { name: '其他', value: 150, percentage: 6 }
      ],
      status: [
        { name: '可用', value: 850, percentage: 34 },
        { name: '已分配', value: 1100, percentage: 44 },
        { name: '已预留', value: 320, percentage: 12.8 },
        { name: '待交付', value: 180, percentage: 7.2 },
        { name: '待回收', value: 50, percentage: 2 }
      ],
      pool: [
        { name: '通用资源池', value: 1500, percentage: 60 },
        { name: '关键业务池', value: 500, percentage: 20 },
        { name: '活动资源池', value: 300, percentage: 12 },
        { name: '应急资源池', value: 200, percentage: 8 }
      ]
    };
    setDistributionData(mockDistributionData[distributionBy] || mockDistributionData.region);
  }, [distributionBy]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchInventoryData(newFilters);
  };

  // 库存分布表格列定义
  const distributionColumns = [
    {
      title: distributionBy === 'region' ? '地域' : distributionBy === 'status' ? '状态' : '资源池',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '库存量',
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

  // 库存列表数据
  const inventoryListData = Array(10).fill(null).map((_, index) => ({
    key: index,
    id: `INV-${10000 + index}`,
    region: ['北京', '上海', '怀来'][index % 3],
    clusterType: ['Hulk', 'Kubernetes', 'OpenStack'][index % 3],
    productType: ['通用', '经济', '高性能'][index % 3],
    status: ['可用', '已出库'][index % 2],
    inventoryScenario: ['业务', '自用', '运维', '平台', '紧急资源'][index % 5],
    caller: ['avatar', 'policy', 'n_plus_one', 'buffer', 'emergency_resource'][index % 5],
    count: Math.floor(Math.random() * 100) + 10,
    createTime: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }));

  // 库存列表列定义
  const inventoryListColumns = [
    {
      title: '库存ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '地域/机房',
      dataIndex: 'region',
      key: 'region',
    },
    {
      title: '产品类型',
      dataIndex: 'productType',
      key: 'productType',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          '可用': 'green',
          '已出库': 'blue'
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      }
    },
    {
      title: '库存场景',
      dataIndex: 'inventoryScenario',
      key: 'inventoryScenario',
      render: (scenario) => {
        const colorMap = {
          '业务': 'blue',
          '自用': 'cyan',
          '运维': 'purple',
          '平台': 'orange',
          '紧急资源': 'red'
        };
        return <Tag color={colorMap[scenario]}>{scenario}</Tag>;
      }
    },
    {
      title: '调用方',
      dataIndex: 'caller',
      key: 'caller',
    },
    {
      title: '数量',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small">查看</Button>
          <Button type="link" size="small">编辑</Button>
        </Space>
      )
    }
  ];

  // 筛选面板组件
  const FilterPanel = ({ filters, onChange, loading }) => {
    const [form] = Form.useForm();
    const [selectedClusterGroups, setSelectedClusterGroups] = useState([]);
    const [selectedZones, setSelectedZones] = useState([]);
    const [selectedScenarios, setSelectedScenarios] = useState(filters.inventoryScenario || []);

    // 获取可用的专区选项
    const getZoneOptions = () => {
      if (!selectedClusterGroups || selectedClusterGroups.length === 0) {
        // 如果没有选择集群组，返回所有专区
        return Object.values(zoneOptions).flat();
      }

      // 返回选中集群组对应的专区
      return selectedClusterGroups
        .map(group => zoneOptions[group] || [])
        .flat();
    };

    // 获取可用的调用方选项
    const getCallerOptions = () => {
      if (!selectedScenarios || selectedScenarios.length === 0) {
        // 如果没有选择场景，返回所有调用方
        return Object.values(callerOptions).flat();
      }

      // 返回选中场景对应的调用方
      return selectedScenarios
        .map(scenario => callerOptions[scenario] || [])
        .flat();
    };

    const handleSubmit = () => {
      const values = form.getFieldsValue();
      onChange(values);
    };

    const handleReset = () => {
      form.resetFields();
      setSelectedClusterGroups([]);
      setSelectedZones([]);
      setSelectedScenarios(filters.inventoryScenario || []);

      onChange({
        dateRange: getDefaultDateRange(),
        clusterGroup: [],
        zone: [],
        caller: [],
        region: [],
        inventoryStatus: ['available', 'delivered'],
        productType: ['general', 'economy', 'highPerformance'],
        inventoryScenario: ['business', 'selfUse', 'operation', 'platform', 'emergency']
      });
    };

    // 处理集群组变化
    const handleClusterGroupChange = (values) => {
      setSelectedClusterGroups(values);
      // 清空专区选择
      form.setFieldsValue({ zone: [] });
      setSelectedZones([]);
    };

    // 处理专区变化
    const handleZoneChange = (values) => {
      setSelectedZones(values);
    };

    // 处理库存场景变化
    const handleScenarioChange = (values) => {
      setSelectedScenarios(values);
      // 清空调用方选择
      form.setFieldsValue({ caller: [] });
    };

    return (
      <Form
        form={form}
        layout="inline"
        initialValues={filters}
        onFinish={handleSubmit}
      >
        <Row gutter={[16, 16]} style={{ width: '100%' }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="filter-item">
              <span className="filter-label">时间范围</span>
              <Form.Item name="dateRange" style={{ width: '100%', marginBottom: 0 }}>
                <RangePicker
                  style={{ width: '100%' }}
                  showTime={{
                    defaultValue: [
                      dayjs('00:00:00', 'HH:mm:ss'),
                      dayjs('23:59:59', 'HH:mm:ss')
                    ]
                  }}
                  format="YYYY-MM-DD HH:mm:ss"
                />
              </Form.Item>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="filter-item">
              <span className="filter-label">集群组</span>
              <Form.Item name="clusterGroup" style={{ width: '100%', marginBottom: 0 }}>
                <Select
                  mode="multiple"
                  placeholder="选择集群组"
                  style={{ width: '100%' }}
                  allowClear
                  onChange={handleClusterGroupChange}
                  options={clusterGroupOptions}
                />
              </Form.Item>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="filter-item">
              <span className="filter-label">专区</span>
              <Form.Item name="zone" style={{ width: '100%', marginBottom: 0 }}>
                <Select
                  mode="multiple"
                  placeholder="选择专区"
                  style={{ width: '100%' }}
                  allowClear
                  onChange={handleZoneChange}
                  options={getZoneOptions()}
                />
              </Form.Item>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="filter-item">
              <span className="filter-label">调用方</span>
              <Form.Item name="caller" style={{ width: '100%', marginBottom: 0 }}>
                <Select
                  mode="multiple"
                  placeholder="选择调用方"
                  style={{ width: '100%' }}
                  allowClear
                  options={getCallerOptions()}
                />
              </Form.Item>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="filter-item">
              <span className="filter-label">地域/机房</span>
              <Form.Item name="region" style={{ width: '100%', marginBottom: 0 }}>
                <Select
                  mode="multiple"
                  placeholder="选择地域/机房"
                  style={{ width: '100%' }}
                  allowClear
                  options={regionOptions}
                />
              </Form.Item>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="filter-item">
              <span className="filter-label">库存状态</span>
              <Form.Item name="inventoryStatus" style={{ width: '100%', marginBottom: 0 }}>
                <Select
                  mode="multiple"
                  placeholder="选择库存状态"
                  style={{ width: '100%' }}
                  allowClear
                  options={[
                    { value: 'available', label: '可用库存' },
                    { value: 'delivered', label: '已出库' }
                  ]}
                />
              </Form.Item>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="filter-item">
              <span className="filter-label">产品类型</span>
              <Form.Item name="productType" style={{ width: '100%', marginBottom: 0 }}>
                <Select
                  mode="multiple"
                  placeholder="选择产品类型"
                  style={{ width: '100%' }}
                  allowClear
                  options={[
                    { value: 'general', label: '通用' },
                    { value: 'economy', label: '经济' },
                    { value: 'highPerformance', label: '高性能' }
                  ]}
                />
              </Form.Item>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="filter-item">
              <span className="filter-label">库存场景</span>
              <Form.Item name="inventoryScenario" style={{ width: '100%', marginBottom: 0 }}>
                <Select
                  mode="multiple"
                  placeholder="选择库存场景"
                  style={{ width: '100%' }}
                  allowClear
                  onChange={handleScenarioChange}
                  options={[
                    { value: 'business', label: '业务' },
                    { value: 'selfUse', label: '自用' },
                    { value: 'operation', label: '运维' },
                    { value: 'platform', label: '平台' },
                    { value: 'emergency', label: '紧急资源' }
                  ]}
                />
              </Form.Item>
            </div>
          </Col>
          <Col xs={24} sm={24} md={24} lg={24} style={{ textAlign: 'right' }}>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSubmit}
                loading={loading}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                重置
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    );
  };

  // 库存总览内容
  const renderOverviewContent = () => (
    <div>
      {/* 汇总统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="库存总量"
              value={summaryData.totalInventory}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title={
                <span>
                  可用库存
                  <Tooltip title="可立即分配的库存">
                    <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                  </Tooltip>
                </span>
              }
              value={summaryData.availableInventory}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title={
                <span>
                  已预留库存
                  <Tooltip title="已预留但未分配的库存">
                    <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                  </Tooltip>
                </span>
              }
              value={summaryData.reservedInventory}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="已分配库存"
              value={summaryData.allocatedInventory}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="待交付"
              value={summaryData.pendingDelivery}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="待回收"
              value={summaryData.pendingRecycle}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 库存分布 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>库存分布（按{distributionBy === 'region' ? '地域' : distributionBy === 'status' ? '状态' : '资源池'}）</span>
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
                      type={distributionBy === 'status' ? 'primary' : 'default'}
                      onClick={() => setDistributionBy('status')}
                    >
                      状态
                    </Button>
                    <Button
                      type={distributionBy === 'pool' ? 'primary' : 'default'}
                      onClick={() => setDistributionBy('pool')}
                    >
                      资源池
                    </Button>
                  </Button.Group>
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
              <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Alert
                  message="图表组件待实现"
                  description="这里将显示库存分布图表，目前使用表格模式查看数据"
                  type="info"
                  showIcon
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

      {/* 库存变化趋势 */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>库存变化趋势</span>
                <Tag color="blue">实线：历史数据</Tag>
                <Tag color="purple">虚线：预测数据</Tag>
                <Tooltip title="图表显示库存总量、可用库存和已分配库存的变化趋势">
                  <InfoCircleOutlined style={{ color: '#999' }} />
                </Tooltip>
              </div>
            }
            className="trend-card"
            extra={
              <div style={{ fontSize: '12px', color: '#666' }}>
                支持点击查看详细数据
              </div>
            }
          >
            <div style={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Alert
                message="图表组件待实现"
                description="这里将显示库存变化趋势图表"
                type="info"
                showIcon
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // 库存列表内容
  const renderInventoryListContent = () => (
    <div>
      <Table
        columns={inventoryListColumns}
        dataSource={inventoryListData}
        pagination={{
          pageSize: 10,
          total: 100,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        size="middle"
        rowKey="key"
      />
    </div>
  );

  // Tab配置
  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <OverviewOutlined />
          库存总览
        </span>
      ),
      children: renderOverviewContent()
    },
    {
      key: 'list',
      label: (
        <span>
          <UnorderedListOutlined />
          库存列表
        </span>
      ),
      children: renderInventoryListContent()
    }
  ];

  return (
    <div className="inventory-management-page">
      {/* 筛选面板 */}
      <Card className="filter-card" size="small" style={{ marginBottom: 16 }}>
        <FilterPanel
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

export default InventoryManagementPage;
