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
  Select,
  DatePicker,
  Slider,
  InputNumber,
  Divider,
  Progress,
  Tabs
} from 'antd';

import {
  EyeOutlined,
  TableOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  RiseOutlined,
  AlertOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import './InventoryManagementPage.css';

const { RangePicker } = DatePicker;

const InventoryManagementPage = () => {
  const [filters, setFilters] = useState({
    dateRange: [dayjs().subtract(1, 'month'), dayjs().add(1, 'month')],
    scenario: null,
    clusterGroup: null,
    specialZone: null,
    caller: null
  });

  const [summaryData, setSummaryData] = useState({
    totalInventory: 0,
    availableInventory: 0,
    reservedInventory: 0,
    outboundInventory: 0,
    safetyReserve: 0,
    emergencyPool: 0,
    operationPool: 0
  });

  const [distributionData, setDistributionData] = useState([]);
  const [trendData, setTrendData] = useState({ labels: [], datasets: {} });
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('chart');
  const [distributionBy, setDistributionBy] = useState('region');
  const [activeTab, setActiveTab] = useState('available');
  const [showDatacenterDetails, setShowDatacenterDetails] = useState(false);
  // 场景选项
  const scenarioOptions = [
    { value: 'business', label: '业务' },
    { value: 'self-operation', label: '自运营' },
    { value: 'operation', label: '运维' },
    { value: 'emergency', label: '紧急资源' },
    { value: 'platform', label: '平台' }
  ];

  // 集群组选项
  const clusterGroupOptions = [
    { value: 'hulk-general', label: 'hulk-general' },
    { value: 'hulk-arm', label: 'hulk-arm' },
    { value: 'txserverless', label: 'txserverless' }
  ];

  // 专区选项（根据集群组动态变化）
  const getSpecialZoneOptions = (clusterGroup) => {
    const specialZoneMap = {
      'hulk-general': [
        { value: 'default', label: 'default' },
        { value: 'hulk_pool_buffer', label: 'hulk_pool_buffer' },
        { value: 'hulk_holiday', label: 'hulk_holiday' },
        { value: 'jinrong_hulk', label: '金融' },
        { value: 'huidu_hulk', label: '灰度专区' }
      ],
      'hulk-arm': [
        { value: 'default', label: 'default' }
      ],
      'txserverless': [
        { value: 'default', label: 'default' }
      ]
    };
    return specialZoneMap[clusterGroup] || [];
  };

  // 调用方选项
  const callerOptions = [
    { value: 'avatar', label: 'avatar' },
    { value: 'unit_4', label: 'unit_4' },
    { value: 'avatar_reserved', label: 'avatar_reserved' },
    { value: 'migration', label: 'migration' },
    { value: 'holiday', label: 'holiday' },
    { value: 'policy', label: 'policy' },
    { value: 'cargo', label: 'cargo' },
    { value: 'n_plus_one', label: 'n_plus_one' },
    { value: 'hdr', label: 'hdr' },
    { value: 'maoyan', label: 'maoyan' },
    { value: 'hulk_holiday_admin', label: 'hulk_holiday_admin' },
    { value: 'migrate_hulk_holiday', label: 'migrate_hulk_holiday' },
    { value: 'hulk_holiday', label: 'hulk_holiday' },
    { value: 'jinrong', label: 'jinrong' },
    { value: 'avatarjinrong', label: 'avatarjinrong' },
    { value: 'migrationjinrong', label: 'migrationjinrong' },
    { value: 'policy_jinrong_hulk', label: 'policy+jinrong_hulk' },
    { value: 'hulk_arm_admin', label: 'hulk_arm_admin' },
    { value: 'hulk_arm', label: 'hulk_arm' },
    { value: 'migrate_hulk_arm', label: 'migrate_hulk_arm' },
    { value: 'policy_campaign_tx', label: 'policy_campaign_tx' },
    { value: 'policy_txserverless', label: 'policy+txserverless' },
    { value: 'txserverless_migration', label: 'txserverless_migration' }
  ];

  // 库存分类选项
  const inventoryCategories = [
    { key: 'total', label: '汇总', color: '#1890ff' },
    { key: 'available', label: '可用库存', color: '#52c41a' },
    { key: 'reserved', label: '已预占', color: '#faad14' },
    { key: 'outbound', label: '已出库', color: '#f5222d' },
    { key: 'safety', label: '安全预留', color: '#722ed1' },
    { key: 'emergency', label: '紧急资源', color: '#fa541c' },
    { key: 'operation', label: '运维资源', color: '#13c2c2' }
  ];

  // 模拟数据获取
  const fetchInventoryData = async (filterParams) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 模拟汇总数据
      setSummaryData({
        totalInventory: 15680,
        availableInventory: 8420,
        reservedInventory: 3200,
        outboundInventory: 1800,
        safetyReserve: 1560,
        emergencyPool: 600,
        operationPool: 100
      });

      // 模拟分布数据
      const mockDistributionData = {
        region: [
          { name: '北京', value: 6800, percentage: 43.4, available: 3600, reserved: 1400, safety: 800, emergency: 300, operation: 50 },
          { name: '上海', value: 4200, percentage: 26.8, available: 2300, reserved: 900, safety: 500, emergency: 200, operation: 30 },
          { name: '怀来', value: 3680, percentage: 23.5, available: 2020, reserved: 700, safety: 200, emergency: 80, operation: 20 },
          { name: '其他', value: 1000, percentage: 6.4, available: 500, reserved: 200, safety: 60, emergency: 20, operation: 0 }
        ],
        datacenter: [
          { name: '北京-DC1', value: 3400, percentage: 21.7, available: 1800, reserved: 700, safety: 400, emergency: 150, operation: 25, region: '北京' },
          { name: '北京-DC2', value: 3400, percentage: 21.7, available: 1800, reserved: 700, safety: 400, emergency: 150, operation: 25, region: '北京' },
          { name: '上海-DC1', value: 2100, percentage: 13.4, available: 1150, reserved: 450, safety: 250, emergency: 100, operation: 15, region: '上海' },
          { name: '上海-DC2', value: 2100, percentage: 13.4, available: 1150, reserved: 450, safety: 250, emergency: 100, operation: 15, region: '上海' },
          { name: '怀来-DC1', value: 1840, percentage: 11.7, available: 1010, reserved: 350, safety: 100, emergency: 40, operation: 10, region: '怀来' },
          { name: '怀来-DC2', value: 1840, percentage: 11.7, available: 1010, reserved: 350, safety: 100, emergency: 40, operation: 10, region: '怀来' },
          { name: '其他-DC1', value: 1000, percentage: 6.4, available: 500, reserved: 200, safety: 60, emergency: 20, operation: 0, region: '其他' }
        ],
        scenario: [
          { name: '业务', value: 9500, percentage: 60.6, available: 5200, reserved: 2000, safety: 1000, emergency: 200, operation: 100 },
          { name: '自运营', value: 3200, percentage: 20.4, available: 1800, reserved: 800, safety: 300, emergency: 200, operation: 100 },
          { name: '运维', value: 1500, percentage: 9.6, available: 800, reserved: 300, safety: 200, emergency: 150, operation: 50 },
          { name: '紧急资源', value: 980, percentage: 6.2, available: 420, reserved: 100, safety: 60, emergency: 50, operation: 0 },
          { name: '平台', value: 500, percentage: 3.2, available: 200, reserved: 0, safety: 0, emergency: 0, operation: 0 }
        ],
        category: [
          { name: '可用库存', value: 8420, percentage: 53.7 },
          { name: '已出库', value: 3200, percentage: 20.4 },
          { name: '安全预留', value: 1560, percentage: 9.9 },
          { name: '紧急资源', value: 600, percentage: 3.8 },
          { name: '运维资源', value: 100, percentage: 0.6 }
        ]
      };

      // 根据分布维度和机房详情开关来设置数据
      let currentData;
      if (distributionBy === 'region') {
        currentData = showDatacenterDetails ? mockDistributionData.datacenter : mockDistributionData.region;
      } else {
        currentData = mockDistributionData[distributionBy] || mockDistributionData.region;
      }
      setDistributionData(currentData);

      // 模拟趋势数据
      const dates = [];
      const inventoryLines = {
        total: [],
        available: [],
        reserved: [],
        outbound: [],
        safety: [],
        emergency: [],
        operation: []
      };

      for (let i = 30; i >= -60; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);

        const isPast = i >= 0;
        const baseValue = 15000;
        const trend = isPast ? 0 : Math.floor(i / -10) * 500; // 未来增长趋势

        inventoryLines.total.push({
          value: baseValue + Math.floor(Math.random() * 1000) + trend,
          isPast,
          bubbles: !isPast && i % 15 === 0 ? [{
            reason: i % 30 === 0 ? '私有云采购' : '公有云采购',
            amount: 500,
            date: date.toISOString().split('T')[0]
          }] : []
        });

        inventoryLines.available.push({
          value: Math.floor((baseValue + trend) * 0.55) + Math.floor(Math.random() * 500),
          isPast,
          bubbles: !isPast && i % 15 === 0 ? [{
            reason: i % 30 === 0 ? '私有云采购' : '公有云采购',
            amount: 300,
            date: date.toISOString().split('T')[0]
          }] : []
        });

        inventoryLines.reserved.push({
          value: Math.floor((baseValue + trend) * 0.2) + Math.floor(Math.random() * 200),
          isPast
        });

        inventoryLines.outbound.push({
          value: Math.floor((baseValue + trend) * 0.12) + Math.floor(Math.random() * 100),
          isPast
        });

        inventoryLines.safety.push({
          value: Math.floor((baseValue + trend) * 0.1) + Math.floor(Math.random() * 100),
          isPast
        });

        inventoryLines.emergency.push({
          value: Math.floor((baseValue + trend) * 0.04) + Math.floor(Math.random() * 50),
          isPast
        });

        inventoryLines.operation.push({
          value: Math.floor((baseValue + trend) * 0.01) + Math.floor(Math.random() * 20),
          isPast
        });
      }

      setTrendData({
        labels: dates,
        datasets: inventoryLines
      });

    } catch (error) {
      console.error('获取库存数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData(filters);
  }, [filters, distributionBy, showDatacenterDetails]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      // 当集群组改变时，清空专区选择
      if (key === 'clusterGroup') {
        newFilters.specialZone = null;
      }
      return newFilters;
    });
  };

  // 处理库存增加事件点击
  const handleEventClick = (params) => {
    if (params.componentType === 'series' && params.seriesName === '库存增加事件') {
      const eventData = params.data;
      const eventType = eventData.name; // 私有云采购 或 公有云采购
      const eventDate = trendData.labels[eventData.value[0]];
      const eventAmount = eventData.value[2];

      // 构建跳转参数
      const queryParams = new URLSearchParams({
        type: eventType,
        date: eventDate,
        amount: eventAmount,
        source: 'inventory-trend'
      });

      // 跳转到资源筹措页面
      window.open(`/resource-planning?${queryParams.toString()}`, '_blank');
    }
  };

  // 库存分布图表配置
  const getDistributionChartOption = () => {
    if (distributionBy === 'region') {
      return {
        title: {
          text: showDatacenterDetails ? '库存分布（按机房）' : '库存分布（按地域）',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '库存分布',
            type: 'pie',
            radius: '50%',
            data: distributionData.map(item => ({
              value: item.value,
              name: item.name
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
    } else {
      return {
        title: {
          text: '库存分布（按分类）',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: distributionData.map(item => item.name)
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '库存量',
            type: 'bar',
            data: distributionData.map(item => item.value),
            itemStyle: {
              color: '#1890ff'
            }
          }
        ]
      };
    }
  };

  // 根据Tab获取对应的库存分类
  const getTabCategories = (tabKey) => {
    switch (tabKey) {
      case 'overview':
        return ['total'];
      case 'available':
        return ['available'];
      case 'reserved':
        return ['reserved'];
      case 'outbound':
        return ['outbound'];
      case 'safety':
        return ['safety'];
      case 'emergency':
        return ['emergency'];
      case 'operation':
        return ['operation'];
      default:
        return ['total'];
    }
  };

  // 库存变化趋势图表配置
  const getTrendChartOption = (tabKey = 'overview') => {
    if (!trendData.labels || trendData.labels.length === 0 || !trendData.datasets) {
      return {
        title: {
          text: '库存变化趋势',
          left: 'center'
        },
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value',
          name: '库存量'
        },
        series: []
      };
    }

    const series = [];
    const selectedCategories = getTabCategories(tabKey);
    const categories = inventoryCategories.filter(cat => selectedCategories.includes(cat.key) && !cat.hidden);
    const nowIndex = trendData.labels ? trendData.labels.findIndex(date => dayjs(date).isAfter(dayjs(), 'day')) : 30;

    categories.forEach(category => {
      const data = trendData.datasets[category.key];
      if (data && data.length > 0) {
        // 合并历史和预测数据为一条线，但用不同样式
        const allData = data.map((item, index) => ({
          value: item.value,
          isPast: item.isPast,
          index: index
        }));

        // 历史部分（实线）
        const pastData = allData.filter(item => item.isPast).map(item => [item.index, item.value]);
        // 预测部分（虚线）
        const futureData = allData.filter(item => !item.isPast).map(item => [item.index, item.value]);

        if (pastData.length > 0) {
          series.push({
            name: category.label,
            type: 'line',
            data: pastData,
            lineStyle: { type: 'solid', color: category.color, width: 2 },
            itemStyle: { color: category.color },
            symbol: 'circle',
            symbolSize: 4,
            showSymbol: false
          });
        }

        if (futureData.length > 0) {
          series.push({
            name: category.label,
            type: 'line',
            data: futureData,
            lineStyle: { type: 'dashed', color: category.color, width: 2 },
            itemStyle: { color: category.color },
            symbol: 'circle',
            symbolSize: 4,
            showSymbol: false,
            legendHoverLink: false
          });
        }

        // 添加库存增加事件标注（三角叹号）
        const eventData = [];
        data.forEach((item, index) => {
          if (item.bubbles && item.bubbles.length > 0) {
            item.bubbles.forEach(bubble => {
              eventData.push({
                name: bubble.reason,
                value: [index, item.value, bubble.amount],
                itemStyle: { color: '#faad14' }
              });
            });
          }
        });

        if (eventData.length > 0) {
          series.push({
            name: '库存增加事件',
            type: 'scatter',
            data: eventData,
            symbol: 'triangle', // 使用三角形符号
            symbolSize: 18,
            itemStyle: {
              color: '#faad14',
              borderColor: '#d48806',
              borderWidth: 2
            },
            emphasis: {
              itemStyle: {
                color: '#ffc53d',
                borderColor: '#d48806',
                borderWidth: 3
              }
            },
            tooltip: {
              formatter: (params) => {
                return `${params.data.name}<br/>增加量: ${params.data.value[2]} 核<br/><span style="color: #1890ff;">点击查看详情</span>`;
              }
            },
            zlevel: 10 // 确保事件标记显示在最上层
          });
        }
      }
    });

    // 去重图例名称
    const uniqueLegendData = [...new Set(series.map(s => s.name))];

    // 添加NOW线作为单独的series
    series.push({
      name: 'NOW线',
      type: 'line',
      showInLegend: false, // 不在图例中显示
      markLine: {
        silent: true,
        lineStyle: {
          color: '#ff4d4f',
          type: 'dashed', // 改为虚线
          width: 2
        },
        label: {
          show: true,
          position: 'insideEndTop',
          formatter: 'NOW',
          color: '#ff4d4f',
          fontSize: 12,
          fontWeight: 'bold'
        },
        data: [{
          xAxis: nowIndex >= 0 ? nowIndex : Math.floor(trendData.labels.length / 2)
        }]
      },
      data: [] // 空数据，只用于显示markLine
    });

    return {
      title: {
        text: '库存变化趋势',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data: uniqueLegendData,
        top: 35,
        type: 'scroll'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: trendData.labels,
        axisLabel: {
          formatter: (value) => dayjs(value).format('MM/DD'),
          rotate: 45
        },
        boundaryGap: false
      },
      yAxis: {
        type: 'value',
        name: '库存量（核）',
        nameLocation: 'middle',
        nameGap: 50,
        axisLabel: {
          formatter: '{value}'
        }
      },
      series: series
    };
  };

  return (
    <div className="inventory-management-page">
      {/* 筛选面板 */}
      <Card className="filter-card" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <div className="filter-item">
              <label className="filter-label">时间范围：</label>
              <RangePicker
                value={filters.dateRange}
                onChange={(dates) => handleFilterChange('dateRange', dates)}
                placeholder={['开始日期', '结束日期']}
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
              />
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div className="filter-item">
              <label className="filter-label">场景：</label>
              <Select
                value={filters.scenario}
                onChange={(value) => handleFilterChange('scenario', value)}
                placeholder="请选择场景"
                style={{ width: '100%' }}
                allowClear
              >
                {scenarioOptions.map(option => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div className="filter-item">
              <label className="filter-label">集群组：</label>
              <Select
                value={filters.clusterGroup}
                onChange={(value) => handleFilterChange('clusterGroup', value)}
                placeholder="请选择集群组"
                style={{ width: '100%' }}
                allowClear
              >
                {clusterGroupOptions.map(option => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div className="filter-item">
              <label className="filter-label">专区：</label>
              <Select
                value={filters.specialZone}
                onChange={(value) => handleFilterChange('specialZone', value)}
                placeholder="请选择专区"
                style={{ width: '100%' }}
                allowClear
                disabled={!filters.clusterGroup}
              >
                {getSpecialZoneOptions(filters.clusterGroup).map(option => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>

        <Row gutter={[16, 16]} align="middle" style={{ marginTop: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <div className="filter-item">
              <label className="filter-label">调用方：</label>
              <Select
                value={filters.caller}
                onChange={(value) => handleFilterChange('caller', value)}
                placeholder="请选择调用方"
                style={{ width: '100%' }}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {callerOptions.map(option => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 汇总统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总库存"
              value={summaryData.totalInventory}
              valueStyle={{ color: '#1890ff' }}
              suffix="核"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="可用库存"
              value={summaryData.availableInventory}
              valueStyle={{ color: '#52c41a' }}
              suffix="核"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已出库"
              value={summaryData.reservedInventory}
              valueStyle={{ color: '#faad14' }}
              suffix="核"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="紧急资源"
              value={summaryData.emergencyPool}
              valueStyle={{ color: '#fa541c' }}
              suffix="核"
            />
          </Card>
        </Col>
      </Row>

      {/* 关键资源池展示 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card
            title={
              <span>
                <AlertOutlined style={{ color: '#fa541c', marginRight: 8 }} />
                紧急资源
              </span>
            }
            size="small"
          >
            <Statistic
              title="当前余量"
              value={summaryData.emergencyPool}
              suffix="核"
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            title={
              <span>
                <SettingOutlined style={{ color: '#13c2c2', marginRight: 8 }} />
                运维资源
              </span>
            }
            size="small"
          >
            <Statistic
              title="当前余量"
              value={summaryData.operationPool}
              suffix="核"
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            title={
              <span>
                <InfoCircleOutlined style={{ color: '#722ed1', marginRight: 8 }} />
                安全预留
              </span>
            }
            size="small"
          >
            <Statistic
              title="当前余量"
              value={summaryData.safetyReserve}
              suffix="核"
              valueStyle={{ color: '#722ed1' }}
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
                <span>库存分布</span>
                <Space>
                  <span style={{ fontSize: '12px', color: '#666' }}>分布维度：</span>
                  <Button.Group size="small">
                    <Button
                      type={distributionBy === 'region' ? 'primary' : 'default'}
                      onClick={() => setDistributionBy('region')}
                    >
                      按地域
                    </Button>
                    <Button
                      type={distributionBy === 'scenario' ? 'primary' : 'default'}
                      onClick={() => setDistributionBy('scenario')}
                    >
                      按场景
                    </Button>
                    <Button
                      type={distributionBy === 'category' ? 'primary' : 'default'}
                      onClick={() => setDistributionBy('category')}
                    >
                      按分类
                    </Button>
                  </Button.Group>
                  {distributionBy === 'region' && (
                    <>
                      <span style={{ fontSize: '12px', color: '#666' }}>机房详情：</span>
                      <Switch
                        checked={showDatacenterDetails}
                        onChange={setShowDatacenterDetails}
                        size="small"
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
            style={{ minHeight: '400px' }}
          >
            {viewMode === 'chart' ? (
              <div style={{ height: '350px' }}>
                <ReactECharts option={getDistributionChartOption()} style={{ height: '100%' }} />
              </div>
            ) : (
              <Table
                columns={[
                  {
                    title: distributionBy === 'region'
                      ? (showDatacenterDetails ? '机房' : '地域')
                      : distributionBy === 'scenario'
                        ? '场景'
                        : '分类',
                    dataIndex: 'name',
                    key: 'name'
                  },
                  { title: '库存量', dataIndex: 'value', key: 'value', render: (value) => `${value} 核` },
                  { title: '占比', dataIndex: 'percentage', key: 'percentage', render: (value) => `${value}%` }
                ]}
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
            title="库存变化趋势"
            className="trend-card"
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'overview',
                  label: '总库存',
                  children: (
                    <div style={{ height: '400px' }}>
                      <ReactECharts
                        option={getTrendChartOption('overview')}
                        style={{ height: '100%' }}
                        onEvents={{
                          'click': handleEventClick
                        }}
                      />
                    </div>
                  )
                },
                {
                  key: 'available',
                  label: '可用库存（包含库存更新事件）',
                  children: (
                    <div style={{ height: '400px' }}>
                      <ReactECharts
                        option={getTrendChartOption('available')}
                        style={{ height: '100%' }}
                        onEvents={{
                          'click': handleEventClick
                        }}
                      />
                    </div>
                  )
                },
                {
                  key: 'reserved',
                  label: '已预占库存',
                  children: (
                    <div style={{ height: '400px' }}>
                      <ReactECharts
                        option={getTrendChartOption('reserved')}
                        style={{ height: '100%' }}
                        onEvents={{
                          'click': handleEventClick
                        }}
                      />
                    </div>
                  )
                },
                {
                  key: 'outbound',
                  label: '已出库库存',
                  children: (
                    <div style={{ height: '400px' }}>
                      <ReactECharts
                        option={getTrendChartOption('outbound')}
                        style={{ height: '100%' }}
                        onEvents={{
                          'click': handleEventClick
                        }}
                      />
                    </div>
                  )
                },
                {
                  key: 'safety',
                  label: '安全预留',
                  children: (
                    <div style={{ height: '400px' }}>
                      <ReactECharts
                        option={getTrendChartOption('safety')}
                        style={{ height: '100%' }}
                        onEvents={{
                          'click': handleEventClick
                        }}
                      />
                    </div>
                  )
                },
                {
                  key: 'emergency',
                  label: '紧急资源',
                  children: (
                    <div style={{ height: '400px' }}>
                      <ReactECharts
                        option={getTrendChartOption('emergency')}
                        style={{ height: '100%' }}
                        onEvents={{
                          'click': handleEventClick
                        }}
                      />
                    </div>
                  )
                },
                {
                  key: 'operation',
                  label: '运维资源',
                  children: (
                    <div style={{ height: '400px' }}>
                      <ReactECharts
                        option={getTrendChartOption('operation')}
                        style={{ height: '100%' }}
                        onEvents={{
                          'click': handleEventClick
                        }}
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
};

export default InventoryManagementPage;
