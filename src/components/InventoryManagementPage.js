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

const InventoryManagementPage = ({ onNavigateToResourceProcurement }) => {
  const [filters, setFilters] = useState({
    dateRange: [
      dayjs().subtract(1, 'month').startOf('day'), // 开始日期 00:00:00
      dayjs().add(1, 'month').endOf('day').subtract(11, 'seconds') // 结束日期 23:59:49
    ],
    clusterGroup: [], // 改为多选，默认全部选中
    specialZone: [], // 改为多选
    caller: [], // 改为多选
    region: [], // 新增地域/机房多选
    inventoryStatus: 'available', // 新增库存状态，默认可用库存
    productType: [], // 新增产品类型多选
    inventoryScenario: [] // 新增库存场景多选
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
  // 库存场景选项
  const inventoryScenarioOptions = [
    { value: 'business', label: '业务', description: '承诺交付业务用户的资源' },
    { value: 'platform', label: '平台', description: '承诺交付平台用户的资源' },
    { value: 'operation', label: '运维', description: '运维场景使用资源' },
    { value: 'self-use', label: '自用', description: 'Hulk自用库存，作为资源缓冲等' },
    { value: 'emergency', label: '紧急资源', description: '用于业务紧急场景的资源' }
  ];

  // 产品类型选项
  const productTypeOptions = [
    { value: 'general', label: '通用' },
    { value: 'economic', label: '经济' },
    { value: 'high-performance', label: '高性能' }
  ];

  // 库存状态选项
  const inventoryStatusOptions = [
    { value: 'available', label: '可用库存' },
    { value: 'outbound', label: '已出库' }
  ];

  // 地域/机房选项
  const regionOptions = [
    { value: 'beijing', label: '北京' },
    { value: 'shanghai', label: '上海' },
    { value: 'huailai', label: '怀来' },
    { value: 'guangzhou', label: '广州' },
    { value: 'shenzhen', label: '深圳' }
  ];

  // 集群组选项
  const clusterGroupOptions = [
    { value: 'hulk-general', label: 'hulk-general' },
    { value: 'hulk-arm', label: 'hulk-arm' },
    { value: 'txserverless', label: 'txserverless' }
  ];

  // 专区选项（根据集群组动态变化）
  const getSpecialZoneOptions = (clusterGroups) => {
    const specialZoneMap = {
      'hulk-general': [
        { value: 'default', label: 'default', type: 'zone' },
        { value: 'hulk_pool_buffer', label: 'hulk_pool_buffer', type: 'zone' },
        { value: 'hulk_holiday', label: 'hulk_holiday', type: 'zone' },
        { value: 'jinrong_hulk', label: '金融', type: 'zone' },
        { value: 'huidu_hulk', label: '灰度专区', type: 'zone' },
        { value: 'hrs_non_zone_general', label: 'HRS视野内非专区部分', type: 'non-zone' }
      ],
      'hulk-arm': [
        { value: 'default', label: 'default', type: 'zone' },
        { value: 'hrs_non_zone_arm', label: 'HRS视野内非专区部分', type: 'non-zone' }
      ],
      'txserverless': [
        { value: 'default', label: 'default', type: 'zone' },
        { value: 'hrs_non_zone_serverless', label: 'HRS视野内非专区部分', type: 'non-zone' }
      ]
    };

    if (!clusterGroups || clusterGroups.length === 0) {
      return [];
    }

    // 如果选择了多个集群组，合并所有选项
    const allOptions = [];
    clusterGroups.forEach(group => {
      if (specialZoneMap[group]) {
        allOptions.push(...specialZoneMap[group]);
      }
    });

    // 去重
    const uniqueOptions = allOptions.filter((option, index, self) =>
      index === self.findIndex(o => o.value === option.value)
    );

    return uniqueOptions;
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
        newFilters.specialZone = [];
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

      // 跳转到资源筹措页面
      if (onNavigateToResourceProcurement) {
        onNavigateToResourceProcurement({
          type: eventType,
          date: eventDate,
          amount: eventAmount,
          source: 'inventory-trend'
        });
      } else {
        // 备用方案：通过修改URL hash的方式跳转
        window.location.hash = '#resource-procurement';

        // 存储跳转参数到sessionStorage，供资源筹措页面使用
        sessionStorage.setItem('procurementParams', JSON.stringify({
          type: eventType,
          date: eventDate,
          amount: eventAmount,
          source: 'inventory-trend'
        }));
      }
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
              <label className="filter-label">集群组：</label>
              <Select
                mode="multiple"
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
                mode="multiple"
                value={filters.specialZone}
                onChange={(value) => handleFilterChange('specialZone', value)}
                placeholder="请选择专区"
                style={{ width: '100%' }}
                allowClear
                disabled={!filters.clusterGroup || filters.clusterGroup.length === 0}
              >
                {getSpecialZoneOptions(filters.clusterGroup).map(option => (
                  <Select.Option key={option.value} value={option.value}>
                    <span style={{ color: option.type === 'non-zone' ? '#666' : 'inherit' }}>
                      {option.label}
                      {option.type === 'non-zone' && <span style={{ fontSize: '12px', marginLeft: 4 }}>(非专区)</span>}
                    </span>
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div className="filter-item">
              <label className="filter-label">调用方：</label>
              <Select
                mode="multiple"
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

        <Row gutter={[16, 16]} align="middle" style={{ marginTop: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <div className="filter-item">
              <label className="filter-label">地域/机房：</label>
              <Select
                mode="multiple"
                value={filters.region}
                onChange={(value) => handleFilterChange('region', value)}
                placeholder="请选择地域/机房"
                style={{ width: '100%' }}
                allowClear
              >
                {regionOptions.map(option => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div className="filter-item">
              <label className="filter-label">库存状态：</label>
              <Select
                value={filters.inventoryStatus}
                onChange={(value) => handleFilterChange('inventoryStatus', value)}
                placeholder="请选择库存状态"
                style={{ width: '100%' }}
              >
                {inventoryStatusOptions.map(option => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div className="filter-item">
              <label className="filter-label">产品类型：</label>
              <Select
                mode="multiple"
                value={filters.productType}
                onChange={(value) => handleFilterChange('productType', value)}
                placeholder="请选择产品类型"
                style={{ width: '100%' }}
                allowClear
              >
                {productTypeOptions.map(option => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div className="filter-item">
              <label className="filter-label">库存场景：</label>
              <Select
                mode="multiple"
                value={filters.inventoryScenario}
                onChange={(value) => handleFilterChange('inventoryScenario', value)}
                placeholder="请选择库存场景"
                style={{ width: '100%' }}
                allowClear
              >
                {inventoryScenarioOptions.map(option => (
                  <Select.Option key={option.value} value={option.value}>
                    <Tooltip title={option.description} placement="right">
                      {option.label}
                    </Tooltip>
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>

          {/* 操作按钮 */}
          <Col xs={24} sm={12} md={6} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
            <div style={{ paddingBottom: '5px' }}>
              <Space>
                <Button onClick={() => {
                  const resetFilters = {
                    dateRange: [
                      dayjs().subtract(1, 'month').startOf('day'),
                      dayjs().add(1, 'month').endOf('day').subtract(11, 'seconds')
                    ],
                    clusterGroup: [],
                    specialZone: [],
                    caller: [],
                    region: [],
                    inventoryStatus: 'available',
                    productType: [],
                    inventoryScenario: []
                  };
                  setFilters(resetFilters);
                }}>
                  重置
                </Button>
                <Button type="primary" onClick={() => fetchInventoryData(filters)}>
                  查询
                </Button>
              </Space>
            </div>
          </Col>
        </Row>

        {/* 已选择的筛选条件展示 */}
        {(filters.clusterGroup.length > 0 || filters.specialZone.length > 0 || filters.caller.length > 0 ||
          filters.region.length > 0 || filters.productType.length > 0 || filters.inventoryScenario.length > 0 ||
          filters.inventoryStatus !== 'available') && (
          <div style={{ marginTop: 16, padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
            <div style={{ marginBottom: 8, fontSize: '14px', fontWeight: 500, color: '#666' }}>已选择的筛选条件：</div>
            <Space wrap>
              {filters.clusterGroup.length > 0 && (
                <div>
                  <span style={{ fontSize: '12px', color: '#666', marginRight: 4 }}>集群组：</span>
                  {filters.clusterGroup.map(group => (
                    <Tag key={group} closable onClose={() => handleFilterChange('clusterGroup', filters.clusterGroup.filter(g => g !== group))}>
                      {clusterGroupOptions.find(opt => opt.value === group)?.label || group}
                    </Tag>
                  ))}
                </div>
              )}
              {filters.specialZone.length > 0 && (
                <div>
                  <span style={{ fontSize: '12px', color: '#666', marginRight: 4 }}>专区：</span>
                  {filters.specialZone.map(zone => (
                    <Tag key={zone} closable onClose={() => handleFilterChange('specialZone', filters.specialZone.filter(z => z !== zone))}>
                      {getSpecialZoneOptions(filters.clusterGroup).find(opt => opt.value === zone)?.label || zone}
                    </Tag>
                  ))}
                </div>
              )}
              {filters.caller.length > 0 && (
                <div>
                  <span style={{ fontSize: '12px', color: '#666', marginRight: 4 }}>调用方：</span>
                  {filters.caller.map(caller => (
                    <Tag key={caller} closable onClose={() => handleFilterChange('caller', filters.caller.filter(c => c !== caller))}>
                      {caller}
                    </Tag>
                  ))}
                </div>
              )}
              {filters.region.length > 0 && (
                <div>
                  <span style={{ fontSize: '12px', color: '#666', marginRight: 4 }}>地域/机房：</span>
                  {filters.region.map(region => (
                    <Tag key={region} closable onClose={() => handleFilterChange('region', filters.region.filter(r => r !== region))}>
                      {regionOptions.find(opt => opt.value === region)?.label || region}
                    </Tag>
                  ))}
                </div>
              )}
              {filters.inventoryStatus !== 'available' && (
                <div>
                  <span style={{ fontSize: '12px', color: '#666', marginRight: 4 }}>库存状态：</span>
                  <Tag closable onClose={() => handleFilterChange('inventoryStatus', 'available')}>
                    {inventoryStatusOptions.find(opt => opt.value === filters.inventoryStatus)?.label || filters.inventoryStatus}
                  </Tag>
                </div>
              )}
              {filters.productType.length > 0 && (
                <div>
                  <span style={{ fontSize: '12px', color: '#666', marginRight: 4 }}>产品类型：</span>
                  {filters.productType.map(type => (
                    <Tag key={type} closable onClose={() => handleFilterChange('productType', filters.productType.filter(t => t !== type))}>
                      {productTypeOptions.find(opt => opt.value === type)?.label || type}
                    </Tag>
                  ))}
                </div>
              )}
              {filters.inventoryScenario.length > 0 && (
                <div>
                  <span style={{ fontSize: '12px', color: '#666', marginRight: 4 }}>库存场景：</span>
                  {filters.inventoryScenario.map(scenario => (
                    <Tag key={scenario} closable onClose={() => handleFilterChange('inventoryScenario', filters.inventoryScenario.filter(s => s !== scenario))}>
                      {inventoryScenarioOptions.find(opt => opt.value === scenario)?.label || scenario}
                    </Tag>
                  ))}
                </div>
              )}
            </Space>
          </div>
        )}
      </Card>

      {/* 库存概览和明细 */}
      <Card style={{ marginBottom: 24 }}>
        <Tabs
          defaultActiveKey="overview"
          items={[
            {
              key: 'overview',
              label: '库存概览',
              children: (
                <div>
                  {/* 数字卡片 */}
                  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} md={4}>
                      <Card size="small" className="overview-card">
                        <Statistic
                          title="库存总量"
                          value={summaryData.totalInventory}
                          valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                        />
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                          可用+已出库+紧急+安全预留
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                      <Card size="small" className="overview-card">
                        <Statistic
                          title="可用库存"
                          value={summaryData.availableInventory}
                          valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                        />
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                          作为资源供给的可调配资源
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                      <Card size="small" className="overview-card">
                        <Statistic
                          title="已出库"
                          value={summaryData.outboundInventory}
                          valueStyle={{ color: '#faad14', fontSize: '24px' }}
                        />
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                          已交付给业务/平台方的资源
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                      <Card size="small" className="overview-card">
                        <Statistic
                          title="紧急资源"
                          value={summaryData.emergencyPool}
                          valueStyle={{ color: '#fa541c', fontSize: '24px' }}
                        />
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                          用于业务紧急场景的资源
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                      <Card size="small" className="overview-card">
                        <Statistic
                          title="运维资源"
                          value={summaryData.operationPool}
                          valueStyle={{ color: '#13c2c2', fontSize: '24px' }}
                        />
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                          运维场景使用的资源
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                      <Card size="small" className="overview-card">
                        <Statistic
                          title="安全预留"
                          value={summaryData.safetyReserve}
                          valueStyle={{ color: '#722ed1', fontSize: '24px' }}
                        />
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                          系统安全预留资源
                        </div>
                      </Card>
                    </Col>
                  </Row>

                  {/* 库存分布 */}
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
                              地域/机房
                            </Button>
                            <Button
                              type={distributionBy === 'scenario' ? 'primary' : 'default'}
                              onClick={() => setDistributionBy('scenario')}
                            >
                              场景
                            </Button>
                            <Button
                              type={distributionBy === 'cluster' ? 'primary' : 'default'}
                              onClick={() => setDistributionBy('cluster')}
                            >
                              集群组/专区/调用方
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
                    style={{ minHeight: '400px', marginBottom: 24 }}
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

                  {/* 库存变化趋势 */}
                  <Card
                    title="库存变化趋势"
                    className="trend-card"
                  >
                    <Tabs
                      activeKey={activeTab}
                      onChange={setActiveTab}
                      items={[
                        {
                          key: 'available',
                          label: '可用库存',
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
                          key: 'total',
                          label: '总库存',
                          children: (
                            <div style={{ height: '400px' }}>
                              <ReactECharts
                                option={getTrendChartOption('total')}
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
                          label: '已出库',
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
                        }
                      ]}
                    />
                  </Card>
                </div>
              )
            },
            {
              key: 'detail',
              label: '库存明细',
              children: (
                <Table
                  columns={[
                    {
                      title: '集群组',
                      dataIndex: 'clusterGroup',
                      key: 'clusterGroup',
                      width: 120,
                      filters: [
                        { text: 'hulk-general', value: 'hulk-general' },
                        { text: 'hulk-arm', value: 'hulk-arm' },
                        { text: 'txserverless', value: 'txserverless' }
                      ],
                      onFilter: (value, record) => record.clusterGroup === value
                    },
                    {
                      title: '专区',
                      dataIndex: 'specialZone',
                      key: 'specialZone',
                      width: 150
                    },
                    {
                      title: '调用方',
                      dataIndex: 'caller',
                      key: 'caller',
                      width: 120
                    },
                    {
                      title: '地域',
                      dataIndex: 'region',
                      key: 'region',
                      width: 100,
                      filters: [
                        { text: '北京', value: '北京' },
                        { text: '上海', value: '上海' },
                        { text: '怀来', value: '怀来' },
                        { text: '广州', value: '广州' },
                        { text: '深圳', value: '深圳' }
                      ],
                      onFilter: (value, record) => record.region === value
                    },
                    {
                      title: '机房',
                      dataIndex: 'datacenter',
                      key: 'datacenter',
                      width: 120
                    },
                    {
                      title: '产品类型',
                      dataIndex: 'productType',
                      key: 'productType',
                      width: 100,
                      filters: [
                        { text: '通用', value: '通用' },
                        { text: '经济', value: '经济' },
                        { text: '高性能', value: '高性能' }
                      ],
                      onFilter: (value, record) => record.productType === value
                    },
                    {
                      title: '可用库存数量（核）',
                      dataIndex: 'availableInventory',
                      key: 'availableInventory',
                      width: 150,
                      render: (value) => <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{value}</span>,
                      sorter: (a, b) => a.availableInventory - b.availableInventory,
                      sortDirections: ['descend', 'ascend'],
                      defaultSortOrder: 'descend'
                    }
                  ]}
                  dataSource={[
                    {
                      key: '1',
                      clusterGroup: 'hulk-general',
                      specialZone: 'default',
                      caller: 'avatar',
                      region: '北京',
                      datacenter: '北京-DC1',
                      productType: '通用',
                      availableInventory: 1800
                    },
                    {
                      key: '2',
                      clusterGroup: 'hulk-general',
                      specialZone: 'jinrong_hulk',
                      caller: 'avatarjinrong',
                      region: '北京',
                      datacenter: '北京-DC1',
                      productType: '高性能',
                      availableInventory: 800
                    },
                    {
                      key: '3',
                      clusterGroup: 'hulk-general',
                      specialZone: 'default',
                      caller: 'policy',
                      region: '上海',
                      datacenter: '上海-DC1',
                      productType: '通用',
                      availableInventory: 1200
                    },
                    {
                      key: '4',
                      clusterGroup: 'hulk-arm',
                      specialZone: 'default',
                      caller: 'hulk_arm',
                      region: '怀来',
                      datacenter: '怀来-DC1',
                      productType: '经济',
                      availableInventory: 1000
                    },
                    {
                      key: '5',
                      clusterGroup: 'txserverless',
                      specialZone: 'default',
                      caller: 'policy_txserverless',
                      region: '广州',
                      datacenter: '广州-DC1',
                      productType: '通用',
                      availableInventory: 620
                    },
                    {
                      key: '6',
                      clusterGroup: 'hulk-general',
                      specialZone: 'hulk_holiday',
                      caller: 'holiday',
                      region: '北京',
                      datacenter: '北京-DC2',
                      productType: '通用',
                      availableInventory: 950
                    },
                    {
                      key: '7',
                      clusterGroup: 'hulk-general',
                      specialZone: 'huidu_hulk',
                      caller: 'migration',
                      region: '上海',
                      datacenter: '上海-DC2',
                      productType: '高性能',
                      availableInventory: 750
                    },
                    {
                      key: '8',
                      clusterGroup: 'hulk-arm',
                      specialZone: 'default',
                      caller: 'hulk_arm_admin',
                      region: '怀来',
                      datacenter: '怀来-DC2',
                      productType: '经济',
                      availableInventory: 680
                    }
                  ]}
                  size="small"
                  pagination={{
                    total: 50,
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
                  }}
                />
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default InventoryManagementPage;
