import React from 'react';
import { Row, Col, DatePicker, Select, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './FilterPanel.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const FilterPanel = ({ filters, onChange, loading }) => {
  // 地域/机房选项
  const regionOptions = [
    {
      label: '北京',
      value: 'beijing',
      children: [
        { label: '机房1', value: 'beijing-room1' },
        { label: '机房2', value: 'beijing-room2' },
        { label: '机房3', value: 'beijing-room3' },
        { label: '机房4', value: 'beijing-room4' },
        { label: '机房5', value: 'beijing-room5' }
      ]
    },
    { label: '上海', value: 'shanghai' },
    { label: '怀来', value: 'huailai' }
  ];

  // 产品类型选项
  const productTypeOptions = [
    { label: '通用', value: 'general' },
    { label: '经济', value: 'economy' },
    { label: '高性能', value: 'high-performance' },
    { label: '高IO', value: 'high-io' },
    { label: '专用宿主机', value: 'dedicated-host' },
    { label: '其他', value: 'other' }
  ];

  // 客户选项（示例数据）
  const customerOptions = [
    { label: '客户A', value: 'customer-a' },
    { label: '客户B', value: 'customer-b' },
    { label: '客户C', value: 'customer-c' },
    { label: '客户D', value: 'customer-d' },
    { label: '客户E', value: 'customer-e' }
  ];

  // 处理筛选条件变化
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    onChange(newFilters);
  };

  // 重置筛选条件
  const handleReset = () => {
    const resetFilters = {
      dateRange: null,
      region: null,
      productType: null,
      customer: null
    };
    onChange(resetFilters);
  };

  // 渲染地域选项
  const renderRegionOptions = () => {
    return regionOptions.map(region => {
      if (region.children) {
        return (
          <Select.OptGroup key={region.value} label={region.label}>
            {region.children.map(child => (
              <Option key={child.value} value={child.value}>
                {child.label}
              </Option>
            ))}
          </Select.OptGroup>
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
    <div className="filter-panel">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={6}>
          <div className="filter-item">
            <label className="filter-label">需求时间范围：</label>
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
            <label className="filter-label">地域/机房：</label>
            <Select
              value={filters.region}
              onChange={(value) => handleFilterChange('region', value)}
              placeholder="请选择地域/机房"
              style={{ width: '100%' }}
              allowClear
            >
              {renderRegionOptions()}
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div className="filter-item">
            <label className="filter-label">产品类型：</label>
            <Select
              value={filters.productType}
              onChange={(value) => handleFilterChange('productType', value)}
              placeholder="请选择产品类型"
              style={{ width: '100%' }}
              allowClear
            >
              {productTypeOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div className="filter-item">
            <label className="filter-label">客户名称：</label>
            <Select
              value={filters.customer}
              onChange={(value) => handleFilterChange('customer', value)}
              placeholder="请选择客户"
              style={{ width: '100%' }}
              allowClear
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {customerOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        </Col>
      </Row>

      <Row justify="end" style={{ marginTop: 16 }}>
        <Col>
          <Space>
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
          </Space>
        </Col>
      </Row>

    </div>
  );
};

export default FilterPanel;
