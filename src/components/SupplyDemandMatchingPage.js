import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Space,
  Tag,
  Tabs
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import SupplyDemandTrendChart from './SupplyDemandTrendChart';
import ResourceGapTrendChart from './ResourceGapTrendChart';
import SupplyDemandSummary from './SupplyDemandSummary';
import './SupplyDemandMatchingPage.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const SupplyDemandMatchingPage = ({ onNavigateToResourceProcurement }) => {
  const [filters, setFilters] = useState({
    dateRange: [
      dayjs().subtract(1, 'month').startOf('day'), // 开始日期 00:00:00
      dayjs().add(1, 'month').endOf('day').subtract(11, 'seconds') // 结束日期 23:59:49
    ],
    clusterGroup: [], // 集群组多选，默认全部选中
    specialZone: [], // 专区多选
    caller: [], // 调用方多选
    region: [], // 地域/机房多选
    productType: [] // 产品类型多选
  });

  const [loading, setLoading] = useState(false);
  const [trendData, setTrendData] = useState(null);

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

  // 调用方选项（与专区级联）
  const getCallerOptions = (specialZones) => {
    const callerMap = {
      'default': [
        { value: 'avatar', label: 'avatar' },
        { value: 'policy', label: 'policy' },
        { value: 'unit_4', label: 'unit_4' }
      ],
      'hulk_pool_buffer': [
        { value: 'avatar_reserved', label: 'avatar_reserved' },
        { value: 'migration', label: 'migration' }
      ],
      'hulk_holiday': [
        { value: 'holiday', label: 'holiday' },
        { value: 'hulk_holiday_admin', label: 'hulk_holiday_admin' },
        { value: 'migrate_hulk_holiday', label: 'migrate_hulk_holiday' },
        { value: 'hulk_holiday', label: 'hulk_holiday' }
      ],
      'jinrong_hulk': [
        { value: 'jinrong', label: 'jinrong' },
        { value: 'avatarjinrong', label: 'avatarjinrong' },
        { value: 'migrationjinrong', label: 'migrationjinrong' },
        { value: 'policy_jinrong_hulk', label: 'policy+jinrong_hulk' }
      ],
      'huidu_hulk': [
        { value: 'migration', label: 'migration' },
        { value: 'cargo', label: 'cargo' }
      ],
      'hrs_non_zone_general': [
        { value: 'n_plus_one', label: 'n_plus_one' },
        { value: 'hdr', label: 'hdr' },
        { value: 'maoyan', label: 'maoyan' }
      ],
      'hrs_non_zone_arm': [
        { value: 'hulk_arm_admin', label: 'hulk_arm_admin' },
        { value: 'hulk_arm', label: 'hulk_arm' },
        { value: 'migrate_hulk_arm', label: 'migrate_hulk_arm' }
      ],
      'hrs_non_zone_serverless': [
        { value: 'policy_campaign_tx', label: 'policy_campaign_tx' },
        { value: 'policy_txserverless', label: 'policy+txserverless' },
        { value: 'txserverless_migration', label: 'txserverless_migration' }
      ]
    };

    if (!specialZones || specialZones.length === 0) {
      return [];
    }

    // 如果选择了多个专区，合并所有调用方选项
    const allCallers = [];
    specialZones.forEach(zone => {
      if (callerMap[zone]) {
        allCallers.push(...callerMap[zone]);
      }
    });

    // 去重
    const uniqueCallers = allCallers.filter((caller, index, self) =>
      index === self.findIndex(c => c.value === caller.value)
    );

    return uniqueCallers;
  };

  // 地域/机房选项
  const regionOptions = [
    {
      label: '北京',
      value: 'beijing',
      children: [
        { label: 'Any', value: 'beijing-any' },
        { label: '机房1', value: 'beijing-room1' },
        { label: '机房2', value: 'beijing-room2' },
        { label: '机房3', value: 'beijing-room3' }
      ]
    },
    {
      label: '上海',
      value: 'shanghai',
      children: [
        { label: 'Any', value: 'shanghai-any' },
        { label: '机房1', value: 'shanghai-room1' },
        { label: '机房2', value: 'shanghai-room2' }
      ]
    },
    {
      label: '怀来',
      value: 'huailai',
      children: [
        { label: 'Any', value: 'huailai-any' },
        { label: '机房1', value: 'huailai-room1' }
      ]
    },
    {
      label: '其他',
      value: 'other',
      children: [
        { label: 'Any', value: 'other-any' }
      ]
    }
  ];

  // 产品类型选项
  const productTypeOptions = [
    { value: 'general', label: '通用' },
    { value: 'economic', label: '经济' },
    { value: 'high-performance', label: '高性能' }
  ];

  // 处理筛选条件变化
  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };

      // 联动逻辑：当集群组变化时，清空专区和调用方选择
      if (key === 'clusterGroup') {
        newFilters.specialZone = [];
        newFilters.caller = [];
      }

      // 联动逻辑：当专区变化时，清空调用方选择
      if (key === 'specialZone') {
        newFilters.caller = [];
      }

      return newFilters;
    });
  };

  // 重置筛选条件
  const handleReset = () => {
    const resetFilters = {
      dateRange: [
        dayjs().subtract(1, 'month').startOf('day'),
        dayjs().add(1, 'month').endOf('day').subtract(11, 'seconds')
      ],
      clusterGroup: [], // 默认不选中
      specialZone: [],
      caller: [],
      region: [],
      productType: []
    };
    setFilters(resetFilters);
  };

  // 生成模拟趋势数据
  const generateTrendData = () => {
    const dates = [];
    const inventoryData = [];
    const totalDemandData = [];
    const pendingDemandData = [];
    const confirmedDemandData = [];

    // 基础值和趋势参数
    let availableInventoryBase = 8500;
    let deliveredInventoryBase = 2000;
    let pendingBase = 150;
    let confirmedBase = 320;
    let deliveredDemandBase = 1800;

    for (let i = 30; i >= -30; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);

      const isPast = i >= 0;

      // 添加季节性波动和长期趋势
      const seasonalFactor = 1 + 0.15 * Math.sin((i + 30) * Math.PI / 30);
      const trendFactor = isPast ? 1 : 1 + (30 - i) * 0.008;
      const randomFactor = 0.9 + Math.random() * 0.2;

      if (isPast) {
        // 过去时间：库存 = 已交付需求 + 可用库存
        const availableValue = Math.round(availableInventoryBase * seasonalFactor * randomFactor);
        const deliveredValue = Math.round(deliveredInventoryBase * seasonalFactor * randomFactor);
        inventoryData.push({
          value: availableValue + deliveredValue,
          isPast
        });
        availableInventoryBase = availableInventoryBase * 0.95 + availableValue * 0.05;
        deliveredInventoryBase = deliveredInventoryBase * 0.95 + deliveredValue * 0.05;

        // 过去时间：总需求 = 确认已经交付需求
        const deliveredDemandValue = Math.round(deliveredDemandBase * seasonalFactor * randomFactor);
        totalDemandData.push({
          value: deliveredDemandValue,
          isPast
        });
        deliveredDemandBase = deliveredDemandBase * 0.95 + deliveredDemandValue * 0.05;

        // 过去时间：待评估需求为空
        pendingDemandData.push({
          value: 0,
          isPast
        });

        // 过去时间：确认待交付需求为空
        confirmedDemandData.push({
          value: 0,
          isPast
        });
      } else {
        // 未来时间：库存 = 可用库存
        const availableValue = Math.round(availableInventoryBase * seasonalFactor * trendFactor * randomFactor);
        inventoryData.push({
          value: availableValue,
          isPast
        });
        availableInventoryBase = availableInventoryBase * 0.95 + availableValue * 0.05;

        // 未来时间：待评估需求（增加更大的增长趋势，让某些时间段出现缺口）
        const pendingValue = Math.round(pendingBase * (0.7 + Math.random() * 0.6) * trendFactor * (1 + (30 - i) * 0.02));
        pendingDemandData.push({
          value: pendingValue,
          isPast
        });
        pendingBase = pendingBase * 0.9 + pendingValue * 0.1;

        // 未来时间：确认待交付需求（增加更大的增长趋势）
        const confirmedValue = Math.round(confirmedBase * seasonalFactor * (0.8 + Math.random() * 0.4) * trendFactor * (1 + (30 - i) * 0.015));
        confirmedDemandData.push({
          value: confirmedValue,
          isPast
        });
        confirmedBase = confirmedBase * 0.9 + confirmedValue * 0.1;

        // 未来时间：总需求 = 待评估需求 + 确认待交付需求
        totalDemandData.push({
          value: pendingValue + confirmedValue,
          isPast
        });
      }
    }

    return {
      labels: dates,
      datasets: [
        {
          key: 'inventory',
          label: '库存',
          data: inventoryData,
          color: '#52c41a'
        },
        {
          key: 'totalDemand',
          label: '总需求',
          data: totalDemandData,
          color: '#1890ff'
        },
        {
          key: 'pendingDemand',
          label: '待评估需求',
          data: pendingDemandData,
          color: '#faad14'
        },
        {
          key: 'confirmedDemand',
          label: '确认待交付需求',
          data: confirmedDemandData,
          color: '#f5222d'
        }
      ]
    };
  };

  // 查询数据
  const handleSearch = () => {
    setLoading(true);
    console.log('供需匹配查询参数:', filters);

    // 模拟API调用
    setTimeout(() => {
      const mockTrendData = generateTrendData();
      setTrendData(mockTrendData);
      setLoading(false);
    }, 1000);
  };

  // 初始化数据
  useEffect(() => {
    const mockTrendData = generateTrendData();
    setTrendData(mockTrendData);
  }, []);


  // 渲染地域选项
  const renderRegionOptions = () => {
    return regionOptions.map(region => (
      <Select.OptGroup key={region.value} label={region.label}>
        {region.children.map(child => (
          <Option key={child.value} value={child.value}>
            {child.label}
          </Option>
        ))}
      </Select.OptGroup>
    ));
  };

  return (
    <div className="supply-demand-matching-page">
      {/* 筛选面板 */}
      <Card className="filter-card" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          {/* 第一行：时间范围、集群组、专区、调用方 */}
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
                maxTagCount="responsive"
              >
                {clusterGroupOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
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
                maxTagCount="responsive"
                disabled={!filters.clusterGroup || filters.clusterGroup.length === 0}
              >
                {getSpecialZoneOptions(filters.clusterGroup).map(option => (
                  <Option key={option.value} value={option.value}>
                    <span style={{ color: option.type === 'non-zone' ? '#666' : 'inherit' }}>
                      {option.label}
                      {option.type === 'non-zone' && <span style={{ fontSize: '12px', marginLeft: 4 }}>(非专区)</span>}
                    </span>
                  </Option>
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
                maxTagCount="responsive"
                disabled={!filters.specialZone || filters.specialZone.length === 0}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {getCallerOptions(filters.specialZone).map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>

        <Row gutter={[16, 16]} align="middle" style={{ marginTop: 16 }}>
          {/* 第二行：地域/机房、产品类型、操作按钮 */}
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
                maxTagCount="responsive"
              >
                {renderRegionOptions()}
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
                maxTagCount="responsive"
              >
                {productTypeOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>

          {/* 操作按钮 */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                disabled={loading}
              >
                重置
              </Button>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                loading={loading}
                onClick={handleSearch}
              >
                查询
              </Button>
            </div>
          </Col>
        </Row>

        {/* 已选择的筛选条件展示 */}
        {(filters.clusterGroup.length > 0 || filters.specialZone.length > 0 || filters.caller.length > 0 ||
          filters.region.length > 0 || filters.productType.length > 0) && (
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
                      {getCallerOptions(filters.specialZone).find(opt => opt.value === caller)?.label || caller}
                    </Tag>
                  ))}
                </div>
              )}
              {filters.region.length > 0 && (
                <div>
                  <span style={{ fontSize: '12px', color: '#666', marginRight: 4 }}>地域/机房：</span>
                  {filters.region.map(region => (
                    <Tag key={region} closable onClose={() => handleFilterChange('region', filters.region.filter(r => r !== region))}>
                      {region}
                    </Tag>
                  ))}
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
            </Space>
          </div>
        )}
      </Card>

      {/* 汇总说明 */}
      <SupplyDemandSummary
        data={trendData}
        dateRange={filters.dateRange}
        onNavigateToResourceProcurement={onNavigateToResourceProcurement}
      />

      {/* 供需匹配趋势图表 */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>可用库存 VS 需求匹配趋势</span>
            <Tag color="green">实线：历史数据</Tag>
            <Tag color="purple">虚线：预测数据</Tag>
          </div>
        }
        className="trend-card"
      >
        <Tabs
          defaultActiveKey="all"
          items={[
            {
              key: 'all',
              label: '总需求（待评估+确认待交付）',
              children: (
                <div style={{ height: '500px' }}>
                  {trendData ? (
                    <SupplyDemandTrendChart
                      data={trendData}
                      activeTab="all"
                    />
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#999' }}>
                      正在加载数据...
                    </div>
                  )}
                </div>
              )
            },
            {
              key: 'pending',
              label: '待评估需求',
              children: (
                <div style={{ height: '500px' }}>
                  {trendData ? (
                    <SupplyDemandTrendChart
                      data={trendData}
                      activeTab="pending"
                    />
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#999' }}>
                      正在加载数据...
                    </div>
                  )}
                </div>
              )
            },
            {
              key: 'confirmed',
              label: '确认待交付需求',
              children: (
                <div style={{ height: '500px' }}>
                  {trendData ? (
                    <SupplyDemandTrendChart
                      data={trendData}
                      activeTab="confirmed"
                    />
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#999' }}>
                      正在加载数据...
                    </div>
                  )}
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* 资源缺口趋势图表 */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>资源缺口趋势</span>
            <Tag color="red">红色面积：资源缺口</Tag>
            <Tag color="green">实线：历史数据</Tag>
            <Tag color="purple">虚线：预测数据</Tag>
          </div>
        }
        className="gap-trend-card"
        style={{ marginTop: 16 }}
      >
        <Tabs
          defaultActiveKey="all"
          items={[
            {
              key: 'all',
              label: '总需求缺口',
              children: (
                <div style={{ height: '400px' }}>
                  {trendData ? (
                    <ResourceGapTrendChart
                      data={trendData}
                      activeTab="all"
                    />
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#999' }}>
                      正在加载数据...
                    </div>
                  )}
                </div>
              )
            },
            {
              key: 'pending',
              label: '待评估需求缺口',
              children: (
                <div style={{ height: '400px' }}>
                  {trendData ? (
                    <ResourceGapTrendChart
                      data={trendData}
                      activeTab="pending"
                    />
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#999' }}>
                      正在加载数据...
                    </div>
                  )}
                </div>
              )
            },
            {
              key: 'confirmed',
              label: '确认待交付需求缺口',
              children: (
                <div style={{ height: '400px' }}>
                  {trendData ? (
                    <ResourceGapTrendChart
                      data={trendData}
                      activeTab="confirmed"
                    />
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#999' }}>
                      正在加载数据...
                    </div>
                  )}
                </div>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default SupplyDemandMatchingPage;
