import React, { useState, useEffect } from 'react';
import { Row, Col, DatePicker, Select, Button, Space, Tag } from 'antd';
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

  // 场景对应的客户映射（收敛后的客户名称）
  const scenarioCustomerMap = {
    'avatar-daily': ['美团外卖', '美团买菜', '美团优选'],
    'scheduled-expansion': ['美团打车', '美团酒店'],
    '2025-qixi': ['美团外卖', '美团买菜', '美团闪购'],
    '2025-0818-voucher': ['美团外卖', '美团优选', '美团酒店'],
    '2025-double11': ['美团外卖', '美团买菜', '美团优选', '美团酒店'],
    '2025-618': ['美团外卖', '美团闪购', '美团优选'],
    'emergency-pool-supplement': ['平台运维'],
    'elastic': ['弹性计算', '容器服务'],
    'cargo': ['Cargo平台', '容器编排'],
    'finance-zone': ['金融业务', '支付系统'],
    'settlement-unit': ['结算中心', '财务系统']
  };

  // 需求状态选项
  const demandStatusOptions = [
    { value: 'pending-evaluation', label: '待评估', color: 'orange', tooltip: '不保障SLA' },
    { value: 'confirmed-pending', label: '确认待交付', color: 'red', tooltip: '保障SLA' },
    { value: 'delivered', label: '已交付', color: 'green' },
    { value: 'recycled', label: '已回收', color: 'purple' },
    { value: 'rejected', label: '驳回', color: 'default' }
  ];

  // 地域/机房选项（每个地域添加Any选项）
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
    { value: 'holiday', label: 'holiday' },
    { value: 'policy', label: 'policy' },
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
    const allCustomers = [];
    filters.demandScenario.forEach(scenario => {
      const customers = scenarioCustomerMap[scenario] || [];
      allCustomers.push(...customers);
    });
    // 去重并格式化
    const uniqueCustomers = [...new Set(allCustomers)];
    return uniqueCustomers.map(customer => ({
      value: customer.toLowerCase().replace(/\s+/g, '-'),
      label: customer
    }));
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

    // 联动逻辑：当集群组变化时，清空专区选择
    if (key === 'clusterGroup') {
      newFilters.specialZone = [];
    }

    onChange(newFilters);
  };

   // 重置筛选条件（设置默认全选）
   const handleReset = () => {
     const resetFilters = {
       dateRange: [dayjs().subtract(1, 'month'), dayjs().add(1, 'month')], // 默认最近一个月+未来一个月
       demandChannel: Object.keys(channelScenarioMap), // 默认全选所有渠道
       demandScenario: [], // 场景根据渠道联动
       customerName: [], // 客户根据场景联动
       demandStatus: demandStatusOptions.map(s => s.value), // 默认全选所有状态
       region: [], // 地域多选，默认全选
       clusterGroup: [], // 集群组多选，默认全选
       specialZone: [], // 专区根据集群组联动
       caller: [], // 调用方多选，默认全选
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

  // 渲染地域选项
  const renderRegionOptions = () => {
    return regionOptions.map(region => {
      if (region.children) {
        return (
          <OptGroup key={region.value} label={region.label}>
            {region.children.map(child => (
              <Option key={child.value} value={child.value}>
                {child.label}
              </Option>
            ))}
          </OptGroup>
        );
      }
      return (
        <Option key={region.value} value={region.value}>
          {region.label}
        </Option>
      );
    });
  };

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
            <Select
              mode="multiple"
              value={filters.customerName}
              onChange={(value) => handleFilterChange('customerName', value)}
              placeholder="请选择客户（默认全选）"
              style={{ width: '100%' }}
              allowClear
              showSearch
              maxTagCount="responsive"
              disabled={!filters.demandScenario || filters.demandScenario.length === 0}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {getAvailableCustomers().map(customer => (
                <Option key={customer.value} value={customer.value}>
                  {customer.label}
                </Option>
              ))}
            </Select>
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
            <Select
              mode="multiple"
              value={filters.region}
              onChange={(value) => handleFilterChange('region', value)}
              placeholder="请选择地域/机房（默认全选）"
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
              {clusterGroupOptions.map(cluster => (
                <Option key={cluster.value} value={cluster.value}>
                  {cluster.label}
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

        {/* 第三行：调用方、产品类型、需求标签 */}
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
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {callerOptions.map(caller => (
                <Option key={caller.value} value={caller.value}>
                  {caller.label}
                </Option>
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
              onClick={() => onChange(filters)}
            >
              查询
            </Button>
          </div>
        </Col>
      </Row>

      {/* 当前筛选条件展示 */}
      {(filters.demandChannel?.length > 0 || filters.demandScenario?.length > 0 || filters.customerName?.length > 0 ||
        filters.demandStatus?.length > 0 || filters.clusterGroup?.length > 0 || filters.specialZone?.length > 0 ||
        filters.caller?.length > 0 || filters.demandTags?.length > 0) && (
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
              {filters.customerName?.map(customer => (
                <Tag key={customer} closable onClose={() => handleFilterChange('customerName', filters.customerName.filter(c => c !== customer))}>
                  客户: {getAvailableCustomers().find(c => c.value === customer)?.label}
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
              {filters.clusterGroup?.map(cluster => (
                <Tag key={cluster} closable onClose={() => handleFilterChange('clusterGroup', filters.clusterGroup.filter(c => c !== cluster))}>
                  集群组: {clusterGroupOptions.find(c => c.value === cluster)?.label}
                </Tag>
              ))}
              {filters.specialZone?.map(zone => (
                <Tag key={zone} closable onClose={() => handleFilterChange('specialZone', filters.specialZone.filter(z => z !== zone))}>
                  专区: {getSpecialZoneOptions(filters.clusterGroup).find(z => z.value === zone)?.label || zone}
                </Tag>
              ))}
              {filters.caller?.map(caller => (
                <Tag key={caller} closable onClose={() => handleFilterChange('caller', filters.caller.filter(c => c !== caller))}>
                  调用方: {caller}
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
