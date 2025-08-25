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
import InventoryFilterPanel from './InventoryFilterPanel';
import './InventoryManagementPage.css';


const InventoryManagementPage = ({ onNavigateToResourceProcurement }) => {
  const [filters, setFilters] = useState({
    dateRange: [
      dayjs().subtract(2, 'month').startOf('day'), // 开始日期 00:00:00
      dayjs().add(2, 'month').endOf('day').subtract(11, 'seconds') // 结束日期 23:59:49
    ],
    clusterCascader: [], // 级联选择器：集群组->专区->调用方
    regionCascader: [], // 地域级联选择器：地域->机房
    productType: [], // 产品类型多选：通用、经济、高性能
    inventoryUsage: ['business', 'platform', 'self-use', 'operation', 'emergency'] // 库存用途多选，默认全部
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
  const [inventoryType, setInventoryType] = useState('all'); // 库存类型：all, outbound, available
  const [insightData, setInsightData] = useState({
    topRegion: { name: '', percentage: 0, trend: 0 },
    topUsages: [],
    topDatacenters: [],
    topZones: []
  });
用户  // 库存用途选项
  const inventoryUsageOptions = [
    {
      value: 'business',
      label: '业务',
      description: '承诺交付业务用户的资源',
      callers: ['avatar', 'unit_xx', 'holiday', 'avatar_reserved']
    },
    {
      value: 'platform',
      label: '平台',
      description: '承诺交付平台用户的资源',
      callers: ['policy', 'quake', 'maoyan']
    },
    {
      value: 'operation',
      label: '运维',
      description: '运维场景使用资源',
      callers: ['n_plus_one', 'hdr', 'migration_donate_common']
    },
    {
      value: 'self-use',
      label: '自用',
      description: 'Hulk自用库存，作为资源缓冲等',
      callers: ['buffer', 'hulk_overassign']
    },
    {
      value: 'emergency',
      label: '紧急资源',
      description: '用于业务紧急场景的资源',
      callers: []
    }
  ];

  // 产品类型选项
  const productTypeOptions = [
    { value: 'general', label: '通用' },
    { value: 'economic', label: '经济' },
    { value: 'high-performance', label: '高性能' }
  ];


  // 地域/机房级联选择器选项
  const regionCascaderOptions = [
    {
      value: 'beijing',
      label: '北京',
      children: [
        { value: 'beijing-dc1', label: '北京-机房1' },
        { value: 'beijing-dc2', label: '北京-机房2' },
        { value: 'beijing-dc3', label: '北京-机房3' }
      ]
    },
    {
      value: 'shanghai',
      label: '上海',
      children: [
        { value: 'shanghai-dc1', label: '上海-机房1' },
        { value: 'shanghai-dc2', label: '上海-机房2' }
      ]
    },
    {
      value: 'huailai',
      label: '怀来',
      children: [
        { value: 'huailai-dc1', label: '怀来-机房1' }
      ]
    },
    {
      value: 'other',
      label: '其他',
      children: [
        { value: 'other-any', label: '其他-Any' }
      ]
    }
  ];

  // 集群组/专区/调用方级联选择器选项
  const clusterCascaderOptions = [
    {
      value: 'hulk-general',
      label: 'hulk-general',
      children: [
        {
          value: 'default',
          label: 'default',
          children: [
            { value: 'avatar', label: 'avatar' },
            { value: 'unit_4', label: 'unit_4' },
            { value: 'avatar_reserved', label: 'avatar_reserved' },
            { value: 'migration', label: 'migration' },
            { value: 'holiday', label: 'holiday' },
            { value: 'policy', label: 'policy' },
            { value: 'cargo', label: 'cargo' },
            { value: 'n_plus_one', label: 'n_plus_one' },
            { value: 'hdr', label: 'hdr' },
            { value: 'maoyan', label: 'maoyan' }
          ]
        },
        {
          value: 'hulk_pool_buffer',
          label: 'hulk_pool_buffer',
          children: [
            { value: 'buffer', label: 'buffer' },
            { value: 'hulk_overassign', label: 'hulk_overassign' }
          ]
        },
        {
          value: 'hulk_holiday',
          label: 'hulk_holiday',
          children: [
            { value: 'hulk_holiday_admin', label: 'hulk_holiday_admin' },
            { value: 'migrate_hulk_holiday', label: 'migrate_hulk_holiday' },
            { value: 'hulk_holiday', label: 'hulk_holiday' }
          ]
        },
        {
          value: 'jinrong_hulk',
          label: '金融',
          children: [
            { value: 'jinrong', label: 'jinrong' },
            { value: 'avatarjinrong', label: 'avatarjinrong' },
            { value: 'migrationjinrong', label: 'migrationjinrong' },
            { value: 'policy_jinrong_hulk', label: 'policy+jinrong_hulk' }
          ]
        },
        {
          value: 'huidu_hulk',
          label: '灰度专区',
          children: []
        }
      ]
    },
    {
      value: 'hulk-arm',
      label: 'hulk-arm',
      children: [
        {
          value: 'default',
          label: 'default',
          children: [
            { value: 'hulk_arm_admin', label: 'hulk_arm_admin' },
            { value: 'hulk_arm', label: 'hulk_arm' },
            { value: 'migrate_hulk_arm', label: 'migrate_hulk_arm' }
          ]
        }
      ]
    },
    {
      value: 'txserverless',
      label: 'txserverless',
      children: [
        {
          value: 'default',
          label: 'default',
          children: [
            { value: 'policy_campaign_tx', label: 'policy_campaign_tx' },
            { value: 'policy_txserverless', label: 'policy+txserverless' },
            { value: 'txserverless_migration', label: 'txserverless_migration' }
          ]
        }
      ]
    }
  ];


  // 库存分类选项
  const inventoryCategories = [
    { key: 'total', label: '汇总', color: '#1890ff' },
    { key: 'available', label: '可用库存', color: '#52c41a' },
    { key: 'reserved', label: '已预占', color: '#faad14' },
    { key: 'outbound', label: '已出库', color: '#f5222d' },
    { key: 'safety', label: '安全预留余量', color: '#722ed1' },
    { key: 'safety_outbound', label: '安全预留已出库', color: '#9254de' },
    { key: 'emergency', label: '紧急资源余量', color: '#fa541c' },
    { key: 'emergency_outbound', label: '紧急资源已出库', color: '#ff7a45' },
    { key: 'operation', label: '运维资源余量', color: '#13c2c2' },
    { key: 'operation_outbound', label: '运维资源已出库', color: '#36cfc9' }
  ];

  // 模拟数据获取
  const fetchInventoryData = async (filterParams) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 实际库存数据
      const availableInventory = 1941243;
      const outboundInventory = 22611138;
      const emergencyPool = 100000;
      const operationPool = 100; // 运维资源保持较小值

      // 安全预留计算逻辑：总库存的5% + 固定值100,000核
      const totalInventoryBeforeSafety = availableInventory + outboundInventory + emergencyPool + operationPool;
      const safetyReserveCalculated = Math.round(totalInventoryBeforeSafety * 0.05) + 100000;
      const safetyReserve = 607154; // 实际值

      const totalInventory = availableInventory + outboundInventory + safetyReserve + emergencyPool + operationPool;

      setSummaryData({
        totalInventory: totalInventory,
        availableInventory: availableInventory,
        outboundInventory: outboundInventory,
        safetyReserve: safetyReserve,
        safetyReserveCalculated: safetyReserveCalculated, // 用于显示计算逻辑
        emergencyPool: emergencyPool,
        operationPool: operationPool
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
          { name: '自用', value: 3200, percentage: 20.4, available: 1800, reserved: 800, safety: 300, emergency: 200, operation: 100 },
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

      // 根据分布维度、机房详情开关和库存类型来设置数据
      let currentData;
      if (distributionBy === 'region') {
        currentData = showDatacenterDetails ? mockDistributionData.datacenter : mockDistributionData.region;
      } else if (distributionBy === 'scenario') {
        currentData = mockDistributionData.scenario;
      } else if (distributionBy === 'cluster') {
        // 集群组/专区/调用方数据
        currentData = [
          { name: 'hulk-general/default', value: 12500, percentage: 65.8, available: 6800, outbound: 4200, reserved: 1500 },
          { name: 'hulk-general/hulk_pool_buffer', value: 2890, percentage: 15.2, available: 1600, outbound: 900, reserved: 390 },
          { name: 'hulk-general/hulk_holiday', value: 1615, percentage: 8.5, available: 900, outbound: 500, reserved: 215 },
          { name: 'hulk-general/jinrong_hulk', value: 1197, percentage: 6.3, available: 650, outbound: 400, reserved: 147 },
          { name: 'hulk-arm/default', value: 798, percentage: 4.2, available: 450, outbound: 250, reserved: 98 }
        ];
      } else {
        currentData = mockDistributionData.region;
      }

      // 根据库存类型筛选数据
      if (inventoryType !== 'all') {
        currentData = currentData.map(item => {
          let value, percentage;
          switch (inventoryType) {
            case 'available':
              value = item.available || Math.floor(item.value * 0.55);
              break;
            case 'outbound':
              value = item.outbound || Math.floor(item.value * 0.35);
              break;
            default:
              value = item.value;
          }

          // 重新计算百分比
          const total = currentData.reduce((sum, d) => {
            switch (inventoryType) {
              case 'available':
                return sum + (d.available || Math.floor(d.value * 0.55));
              case 'outbound':
                return sum + (d.outbound || Math.floor(d.value * 0.35));
              default:
                return sum + d.value;
            }
          }, 0);

          percentage = ((value / total) * 100).toFixed(1);

          return {
            ...item,
            value,
            percentage: parseFloat(percentage)
          };
        });
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
        safety_outbound: [],
        emergency: [],
        emergency_outbound: [],
        operation: [],
        operation_outbound: []
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

        // 安全预留余量
        inventoryLines.safety.push({
          value: Math.floor((baseValue + trend) * 0.08) + Math.floor(Math.random() * 80),
          isPast
        });

        // 安全预留已出库
        inventoryLines.safety_outbound.push({
          value: Math.floor((baseValue + trend) * 0.02) + Math.floor(Math.random() * 20),
          isPast
        });

        // 紧急资源余量
        inventoryLines.emergency.push({
          value: Math.floor((baseValue + trend) * 0.03) + Math.floor(Math.random() * 40),
          isPast
        });

        // 紧急资源已出库
        inventoryLines.emergency_outbound.push({
          value: Math.floor((baseValue + trend) * 0.01) + Math.floor(Math.random() * 10),
          isPast
        });

        // 运维资源余量
        inventoryLines.operation.push({
          value: Math.floor((baseValue + trend) * 0.008) + Math.floor(Math.random() * 15),
          isPast
        });

        // 运维资源已出库
        inventoryLines.operation_outbound.push({
          value: Math.floor((baseValue + trend) * 0.002) + Math.floor(Math.random() * 5),
          isPast
        });
      }

      setTrendData({
        labels: dates,
        datasets: inventoryLines
      });

      // 计算库存洞察数据（基于时间范围和筛选条件）
      const calculateInsightData = () => {
        // 基于时间范围计算库存数据
        const dateRange = filterParams.dateRange || filters.dateRange;
        const startDate = dateRange[0];
        const endDate = dateRange[1];

        // 模拟基于时间范围的数据变化
        const timeRangeMultiplier = dayjs(endDate).diff(dayjs(startDate), 'day') / 30; // 以30天为基准

        // 1. 热门地域 - Top1 全部库存的地域（基于时间范围内的累计库存）
        const regionData = mockDistributionData.region.map(region => ({
          ...region,
          value: Math.round(region.value * timeRangeMultiplier),
          percentage: region.percentage
        })).sort((a, b) => b.value - a.value);

        const topRegion = regionData[0];
        const totalRegionInventory = regionData.reduce((sum, item) => sum + item.value, 0);

        // 2. 热门用途 - Top2 库存量用途（基于时间范围内的使用情况）
        const usageData = mockDistributionData.scenario.map(scenario => ({
          ...scenario,
          value: Math.round(scenario.value * timeRangeMultiplier),
          percentage: scenario.percentage
        })).sort((a, b) => b.value - a.value);

        const topUsages = usageData.slice(0, 2);

        // 3. Top5 机房（基于时间范围内的库存分布）
        const datacenterData = mockDistributionData.datacenter.map(dc => ({
          ...dc,
          value: Math.round(dc.value * timeRangeMultiplier),
          percentage: dc.percentage
        })).sort((a, b) => b.value - a.value);

        const topDatacenters = datacenterData.slice(0, 5);

        // 4. Top5 专区（基于集群组/专区在时间范围内的使用情况）
        const zoneData = [
          { name: 'default', value: Math.round(12500 * timeRangeMultiplier), percentage: 65.8 },
          { name: 'hulk_pool_buffer', value: Math.round(2890 * timeRangeMultiplier), percentage: 15.2 },
          { name: 'hulk_holiday', value: Math.round(1615 * timeRangeMultiplier), percentage: 8.5 },
          { name: 'jinrong_hulk', value: Math.round(1197 * timeRangeMultiplier), percentage: 6.3 },
          { name: 'huidu_hulk', value: Math.round(798 * timeRangeMultiplier), percentage: 4.2 }
        ].sort((a, b) => b.value - a.value);

        const topZones = zoneData.slice(0, 5);

        // 计算趋势（基于时间范围长度）
        const trendFactor = timeRangeMultiplier > 1 ? 1 : -1;
        const trendValue = Math.floor(Math.random() * 5) + 1;

        return {
          topRegion: {
            name: topRegion.name,
            percentage: topRegion.percentage,
            trend: trendFactor * trendValue,
            timeRange: `${dayjs(startDate).format('YYYY-MM-DD')} 至 ${dayjs(endDate).format('YYYY-MM-DD')}`
          },
          topUsages: topUsages.map(usage => ({
            name: usage.name,
            percentage: usage.percentage,
            value: usage.value,
            timeRange: `${dayjs(startDate).format('YYYY-MM-DD')} 至 ${dayjs(endDate).format('YYYY-MM-DD')}`
          })),
          topDatacenters: topDatacenters.map((dc, index) => ({
            rank: index + 1,
            name: dc.name,
            percentage: dc.percentage,
            value: dc.value,
            region: dc.region,
            timeRange: `${dayjs(startDate).format('YYYY-MM-DD')} 至 ${dayjs(endDate).format('YYYY-MM-DD')}`
          })),
          topZones: topZones.map((zone, index) => ({
            rank: index + 1,
            name: zone.name,
            percentage: zone.percentage,
            value: zone.value,
            timeRange: `${dayjs(startDate).format('YYYY-MM-DD')} 至 ${dayjs(endDate).format('YYYY-MM-DD')}`
          }))
        };
      };

      setInsightData(calculateInsightData());

    } catch (error) {
      console.error('获取库存数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData(filters);
  }, [filters, distributionBy, showDatacenterDetails, inventoryType]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchInventoryData(newFilters);
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
    const getInventoryTypeLabel = () => {
      switch (inventoryType) {
        case 'available': return '可用库存';
        case 'outbound': return '已出库';
        default: return '全部库存';
      }
    };

    if (distributionBy === 'region') {
      // 地域/机房使用饼环图
      return {
        title: {
          text: `${getInventoryTypeLabel()}分布（按${showDatacenterDetails ? '机房' : '地域'}）`,
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} 核 ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'middle'
        },
        series: [
          {
            name: '库存分布',
            type: 'pie',
            radius: ['40%', '70%'], // 饼环图
            center: ['60%', '50%'],
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
            },
            label: {
              show: true,
              formatter: '{b}\n{d}%'
            },
            labelLine: {
              show: true
            }
          }
        ]
      };
    } else {
      // 用途和集群组/专区使用柱状图
      const chartTitle = distributionBy === 'scenario'
        ? `${getInventoryTypeLabel()}分布（按用途）`
        : `${getInventoryTypeLabel()}分布（按集群组/专区）`;

      // 集群组/专区使用treemap图表
      if (distributionBy === 'cluster') {
        // 根据库存类型调整数据
        const getClusterValue = (baseValue, type) => {
          switch (type) {
            case 'available':
              return Math.floor(baseValue * 0.55);
            case 'outbound':
              return Math.floor(baseValue * 0.35);
            default:
              return baseValue;
          }
        };

        // 构建树状数据结构
        const treeData = {
          name: '集群组分布',
          children: [
            {
              name: 'hulk-general',
              value: getClusterValue(18000, inventoryType),
              children: [
                {
                  name: 'default',
                  value: getClusterValue(12500, inventoryType),
                  children: [
                    { name: 'avatar', value: getClusterValue(4500, inventoryType) },
                    { name: 'unit_4', value: getClusterValue(2800, inventoryType) },
                    { name: 'avatar_reserved', value: getClusterValue(2200, inventoryType) },
                    { name: 'migration', value: getClusterValue(1500, inventoryType) },
                    { name: 'holiday', value: getClusterValue(800, inventoryType) },
                    { name: 'policy', value: getClusterValue(700, inventoryType) }
                  ]
                },
                {
                  name: 'hulk_pool_buffer',
                  value: getClusterValue(2890, inventoryType),
                  children: [
                    { name: 'buffer', value: getClusterValue(1890, inventoryType) },
                    { name: 'hulk_overassign', value: getClusterValue(1000, inventoryType) }
                  ]
                },
                {
                  name: 'hulk_holiday',
                  value: getClusterValue(1615, inventoryType),
                  children: [
                    { name: 'hulk_holiday_admin', value: getClusterValue(800, inventoryType) },
                    { name: 'migrate_hulk_holiday', value: getClusterValue(515, inventoryType) },
                    { name: 'hulk_holiday', value: getClusterValue(300, inventoryType) }
                  ]
                },
                {
                  name: 'jinrong_hulk',
                  value: getClusterValue(1197, inventoryType),
                  children: [
                    { name: 'jinrong', value: getClusterValue(500, inventoryType) },
                    { name: 'avatarjinrong', value: getClusterValue(397, inventoryType) },
                    { name: 'migrationjinrong', value: getClusterValue(200, inventoryType) },
                    { name: 'policy_jinrong_hulk', value: getClusterValue(100, inventoryType) }
                  ]
                }
              ]
            },
            {
              name: 'hulk-arm',
              value: getClusterValue(798, inventoryType),
              children: [
                {
                  name: 'default',
                  value: getClusterValue(798, inventoryType),
                  children: [
                    { name: 'hulk_arm_admin', value: getClusterValue(400, inventoryType) },
                    { name: 'hulk_arm', value: getClusterValue(298, inventoryType) },
                    { name: 'migrate_hulk_arm', value: getClusterValue(100, inventoryType) }
                  ]
                }
              ]
            },
            {
              name: 'txserverless',
              value: getClusterValue(620, inventoryType),
              children: [
                {
                  name: 'default',
                  value: getClusterValue(620, inventoryType),
                  children: [
                    { name: 'policy_campaign_tx', value: getClusterValue(300, inventoryType) },
                    { name: 'policy_txserverless', value: getClusterValue(220, inventoryType) },
                    { name: 'txserverless_migration', value: getClusterValue(100, inventoryType) }
                  ]
                }
              ]
            }
          ]
        };

        return {
          title: {
            text: `${getInventoryTypeLabel()}分布（按集群组/专区/调用方）`,
            left: 'center',
            textStyle: {
              fontSize: 16,
              fontWeight: 'normal'
            }
          },
          tooltip: {
            trigger: 'item',
            formatter: function (info) {
              const value = info.value;
              const treePathInfo = info.treePathInfo;
              const treePath = [];

              for (let i = 1; i < treePathInfo.length; i++) {
                treePath.push(treePathInfo[i].name);
              }

              return [
                '<div class="tooltip-title">' + treePath.join(' > ') + '</div>',
                '库存量: ' + value.toLocaleString() + ' 核',
              ].join('');
            }
          },
          series: [
            {
              name: '集群组分布',
              type: 'treemap',
              visibleMin: 100,
              leafDepth: 2,
              roam: false,
              nodeClick: 'zoomToNode',
              data: treeData.children,
              breadcrumb: {
                show: true,
                height: 22,
                left: 'center',
                top: 'bottom',
                emptyItemWidth: 25,
                itemStyle: {
                  color: 'rgba(0,0,0,0.7)',
                  borderColor: 'rgba(255,255,255,0.7)',
                  borderWidth: 1,
                  shadowColor: 'rgba(150,150,150,1)',
                  shadowBlur: 3,
                  shadowOffsetX: 0,
                  shadowOffsetY: 0,
                  textStyle: {
                    color: '#fff'
                  }
                },
                emphasis: {
                  itemStyle: {
                    color: 'rgba(0,0,0,0.9)'
                  }
                }
              },
              levels: [
                {
                  // 集群组级别 - 使用不同颜色区分
                  itemStyle: {
                    borderColor: '#777',
                    borderWidth: 4,
                    gapWidth: 4
                  },
                  upperLabel: {
                    show: true,
                    height: 30,
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: '#fff'
                  }
                },
                {
                  // 专区级别 - 使用颜色深浅区分
                  colorSaturation: [0.3, 0.6],
                  itemStyle: {
                    borderColorSaturation: 0.7,
                    gapWidth: 2,
                    borderWidth: 2
                  },
                  emphasis: {
                    itemStyle: {
                      borderColor: '#ddd'
                    }
                  }
                },
                {
                  // 调用方级别 - 支持下钻
                  colorSaturation: [0.3, 0.5],
                  itemStyle: {
                    borderColorSaturation: 0.6,
                    gapWidth: 1,
                    borderWidth: 1
                  }
                },
                {
                  // 第四级别
                  colorSaturation: [0.3, 0.5]
                }
              ]
            }
          ]
        };
      } else {
        // 用途使用柱状图
        return {
          title: {
            text: chartTitle,
            left: 'center',
            textStyle: {
              fontSize: 16,
              fontWeight: 'normal'
            }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            },
            formatter: '{a} <br/>{b}: {c} 核'
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: distributionData.map(item => item.name),
            axisLabel: {
              rotate: 0,
              interval: 0
            }
          },
          yAxis: {
            type: 'value',
            name: '库存量（核）',
            nameLocation: 'middle',
            nameGap: 50
          },
          series: [
            {
              name: '库存量',
              type: 'bar',
              data: distributionData.map(item => ({
                value: item.value,
                itemStyle: {
                  color: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'][distributionData.indexOf(item) % 5]
                }
              })),
              barWidth: '60%',
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
      }
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
        return ['safety', 'safety_outbound']; // 安全预留：余量 + 已出库
      case 'emergency':
        return ['emergency', 'emergency_outbound']; // 紧急资源：余量 + 已出库
      case 'operation':
        return ['operation', 'operation_outbound']; // 运维资源：余量 + 已出库
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
        <InventoryFilterPanel
          filters={filters}
          onChange={handleFilterChange}
          loading={loading}
        />

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
                  {/* 核心指标卡片 */}
                  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} lg={6}>
                      <Card className="summary-card">
                        <Statistic
                          title="库存总量"
                          value={summaryData.totalInventory}
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
                              库存利用率
                              <Tooltip title="库存利用率 = (已出库 + 紧急资源 + 运维资源 + 安全预留) / 库存总量 × 100%">
                                <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                              </Tooltip>
                            </span>
                          }
                          value={(((summaryData.outboundInventory + summaryData.emergencyPool + summaryData.operationPool + summaryData.safetyReserve) / summaryData.totalInventory) * 100).toFixed(1)}
                          valueStyle={{ color: '#52c41a', fontSize: '28px' }}
                          suffix="%"
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Card className="summary-card">
                        <Statistic
                          title={
                            <span>
                              可用库存占比
                              <Tooltip title="可用库存在总库存中的占比">
                                <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                              </Tooltip>
                            </span>
                          }
                          value={((summaryData.availableInventory / summaryData.totalInventory) * 100).toFixed(1)}
                          valueStyle={{ color: '#52c41a', fontSize: '28px' }}
                          suffix="%"
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Card className="summary-card">
                        <Statistic
                          title="安全预留率"
                          value={((summaryData.safetyReserve / summaryData.totalInventory) * 100).toFixed(1)}
                          valueStyle={{ color: '#722ed1', fontSize: '28px' }}
                          suffix="%"
                        />
                      </Card>
                    </Col>
                  </Row>

                  {/* 库存状态分布 */}
                  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} md={8} lg={4}>
                      <Card className="status-card available-inventory">
                        <div className="status-header">
                          <span className="status-title">可用库存</span>
                          <Tooltip title="作为资源供给的可调配资源">
                            <InfoCircleOutlined style={{ color: '#999' }} />
                          </Tooltip>
                        </div>
                        <div className="status-value">{summaryData.availableInventory.toLocaleString()}</div>
                        <div className="status-percentage">
                          {((summaryData.availableInventory / summaryData.totalInventory) * 100).toFixed(1)}%
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={4}>
                      <Card className="status-card outbound-inventory">
                        <div className="status-header">
                          <span className="status-title">已出库</span>
                          <Tooltip title="已交付给业务/平台方的资源">
                            <InfoCircleOutlined style={{ color: '#999' }} />
                          </Tooltip>
                        </div>
                        <div className="status-value">{summaryData.outboundInventory.toLocaleString()}</div>
                        <div className="status-percentage">
                          {((summaryData.outboundInventory / summaryData.totalInventory) * 100).toFixed(1)}%
                        </div>
                      </Card>
                    </Col>
                     <Col xs={24} sm={12} md={8} lg={5}>
                       <Card className="status-card safety-reserve">
                         <div className="status-header">
                           <span className="status-title">安全预留</span>
                           <Tooltip
                             title={
                               <div>
                                 <div style={{ marginBottom: '8px' }}>
                                   <strong>计算逻辑：</strong>总库存的5% + 固定值100,000核
                                 </div>
                                 <div style={{ marginBottom: '4px' }}>
                                   • 某某平台应急预留：10,000核
                                 </div>
                                 <div>
                                   • 夏战为PaaS预留：90,000核
                                 </div>
                               </div>
                             }
                             overlayStyle={{ maxWidth: '300px' }}
                           >
                             <InfoCircleOutlined style={{ color: '#999' }} />
                           </Tooltip>
                         </div>
                         <div className="status-value">{summaryData.safetyReserve.toLocaleString()}</div>
                         <div className="status-percentage">
                           {((summaryData.safetyReserve / summaryData.totalInventory) * 100).toFixed(1)}%
                         </div>
                       </Card>
                     </Col>
                     <Col xs={24} sm={12} md={8} lg={5}>
                       <Card className="status-card emergency-pool">
                         <div className="status-header">
                           <span className="status-title">紧急资源</span>
                           <Tooltip title="用于业务紧急场景的资源">
                             <InfoCircleOutlined style={{ color: '#999' }} />
                           </Tooltip>
                         </div>
                         <div className="status-value">{summaryData.emergencyPool.toLocaleString()}</div>
                         <div className="status-percentage">
                           {((summaryData.emergencyPool / summaryData.totalInventory) * 100).toFixed(1)}%
                         </div>
                       </Card>
                     </Col>
                     <Col xs={24} sm={12} md={8} lg={5}>
                       <Card className="status-card operation-pool">
                         <div className="status-header">
                           <span className="status-title">运维资源</span>
                           <Tooltip title="运维场景使用的资源">
                             <InfoCircleOutlined style={{ color: '#999' }} />
                           </Tooltip>
                         </div>
                         <div className="status-value">{summaryData.operationPool.toLocaleString()}</div>
                         <div className="status-percentage">
                           {((summaryData.operationPool / summaryData.totalInventory) * 100).toFixed(1)}%
                         </div>
                       </Card>
                     </Col>
                  </Row>

                  {/* 库存洞察 */}
                  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col span={24}>
                      <Card
                        title="📊 库存洞察"
                        className="insight-card"
                      >
                        <Row gutter={[16, 16]}>
                          <Col xs={24} sm={12} md={6}>
                            <div className="insight-item">
                              <div className="insight-label">热门地域 (Top1)</div>
                              <div className="insight-value">
                                {insightData.topRegion.name} ({insightData.topRegion.percentage}%)
                              </div>
                              <div className={`insight-trend ${insightData.topRegion.trend >= 0 ? 'positive' : 'negative'}`}>
                                {insightData.topRegion.trend >= 0 ? '↗' : '↘'} {Math.abs(insightData.topRegion.trend)}%
                              </div>
                            </div>
                          </Col>
                          <Col xs={24} sm={12} md={6}>
                            <div className="insight-item">
                              <div className="insight-label">热门用途 (Top2)</div>
                              {insightData.topUsages.map((usage, index) => (
                                <div key={usage.name} className="insight-value">
                                  {index + 1}. {usage.name} ({usage.percentage}%)
                                </div>
                              ))}
                            </div>
                          </Col>
                          <Col xs={24} sm={12} md={6}>
                            <div className="insight-item">
                              <div className="insight-label">Top 5 机房</div>
                              <div className="insight-list">
                                {insightData.topDatacenters.map((dc) => (
                                  <div key={dc.name} className="insight-list-item">
                                    {dc.rank}. {dc.name} ({dc.percentage}%)
                                  </div>
                                ))}
                              </div>
                            </div>
                          </Col>
                          <Col xs={24} sm={12} md={6}>
                            <div className="insight-item">
                              <div className="insight-label">Top 5 专区</div>
                              <div className="insight-list">
                                {insightData.topZones.map((zone) => (
                                  <div key={zone.name} className="insight-list-item">
                                    {zone.rank}. {zone.name} ({zone.percentage}%)
                                  </div>
                                ))}
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  </Row>

                  {/* 库存分布 */}
                  <Card
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>库存分布</span>
                        <Space>
                          <span style={{ fontSize: '12px', color: '#666' }}>重点关注：</span>
                          <Button.Group size="small">
                            <Button
                              type={inventoryType === 'all' ? 'primary' : 'default'}
                              onClick={() => setInventoryType('all')}
                            >
                              全部
                            </Button>
                            <Button
                              type={inventoryType === 'available' ? 'primary' : 'default'}
                              onClick={() => setInventoryType('available')}
                            >
                              可用
                            </Button>
                            <Button
                              type={inventoryType === 'outbound' ? 'primary' : 'default'}
                              onClick={() => setInventoryType('outbound')}
                            >
                              已出库
                            </Button>
                          </Button.Group>
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
                              用途
                            </Button>
                            <Button
                              type={distributionBy === 'cluster' ? 'primary' : 'default'}
                              onClick={() => setDistributionBy('cluster')}
                            >
                              集群组/专区
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
                                ? '用途'
                                : '集群组/专区',
                            dataIndex: 'name',
                            key: 'name'
                          },
                          { title: '库存量', dataIndex: 'value', key: 'value', render: (value) => `${value.toLocaleString()} 核` },
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
