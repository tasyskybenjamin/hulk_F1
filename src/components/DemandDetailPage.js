import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Tooltip,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Pagination,
  Divider
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ExportOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { RangePicker } = DatePicker;

const DemandDetailPage = ({ filters, onFilterChange }) => {
  const [detailData, setDetailData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);

  // 渠道、场景、产品类型映射（与筛选面板保持一致）
  const channelMap = {
    'daily': '日常',
    'activity': '活动',
    'emergency': '应急',
    'special': '专项',
    'resource-pool': '资源池'
  };

  const scenarioMap = {
    'avatar-daily': 'Avatar日常供给',
    'scheduled-expansion': '预约扩容',
    '2025-qixi': '25年七夕',
    '2025-0818-voucher': '2025年08.18神券节活动',
    '2025-double11': '2025年双11活动',
    '2025-618': '2025年618活动',
    'emergency-pool-supplement': '应急资源池补充',
    'special-project-1': '专项项目1',
    'special-project-2': '专项项目2',
    'elastic': '弹性伸缩',
    'cargo': 'Cargo',
    'finance-zone': '金融专区',
    'settlement-unit': '结算单元'
  };

  const productTypeMap = {
    'general': '通用',
    'economy': '经济',
    'high-performance': '高性能',
    'dedicated-host': '专用宿主机'
  };

  // 模拟需求明细数据 - 包含多样化的渠道、场景、产品类型
  const mockDetailData = [
    {
      id: 'REQ-2025-001',
      demandChannel: 'activity',
      demandScenario: '2025-qixi',
      customerName: '点评事业部-...',
      demandStatus: 'confirmed-pending',
      region: 'beijing',
      clusterType: '通用',
      productType: 'economy',
      demandAmount: 3,
      actualAmount: 0,
      serviceCount: 30,
      expectedDeliveryTime: '2025-08-18 20:00:00',
      datacenter: 'hh'
    },
    {
      id: 'REQ-2025-002',
      demandChannel: 'daily',
      demandScenario: 'avatar-daily',
      customerName: '美团外卖...',
      demandStatus: 'delivered',
      region: 'beijing',
      clusterType: '通用',
      productType: 'general',
      demandAmount: 1200,
      actualAmount: 1200,
      serviceCount: 15,
      expectedDeliveryTime: '2025-08-15 15:00:00',
      datacenter: 'hh'
    },
    {
      id: 'REQ-2025-003',
      demandChannel: 'activity',
      demandScenario: '2025-0818-voucher',
      customerName: '美团优选...',
      demandStatus: 'delivered',
      region: 'shanghai',
      clusterType: '通用',
      productType: 'high-performance',
      demandAmount: 800,
      actualAmount: 800,
      serviceCount: 8,
      expectedDeliveryTime: '2025-08-15 08:00:00',
      datacenter: 'pj'
    },
    {
      id: 'REQ-2025-004',
      demandChannel: 'emergency',
      demandScenario: 'emergency-pool-supplement',
      customerName: '平台运维...',
      demandStatus: 'pending-evaluation',
      region: 'beijing',
      clusterType: '高性能',
      productType: 'dedicated-host',
      demandAmount: 500,
      actualAmount: 0,
      serviceCount: 5,
      expectedDeliveryTime: '2025-08-20 08:00:00',
      datacenter: 'hh'
    },
    {
      id: 'REQ-2025-005',
      demandChannel: 'resource-pool',
      demandScenario: 'elastic',
      customerName: '弹性计算...',
      demandStatus: 'confirmed-pending',
      region: 'huailai',
      clusterType: '弹性集群',
      productType: 'economy',
      demandAmount: 2000,
      actualAmount: 0,
      serviceCount: 20,
      expectedDeliveryTime: '2025-08-19 10:00:00',
      datacenter: 'hl'
    },
    {
      id: 'REQ-2025-006',
      demandChannel: 'special',
      demandScenario: 'special-project-1',
      customerName: '专项业务...',
      demandStatus: 'delivered',
      region: 'shanghai',
      clusterType: '专用',
      productType: 'general',
      demandAmount: 300,
      actualAmount: 300,
      serviceCount: 3,
      expectedDeliveryTime: '2025-08-16 14:00:00',
      datacenter: 'pj'
    },
    {
      id: 'REQ-2025-007',
      demandChannel: 'activity',
      demandScenario: '2025-double11',
      customerName: '美团买菜...',
      demandStatus: 'recycled',
      region: 'beijing',
      clusterType: '通用',
      productType: 'high-performance',
      demandAmount: 1500,
      actualAmount: 1500,
      serviceCount: 12,
      expectedDeliveryTime: '2025-08-10 08:00:00',
      datacenter: 'hh,mt'
    },
    {
      id: 'REQ-2025-008',
      demandChannel: 'daily',
      demandScenario: 'scheduled-expansion',
      customerName: '美团打车...',
      demandStatus: 'delivered',
      region: 'shanghai',
      clusterType: '通用',
      productType: 'economy',
      demandAmount: 600,
      actualAmount: 600,
      serviceCount: 6,
      expectedDeliveryTime: '2025-08-14 21:00:00',
      datacenter: 'pj'
    },
    {
      id: 'REQ-2025-009',
      demandChannel: 'resource-pool',
      demandScenario: 'cargo',
      customerName: 'Cargo平台...',
      demandStatus: 'delivered',
      region: 'beijing',
      clusterType: 'Cargo集群',
      productType: 'general',
      demandAmount: 400,
      actualAmount: 400,
      serviceCount: 4,
      expectedDeliveryTime: '2025-08-14 21:00:00',
      datacenter: 'hh'
    },
    {
      id: 'REQ-2025-010',
      demandChannel: 'activity',
      demandScenario: '2025-618',
      customerName: '美团闪购...',
      demandStatus: 'rejected',
      region: 'huailai',
      clusterType: '通用',
      productType: 'economy',
      demandAmount: 200,
      actualAmount: 0,
      serviceCount: 2,
      expectedDeliveryTime: '2025-08-12 21:00:00',
      datacenter: 'hl'
    }
  ];

  // 获取需求明细数据
  const fetchDetailData = async (filterParams, paginationParams = pagination) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));

      // 更新刷新时间
      const now = new Date();
      const timeString = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '-');
      setLastRefreshTime(timeString);

      // 模拟分页数据
      const total = 156;
      const startIndex = (paginationParams.current - 1) * paginationParams.pageSize;
      const endIndex = startIndex + paginationParams.pageSize;

      // 生成更多模拟数据
      const allData = [];
      for (let i = 0; i < total; i++) {
        const baseData = mockDetailData[i % mockDetailData.length];
        allData.push({
          ...baseData,
          id: `REQ-2025-${String(i + 1).padStart(3, '0')}`,
          key: `REQ-2025-${String(i + 1).padStart(3, '0')}`
        });
      }

      // 根据筛选条件过滤数据
      let filteredData = allData;

      // 需求渠道筛选
      if (filterParams.demandChannel && filterParams.demandChannel.length > 0) {
        filteredData = filteredData.filter(item =>
          filterParams.demandChannel.includes(item.demandChannel)
        );
      }

      // 需求场景筛选
      if (filterParams.demandScenario && filterParams.demandScenario.length > 0) {
        filteredData = filteredData.filter(item =>
          filterParams.demandScenario.includes(item.demandScenario)
        );
      }

      // 产品类型筛选
      if (filterParams.productType && filterParams.productType.length > 0) {
        filteredData = filteredData.filter(item =>
          filterParams.productType.includes(item.productType)
        );
      }

      // 需求状态筛选
      if (filterParams.demandStatus && filterParams.demandStatus.length > 0) {
        filteredData = filteredData.filter(item =>
          filterParams.demandStatus.includes(item.demandStatus)
        );
      }

      // 时间范围筛选
      if (filterParams.dateRange && filterParams.dateRange.length === 2) {
        const [startDate, endDate] = filterParams.dateRange;
        filteredData = filteredData.filter(item => {
          const itemDate = new Date(item.expectedDeliveryTime);
          return itemDate >= startDate.toDate() && itemDate <= endDate.toDate();
        });
      }

      // 更新总数和分页数据
      const filteredTotal = filteredData.length;
      const filteredStartIndex = (paginationParams.current - 1) * paginationParams.pageSize;
      const filteredEndIndex = filteredStartIndex + paginationParams.pageSize;

      setDetailData(filteredData.slice(filteredStartIndex, filteredEndIndex));
      setPagination({
        ...paginationParams,
        total: filteredTotal
      });
      setPagination({
        ...paginationParams,
        total
      });
    } catch (error) {
      console.error('获取需求明细数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetailData(filters);
  }, [filters]);

  // 状态标签渲染
  const renderStatusTag = (status) => {
    const statusMap = {
      'pending-evaluation': { color: 'orange', text: '待评估' },
      'confirmed-pending': { color: 'red', text: '确认待交付' },
      'delivered': { color: 'green', text: '已交付' },
      'recycled': { color: 'purple', text: '已回收' },
      'rejected': { color: 'default', text: '驳回' }
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 优先级标签渲染
  const renderPriorityTag = (priority) => {
    const priorityMap = {
      'urgent': { color: 'red', text: '紧急' },
      'high': { color: 'orange', text: '高' },
      'medium': { color: 'blue', text: '中' },
      'low': { color: 'default', text: '低' }
    };
    const config = priorityMap[priority] || { color: 'default', text: priority };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 表格列定义 - 根据参考图片调整列结构
  const columns = [
    {
      title: '需求渠道',
      dataIndex: 'demandChannel',
      key: 'demandChannel',
      width: 100,
      render: (value) => channelMap[value] || value,
      filters: [
        { text: '日常', value: 'daily' },
        { text: '活动', value: 'activity' },
        { text: '应急', value: 'emergency' },
        { text: '专项', value: 'special' },
        { text: '资源池', value: 'resource-pool' }
      ],
      onFilter: (value, record) => record.demandChannel === value
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 120,
      ellipsis: {
        showTitle: false
      },
      render: (text) => (
        <Tooltip title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: '需求状态',
      dataIndex: 'demandStatus',
      key: 'demandStatus',
      width: 120,
      render: renderStatusTag,
      filters: [
        { text: '待评估', value: 'pending-evaluation' },
        { text: '确认待交付', value: 'confirmed-pending' },
        { text: '已交付', value: 'delivered' },
        { text: '已回收', value: 'recycled' },
        { text: '驳回', value: 'rejected' }
      ],
      onFilter: (value, record) => record.demandStatus === value
    },
    {
      title: '需求场景',
      dataIndex: 'demandScenario',
      key: 'demandScenario',
      width: 150,
      ellipsis: {
        showTitle: false
      },
      render: (text) => {
        const displayText = scenarioMap[text] || text;
        return (
          <Tooltip title={displayText}>
            {displayText}
          </Tooltip>
        );
      }
    },
    {
      title: '期望交付时间',
      dataIndex: 'expectedDeliveryTime',
      key: 'expectedDeliveryTime',
      width: 150,
      sorter: (a, b) => new Date(a.expectedDeliveryTime) - new Date(b.expectedDeliveryTime),
      render: (text) => text ? text.split(' ')[0] : '-' // 只显示日期部分
    },
    {
      title: '产品类型',
      dataIndex: 'productType',
      key: 'productType',
      width: 100,
      render: (value) => productTypeMap[value] || value
    },
    {
      title: '集群组/专区',
      dataIndex: 'clusterType',
      key: 'clusterType',
      width: 120
    },
    {
      title: '地域',
      dataIndex: 'region',
      key: 'region',
      width: 80
    },
    {
      title: '机房',
      dataIndex: 'datacenter',
      key: 'datacenter',
      width: 100,
      ellipsis: {
        showTitle: false
      },
      render: (text) => (
        <Tooltip title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: '预报备核数',
      dataIndex: 'demandAmount',
      key: 'demandAmount',
      width: 100,
      align: 'right',
      render: (value) => value,
      sorter: (a, b) => a.demandAmount - b.demandAmount
    },
    {
      title: '实际报备核数',
      dataIndex: 'actualAmount',
      key: 'actualAmount',
      width: 120,
      align: 'right',
      render: (value) => value,
      sorter: (a, b) => a.actualAmount - b.actualAmount
    },
    {
      title: '填报服务数',
      dataIndex: 'serviceCount',
      key: 'serviceCount',
      width: 100,
      align: 'right',
      render: (value) => value,
      sorter: (a, b) => a.serviceCount - b.serviceCount
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => console.log('查看详情:', record)}>
            查看详情
          </Button>
          <Button type="link" size="small" onClick={() => console.log('状态流转:', record)}>
            状态流转
          </Button>
          <Button type="link" size="small" onClick={() => console.log('预分配:', record)}>
            预分配
          </Button>
        </Space>
      )
    }
  ];

  // 表格行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      console.log('全选状态:', selected, selectedRows, changeRows);
    }
  };

  // 处理分页变化
  const handleTableChange = (paginationConfig, filters, sorter) => {
    fetchDetailData(filters, paginationConfig);
  };

  // 批量操作
  const handleBatchOperation = (operation) => {
    console.log(`批量${operation}:`, selectedRowKeys);
    // 这里可以添加批量操作的逻辑
  };

  // 初始化数据
  useEffect(() => {
    fetchDetailData(filters);
  }, []);

  // 监听筛选条件变化
  useEffect(() => {
    fetchDetailData(filters);
  }, [filters]);

  return (
    <div className="demand-detail-page">
      {/* 操作栏 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <span style={{ fontSize: '14px', color: '#666' }}>
                共 {pagination.total} 条记录
              </span>
              {selectedRowKeys.length > 0 && (
                <>
                  <Divider type="vertical" />
                  <span style={{ fontSize: '14px', color: '#1890ff' }}>
                    已选择 {selectedRowKeys.length} 项
                  </span>
                  <Button
                    size="small"
                    onClick={() => handleBatchOperation('导出')}
                  >
                    批量导出
                  </Button>
                  <Button
                    size="small"
                    onClick={() => handleBatchOperation('删除')}
                    danger
                  >
                    批量删除
                  </Button>
                </>
              )}
            </Space>
          </Col>
          <Col>
            <Space>
              {lastRefreshTime && (
                <span style={{
                  fontSize: '12px',
                  color: '#666',
                  marginRight: '16px'
                }}>
                  最近一次数据刷新时间：{lastRefreshTime}
                </span>
              )}
              <Button
                icon={<ExportOutlined />}
                onClick={() => console.log('导出全部')}
              >
                导出
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchDetailData(filters)}
                loading={loading}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 需求明细表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={detailData}
          rowSelection={rowSelection}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          onChange={handleTableChange}
          scroll={{ x: 1800, y: 600 }}
          size="small"
          bordered
        />
      </Card>
    </div>
  );
};

export default DemandDetailPage;
