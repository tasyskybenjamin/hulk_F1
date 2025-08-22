import React, { useState } from 'react';
import {
  Row,
  Col,
  DatePicker,
  Select,
  Cascader,
  Button,
  Space,
  Tooltip,
  Tag
} from 'antd';
import {
  FilterOutlined,
  ReloadOutlined,
  DownOutlined,
  UpOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const InventoryFilterPanel = ({ filters, onChange, loading }) => {
  const [collapsed, setCollapsed] = useState(false);

  // 产品类型选项
  const productTypeOptions = [
    { value: 'general', label: '通用' },
    { value: 'economic', label: '经济' },
    { value: 'high-performance', label: '高性能' }
  ];

  // 库存用途选项
  const inventoryUsageOptions = [
    {
      value: 'business',
      label: '业务',
      description: '承诺交付业务用户的资源'
    },
    {
      value: 'platform',
      label: '平台',
      description: '承诺交付平台用户的资源'
    },
    {
      value: 'operation',
      label: '运维',
      description: '运维场景使用资源'
    },
    {
      value: 'self-use',
      label: '自用',
      description: 'Hulk自用库存，作为资源缓冲等'
    },
    {
      value: 'emergency',
      label: '紧急资源',
      description: '用于业务紧急场景的资源'
    }
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

  const handleFilterChange = (key, value) => {
    onChange({
      ...filters,
      [key]: value
    });
  };

  const handleReset = () => {
    onChange({
      dateRange: [
        dayjs().subtract(2, 'month').startOf('day'),
        dayjs().add(2, 'month').endOf('day').subtract(11, 'seconds')
      ],
      clusterCascader: [],
      regionCascader: [],
      productType: [],
      inventoryUsage: ['business', 'platform', 'self-use', 'operation', 'emergency']
    });
  };

  const hasActiveFilters = () => {
    return filters.clusterCascader?.length > 0 ||
           filters.regionCascader?.length > 0 ||
           filters.productType?.length > 0 ||
           (filters.inventoryUsage?.length > 0 && filters.inventoryUsage?.length < 5);
  };

  return (
    <div>
      <Row gutter={[16, 16]} align="middle">
        <Col flex="auto">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="filter-item">
                <div className="filter-label">时间范围</div>
                <RangePicker
                  value={filters.dateRange}
                  onChange={(dates) => handleFilterChange('dateRange', dates)}
                  style={{ width: '100%' }}
                  showTime={{
                    defaultValue: [dayjs('00:00:00', 'HH:mm:ss'), dayjs('23:59:49', 'HH:mm:ss')]
                  }}
                  format="YYYY-MM-DD HH:mm:ss"
                />
              </div>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="filter-item">
                <div className="filter-label">集群组/专区</div>
                <Cascader
                  multiple
                  value={filters.clusterCascader}
                  onChange={(value) => handleFilterChange('clusterCascader', value)}
                  options={clusterCascaderOptions}
                  placeholder="请选择集群组/专区"
                  style={{ width: '100%' }}
                  showSearch
                  maxTagCount="responsive"
                />
              </div>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="filter-item">
                <div className="filter-label">地域/机房</div>
                <Cascader
                  multiple
                  value={filters.regionCascader}
                  onChange={(value) => handleFilterChange('regionCascader', value)}
                  options={regionCascaderOptions}
                  placeholder="请选择地域/机房"
                  style={{ width: '100%' }}
                  showSearch
                  maxTagCount="responsive"
                />
              </div>
            </Col>

            {!collapsed && (
              <>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <div className="filter-item">
                    <div className="filter-label">产品类型</div>
                    <Select
                      mode="multiple"
                      value={filters.productType}
                      onChange={(value) => handleFilterChange('productType', value)}
                      options={productTypeOptions}
                      placeholder="请选择产品类型"
                      style={{ width: '100%' }}
                      maxTagCount="responsive"
                    />
                  </div>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                  <div className="filter-item">
                    <div className="filter-label">库存用途</div>
                    <Select
                      mode="multiple"
                      value={filters.inventoryUsage}
                      onChange={(value) => handleFilterChange('inventoryUsage', value)}
                      placeholder="请选择库存用途"
                      style={{ width: '100%' }}
                      maxTagCount="responsive"
                    >
                      {inventoryUsageOptions.map(option => (
                        <Select.Option key={option.value} value={option.value}>
                          <Tooltip title={option.description} placement="right">
                            {option.label}
                          </Tooltip>
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </Col>
              </>
            )}
          </Row>
        </Col>

        <Col flex="none">
          <Space>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              loading={loading}
              onClick={() => onChange(filters)}
            >
              查询
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
            >
              重置
            </Button>
            <Button
              type="link"
              icon={collapsed ? <DownOutlined /> : <UpOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? '展开' : '收起'}
            </Button>
          </Space>
        </Col>
      </Row>

      {/* 已选筛选条件展示 */}
      {hasActiveFilters() && (
        <div style={{ marginTop: 16, padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
          <Space wrap>
            {filters.clusterCascader?.length > 0 && (
              <div>
                <span style={{ fontSize: '12px', color: '#666', marginRight: 4 }}>集群组/专区/调用方：</span>
                {filters.clusterCascader.map((item, index) => (
                  <Tag key={index} closable onClose={() => {
                    const newValue = filters.clusterCascader.filter((_, i) => i !== index);
                    handleFilterChange('clusterCascader', newValue);
                  }}>
                    {Array.isArray(item) ? item.join(' > ') : item}
                  </Tag>
                ))}
              </div>
            )}
            {filters.regionCascader?.length > 0 && (
              <div>
                <span style={{ fontSize: '12px', color: '#666', marginRight: 4 }}>地域/机房：</span>
                {filters.regionCascader.map((item, index) => (
                  <Tag key={index} closable onClose={() => {
                    const newValue = filters.regionCascader.filter((_, i) => i !== index);
                    handleFilterChange('regionCascader', newValue);
                  }}>
                    {Array.isArray(item) ? item.join(' > ') : item}
                  </Tag>
                ))}
              </div>
            )}
            {filters.productType?.length > 0 && (
              <div>
                <span style={{ fontSize: '12px', color: '#666', marginRight: 4 }}>产品类型：</span>
                {filters.productType.map(type => (
                  <Tag key={type} closable onClose={() => {
                    const newValue = filters.productType.filter(t => t !== type);
                    handleFilterChange('productType', newValue);
                  }}>
                    {productTypeOptions.find(opt => opt.value === type)?.label || type}
                  </Tag>
                ))}
              </div>
            )}
            {filters.inventoryUsage?.length > 0 && filters.inventoryUsage?.length < 5 && (
              <div>
                <span style={{ fontSize: '12px', color: '#666', marginRight: 4 }}>库存用途：</span>
                {filters.inventoryUsage.map(usage => (
                  <Tag key={usage} closable onClose={() => {
                    const newValue = filters.inventoryUsage.filter(u => u !== usage);
                    handleFilterChange('inventoryUsage', newValue);
                  }}>
                    {inventoryUsageOptions.find(opt => opt.value === usage)?.label || usage}
                  </Tag>
                ))}
              </div>
            )}
          </Space>
        </div>
      )}
    </div>
  );
};

export default InventoryFilterPanel;
