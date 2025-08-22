import React, { useState, useEffect } from 'react';
import { Row, Col, DatePicker, Select, Button, Space, Tag, Cascader } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option, OptGroup } = Select;

const DemandFilterPanel = ({ filters, onChange, loading }) => {
  // 需求渠道配置
  const channelScenarioMap = {
    'daily': {
      label: '日常',
      scenarios: [
        { value: 'avatar-daily', label: 'Avatar日常供给' },
        { value: 'scheduled-expansion', label: '预约扩容' }
      ]
    },
    'activity': {
      label: '活动',
      scenarios: [
        { value: '2025-qixi', label: '25年七夕' },
        { value: '2025-0818-voucher', label: '2025年08.18神券节活动' },
        { value: '2025-double11', label: '2025年双11活动' },
        { value: '2025-618', label: '2025年618活动' }
      ]
    },
    'emergency': {
      label: '应急',
      scenarios: [
        { value: 'emergency-pool-supplement', label: '应急资源池补充' }
      ]
    },
    'special': {
      label: '专项',
      scenarios: [
        { value: 'special-project-1', label: '专项项目1' },
        { value: 'special-project-2', label: '专项项目2' }
      ]
    },
    'resource-pool': {
      label: '资源池',
      scenarios: [
        { value: 'elastic', label: '弹性伸缩' },
        { value: 'cargo', label: 'Cargo' },
        { value: 'finance-zone', label: '金融专区' },
        { value: 'settlement-unit', label: '结算单元' }
      ]
    }
  };

  // 客户名称级联选择器数据结构：业务/平台 -> 具体客户
  const customerCascaderOptions = [
    {
      value: 'business',
      label: '业务',
      children: [
        { value: 'meituan-platform', label: '美团平台' },
        { value: 'meituan-waimai', label: '美团外卖' },
        { value: 'meituan-maicai', label: '美团买菜' },
        { value: 'meituan-youxuan', label: '美团优选' },
        { value: 'meituan-shangou', label: '美团闪购' },
        { value: 'meituan-dache', label: '美团打车' },
        { value: 'meituan-jiudian', label: '美团酒店' },
        { value: 'dianping-division', label: '点评事业部' },
        { value: 'finance-business', label: '金融业务' },
        { value: 'payment-system', label: '支付系统' },
        { value: 'settlement-center', label: '结算中心' },
        { value: 'finance-system', label: '财务系统' }
      ]
    },
    {
      value: 'platform',
      label: '平台',
      children: [
        { value: 'avatar', label: 'Avatar' },
        { value: 'cargo', label: 'Cargo' },
        { value: 'cargo-platform', label: 'Cargo平台' },
        { value: 'container-orchestration', label: '容器编排' },
        { value: 'elastic-computing', label: '弹性计算' },
        { value: 'container-service', label: '容器服务' },
        { value: 'platform-ops', label: '平台运维' }
      ]
    }
  ];

  // 场景对应的客户映射（更新为级联路径）
  const scenarioCustomerMap = {
    'avatar-daily': [
      ['business', 'meituan-waimai'],
      ['business', 'meituan-maicai'],
      ['business', 'meituan-youxuan']
    ],
    'scheduled-expansion': [
      ['business', 'meituan-dache'],
      ['business', 'meituan-jiudian']
    ],
    '2025-qixi': [
      ['business', 'meituan-waimai'],
      ['business', 'meituan-maicai'],
      ['business', 'meituan-shangou']
    ],
    '2025-0818-voucher': [
      ['business', 'meituan-waimai'],
      ['business', 'meituan-youxuan'],
      ['business', 'meituan-jiudian']
    ],
    '2025-double11': [
      ['business', 'meituan-waimai'],
      ['business', 'meituan-maicai'],
      ['business', 'meituan-youxuan'],
      ['business', 'meituan-jiudian']
    ],
    '2025-618': [
      ['business', 'meituan-waimai'],
      ['business', 'meituan-shangou'],
      ['business', 'meituan-youxuan']
    ],
    'emergency-pool-supplement': [
      ['platform', 'platform-ops']
    ],
    'elastic': [
      ['platform', 'elastic-computing'],
      ['platform', 'container-service']
    ],
    'cargo': [
      ['platform', 'cargo-platform'],
      ['platform', 'container-orchestration']
    ],
    'finance-zone': [
      ['business', 'finance-business'],
      ['business', 'payment-system']
    ],
    'settlement-unit': [
      ['business', 'settlement-center'],
      ['business', 'finance-system']
    ]
  };

  // 需求状态选项
  const demandStatusOptions = [
    { value: 'pending-evaluation', label: '待评估', color: 'orange', tooltip: '不保障SLA' },
    { value: 'confirmed-pending', label: '确认待交付', color: 'red', tooltip: '保障SLA' },
    { value: 'delivered', label: '已交付', color: 'green' },
    { value: 'recycled', label: '已回收', color: 'purple' },
    { value: 'rejected', label: '驳回', color: 'default' }
  ];

  // 地域/机房级联选择器数据结构
  const regionCascaderOptions = [
    {
      value: 'beijing',
      label: '北京',
      children: [
        { value: 'any', label: 'Any' },
        { value: 'room1', label: '机房1' },
        { value: 'room2', label: '机房2' },
        { value: 'room3', label: '机房3' }
      ]
    },
    {
      value: 'shanghai',
      label: '上海',
      children: [
        { value: 'any', label: 'Any' },
        { value: 'room1', label: '机房1' },
        { value: 'room2', label: '机房2' }
      ]
    },
    {
      value: 'huailai',
      label: '怀来',
      children: [
        { value: 'any', label: 'Any' },
        { value: 'room1', label: '机房1' }
      ]
    },
    {
      value: 'guangzhou',
      label: '广州',
      children: [
        { value: 'any', label: 'Any' },
        { value: 'room1', label: '机房1' }
      ]
    },
    {
      value: 'shenzhen',
      label: '深圳',
      children: [
        { value: 'any', label: 'Any' },
        { value: 'room1', label: '机房1' }
      ]
    }
  ];

  // 级联选择器数据结构：集群组 -> 专区 -> 调用方
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
            { value: 'policy', label: 'policy' }
          ]
        },
        {
          value: 'hulk_pool_buffer',
          label: 'hulk_pool_buffer',
          children: [
            { value: 'avatar', label: 'avatar' },
            { value: 'policy', label: 'policy' }
          ]
        },
        {
          value: 'hulk_holiday',
          label: 'hulk_holiday',
          children: [
            { value: 'holiday', label: 'holiday' },
            { value: 'hulk_holiday_admin', label: 'hulk_holiday_admin' },
            { value: 'migrate_hulk_holiday', label: 'migrate_hulk_holiday' },
            { value: 'hulk_holiday', label: 'hulk_holiday' }
          ]
        },
        {
          value: 'jinrong_hulk',
          label: '金融专区',
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
          children: [
            { value: 'avatar', label: 'avatar' },
            { value: 'policy', label: 'policy' }
          ]
        },
        {
          value: 'hrs_non_zone_general',
          label: 'HRS视野内非专区部分',
          children: [
            { value: 'n_plus_one', label: 'n_plus_one' },
            { value: 'hdr', label: 'hdr' },
            { value: 'maoyan', label: 'maoyan' }
          ]
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
        },
        {
          value: 'hrs_non_zone_arm',
          label: 'HRS视野内非专区部分',
          children: [
            { value: 'hulk_arm', label: 'hulk_arm' }
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
        },
        {
          value: 'hrs_non_zone_serverless',
          label: 'HRS视野内非专区部分',
          children: [
            { value: 'policy_txserverless', label: 'policy+txserverless' }
          ]
        }
      ]
    }
  ];

  // 产品类型选项
  const productTypeOptions = [
    { value: 'general', label: '通用' },
    { value: 'economy', label: '经济' },
    { value: 'high-performance', label: '高性能' },
    { value: 'dedicated-host', label: '专用宿主机' }
  ];

  // 需求标签选项
  const demandTagOptions = [
    { value: 'expected', label: '预期内', color: 'green' },
    { value: 'unexpected', label: '预期外', color: 'orange' }
  ];

  // 获取可用的场景选项（支持多选渠道）
  const getAvailableScenarios = () => {
    if (!filters.demandChannel || filters.demandChannel.length === 0) return [];
    const allScenarios = [];
    filters.demandChannel.forEach(channel => {
      const scenarios = channelScenarioMap[channel]?.scenarios || [];
      allScenarios.push(...scenarios);
    });
    // 去重
    const uniqueScenarios = allScenarios.filter((scenario, index, self) =>
      index === self.findIndex(s => s.value === scenario.value)
    );
    return uniqueScenarios;
  };

  // 获取可用的客户选项（支持多选场景）
  const getAvailableCustomers = () => {
    if (!filters.demandScenario || filters.demandScenario.length === 0) return [];
    const allCustomerPaths = [];
    filters.demandScenario.forEach(scenario => {
      const customerPaths = scenarioCustomerMap[scenario] || [];
      allCustomerPaths.push(...customerPaths);
    });

    // 去重：将路径转换为字符串进行比较
    const uniqueCustomerPaths = allCustomerPaths.filter((path, index, self) =>
      index === self.findIndex(p => JSON.stringify(p) === JSON.stringify(path))
    );

    return uniqueCustomerPaths;
  };

  // 处理筛选条件变化
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };

    // 联动逻辑：当渠道变化时，清空场景和客户
    if (key === 'demandChannel') {
      newFilters.demandScenario = [];
      newFilters.customerName = [];
    }

    // 联动逻辑：当场景变化时，清空客户
    if (key === 'demandScenario') {
      newFilters.customerName = [];
    }

    onChange(newFilters);
  };

  // 处理集群级联选择器变化
  const handleCascaderChange = (value) => {
    handleFilterChange('clusterCascader', value);
  };

  // 处理地域级联选择器变化
  const handleRegionCascaderChange = (value) => {
    handleFilterChange('regionCascader', value);
  };

  // 处理客户级联选择器变化
  const handleCustomerCascaderChange = (value) => {
    handleFilterChange('customerName', value);
  };

   // 重置筛选条件（设置默认全选）
   const handleReset = () => {
     const resetFilters = {
       dateRange: [dayjs().subtract(1, 'month'), dayjs().add(1, 'month')], // 默认最近一个月+未来一个月
       demandChannel: Object.keys(channelScenarioMap), // 默认全选所有渠道
       demandScenario: [], // 场景根据渠道联动
       customerName: [], // 客户根据场景联动
       demandStatus: demandStatusOptions.map(s => s.value), // 默认全选所有状态
       regionCascader: [], // 地域级联选择器：地域->机房
       clusterCascader: [], // 级联选择器：集群组->专区
       productType: productTypeOptions.map(p => p.value), // 默认全选所有产品类型
       demandTags: demandTagOptions.map(t => t.value) // 默认全选所有标签
     };
     onChange(resetFilters);
   };

  // 初始化默认时间范围
  useEffect(() => {
    if (!filters.dateRange) {
      handleFilterChange('dateRange', [dayjs().subtract(1, 'month'), dayjs().add(1, 'month')]);
    }
  }, []);


  return (
    <div className="demand-filter-panel">
      <Row gutter={[16, 16]} align="middle">
        {/* 第一行：时间范围、需求渠道、需求场景、客户名称 */}
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
            <label className="filter-label">需求渠道：</label>
            <Select
              mode="multiple"
              value={filters.demandChannel}
              onChange={(value) => handleFilterChange('demandChannel', value)}
              placeholder="请选择需求渠道（默认全选）"
              style={{ width: '100%' }}
              allowClear
              maxTagCount="responsive"
            >
              {Object.entries(channelScenarioMap).map(([key, config]) => (
                <Option key={key} value={key}>
                  {config.label}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div className="filter-item">
            <label className="filter-label">需求场景：</label>
            <Select
              mode="multiple"
              value={filters.demandScenario}
              onChange={(value) => handleFilterChange('demandScenario', value)}
              placeholder="请选择需求场景（默认全选）"
              style={{ width: '100%' }}
              allowClear
              maxTagCount="responsive"
              disabled={!filters.demandChannel || filters.demandChannel.length === 0}
            >
              {getAvailableScenarios().map(scenario => (
                <Option key={scenario.value} value={scenario.value}>
                  {scenario.label}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div className="filter-item">
            <label className="filter-label">客户名称：</label>
            <Cascader
              options={customerCascaderOptions}
              value={filters.customerName}
              onChange={handleCustomerCascaderChange}
              placeholder="请选择客户"
              style={{ width: '100%' }}
              allowClear
              showSearch={{
                filter: (inputValue, path) =>
                  path.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
              }}
              multiple
              maxTagCount="responsive"
              disabled={!filters.demandScenario || filters.demandScenario.length === 0}
              displayRender={(labels, selectedOptions) => {
                if (labels.length === 0) return '';
                return labels.join(' / ');
              }}
            />
          </div>
        </Col>

        {/* 第二行：需求状态、地域/机房、集群组、专区 */}
        <Col xs={24} sm={12} md={6}>
          <div className="filter-item">
            <label className="filter-label">需求状态：</label>
            <Select
              mode="multiple"
              value={filters.demandStatus}
              onChange={(value) => handleFilterChange('demandStatus', value)}
              placeholder="请选择需求状态（默认全选）"
              style={{ width: '100%' }}
              allowClear
              maxTagCount="responsive"
            >
              {demandStatusOptions.map(status => (
                <Option key={status.value} value={status.value}>
                  <Tag color={status.color} style={{ marginRight: 8 }}>
                    {status.label}
                  </Tag>
                  {status.tooltip && <span style={{ fontSize: '12px', color: '#999' }}>({status.tooltip})</span>}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div className="filter-item">
            <label className="filter-label">地域/机房：</label>
            <Cascader
              options={regionCascaderOptions}
              value={filters.regionCascader}
              onChange={handleRegionCascaderChange}
              placeholder="请选择地域/机房"
              style={{ width: '100%' }}
              allowClear
              showSearch={{
                filter: (inputValue, path) =>
                  path.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
              }}
              multiple
              maxTagCount="responsive"
              displayRender={(labels, selectedOptions) => {
                if (labels.length === 0) return '';
                return labels.join(' / ');
              }}
            />
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div className="filter-item">
            <label className="filter-label">集群组/专区：</label>
            <Cascader
              options={clusterCascaderOptions}
              value={filters.clusterCascader}
              onChange={handleCascaderChange}
              placeholder="请选择集群组/专区"
              style={{ width: '100%' }}
              allowClear
              showSearch={{
                filter: (inputValue, path) =>
                  path.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
              }}
              multiple
              maxTagCount="responsive"
              displayRender={(labels, selectedOptions) => {
                if (labels.length === 0) return '';
                return labels.join(' / ');
              }}
            />
          </div>
        </Col>

        {/* 第三行：产品类型、需求标签 */}

        <Col xs={24} sm={12} md={6}>
          <div className="filter-item">
            <label className="filter-label">产品类型：</label>
            <Select
              mode="multiple"
              value={filters.productType}
              onChange={(value) => handleFilterChange('productType', value)}
              placeholder="请选择产品类型（默认全选）"
              style={{ width: '100%' }}
              allowClear
              maxTagCount="responsive"
            >
              {productTypeOptions.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div className="filter-item">
            <label className="filter-label">需求标签：</label>
            <Select
              mode="multiple"
              value={filters.demandTags}
              onChange={(value) => handleFilterChange('demandTags', value)}
              placeholder="请选择需求标签"
              style={{ width: '100%' }}
              allowClear
              maxTagCount="responsive"
            >
              {demandTagOptions.map(tag => (
                <Option key={tag.value} value={tag.value}>
                  <Tag color={tag.color}>{tag.label}</Tag>
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        {/* 操作按钮 */}
        <Col xs={24} sm={12} md={6}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingLeft: '80px' }}>
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
              onClick={() => onChange(filters)}
            >
              查询
            </Button>
          </div>
        </Col>
      </Row>

      {/* 当前筛选条件展示 */}
      {(filters.demandChannel?.length > 0 || filters.demandScenario?.length > 0 || filters.customerName?.length > 0 ||
        filters.demandStatus?.length > 0 || filters.regionCascader?.length > 0 || filters.clusterCascader?.length > 0 || filters.demandTags?.length > 0) && (
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <div style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: '4px' }}>
              <span style={{ fontSize: '12px', color: '#666', marginRight: '8px' }}>当前筛选：</span>
              {filters.demandChannel?.map(channel => (
                <Tag key={channel} closable onClose={() => handleFilterChange('demandChannel', filters.demandChannel.filter(c => c !== channel))}>
                  渠道: {channelScenarioMap[channel]?.label}
                </Tag>
              ))}
              {filters.demandScenario?.map(scenario => (
                <Tag key={scenario} closable onClose={() => handleFilterChange('demandScenario', filters.demandScenario.filter(s => s !== scenario))}>
                  场景: {getAvailableScenarios().find(s => s.value === scenario)?.label}
                </Tag>
              ))}
              {filters.customerName?.map((cascaderValue, index) => (
                <Tag
                  key={`customer-cascader-${index}`}
                  closable
                  onClose={() => handleFilterChange('customerName', filters.customerName.filter((_, i) => i !== index))}
                >
                  {cascaderValue.join(' / ')}
                </Tag>
              ))}
              {filters.demandStatus?.map(status => (
                <Tag
                  key={status}
                  color={demandStatusOptions.find(s => s.value === status)?.color}
                  closable
                  onClose={() => handleFilterChange('demandStatus', filters.demandStatus.filter(s => s !== status))}
                >
                  状态: {demandStatusOptions.find(s => s.value === status)?.label}
                </Tag>
              ))}
              {filters.regionCascader?.map((cascaderValue, index) => (
                <Tag
                  key={`region-cascader-${index}`}
                  closable
                  onClose={() => handleFilterChange('regionCascader', filters.regionCascader.filter((_, i) => i !== index))}
                >
                  {cascaderValue.join(' / ')}
                </Tag>
              ))}
              {filters.clusterCascader?.map((cascaderValue, index) => (
                <Tag
                  key={`cluster-cascader-${index}`}
                  closable
                  onClose={() => handleFilterChange('clusterCascader', filters.clusterCascader.filter((_, i) => i !== index))}
                >
                  {cascaderValue.join(' / ')}
                </Tag>
              ))}
              {filters.demandTags?.map(tag => (
                <Tag
                  key={tag}
                  color={demandTagOptions.find(t => t.value === tag)?.color}
                  closable
                  onClose={() => handleFilterChange('demandTags', filters.demandTags.filter(t => t !== tag))}
                >
                  {demandTagOptions.find(t => t.value === tag)?.label}
                </Tag>
              ))}
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default DemandFilterPanel;
