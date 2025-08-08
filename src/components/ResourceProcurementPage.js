import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Tag, Space, Tooltip, DatePicker, Select, Input, Modal, Form, InputNumber, message } from 'antd';
import { EyeOutlined, SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './ResourceProcurementPage.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ResourceProcurementPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    procurementMethod: null,
    deliveryMethod: null,
    operator: null,
    dateRange: null
  });
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();

  // 模拟数据
  const mockData = [
    {
      id: 1,
      procurementMethod: '私有云-采购',
      supplyTime: '2024-01-15 10:00:00',
      supplyAmount: 5000,
      deliveryMethod: '自动交付',
      releaseTime: '2024-03-15 10:00:00',
      operator: '张三',
      createTime: '2024-01-10 14:30:00',
      status: 'active'
    },
    {
      id: 2,
      procurementMethod: '公有云-采购',
      supplyTime: '2024-01-20 09:00:00',
      supplyAmount: 8000,
      deliveryMethod: '手动分配',
      releaseTime: '2024-04-20 09:00:00',
      operator: '李四',
      createTime: '2024-01-18 16:45:00',
      status: 'pending'
    },
    {
      id: 3,
      procurementMethod: '私有云-提拉',
      supplyTime: '2024-01-12 08:30:00',
      supplyAmount: 3200,
      deliveryMethod: '批量交付',
      releaseTime: '2024-02-28 08:30:00',
      operator: '王五',
      createTime: '2024-01-08 11:20:00',
      status: 'completed'
    },
    {
      id: 4,
      procurementMethod: '私有云-借调',
      supplyTime: '2024-01-25 15:00:00',
      supplyAmount: 1500,
      deliveryMethod: '即时交付',
      releaseTime: '2024-02-10 15:00:00',
      operator: '赵六',
      createTime: '2024-01-25 14:00:00',
      status: 'active'
    },
    {
      id: 5,
      procurementMethod: '公有云-释放',
      supplyTime: '2024-02-01 12:00:00',
      supplyAmount: 6500,
      deliveryMethod: '分批交付',
      releaseTime: '2024-05-01 12:00:00',
      operator: '孙七',
      createTime: '2024-01-28 09:15:00',
      status: 'pending'
    },
    {
      id: 6,
      procurementMethod: '私有云-搬迁',
      supplyTime: '2024-01-30 14:00:00',
      supplyAmount: 2800,
      deliveryMethod: '自动交付',
      releaseTime: '2024-04-30 14:00:00',
      operator: '陈八',
      createTime: '2024-01-29 10:30:00',
      status: 'pending'
    },
    {
      id: 7,
      procurementMethod: '公有云-腾退',
      supplyTime: '2024-02-05 16:00:00',
      supplyAmount: 4200,
      deliveryMethod: '手动分配',
      releaseTime: '2024-03-05 16:00:00',
      operator: '刘九',
      createTime: '2024-02-03 11:45:00',
      status: 'active'
    },
    {
      id: 8,
      procurementMethod: '私有云-归还',
      supplyTime: '2024-02-08 10:30:00',
      supplyAmount: 3500,
      deliveryMethod: '批量交付',
      releaseTime: '2024-03-08 10:30:00',
      operator: '周十',
      createTime: '2024-02-06 14:15:00',
      status: 'completed'
    },
    {
      id: 9,
      procurementMethod: '私有云-报废',
      supplyTime: '2024-02-10 09:00:00',
      supplyAmount: 800,
      deliveryMethod: '即时交付',
      releaseTime: '2024-02-10 18:00:00',
      operator: '吴十一',
      createTime: '2024-02-09 16:20:00',
      status: 'completed'
    },
    {
      id: 10,
      procurementMethod: '私有云-改配',
      supplyTime: '2024-02-12 14:00:00',
      supplyAmount: 2200,
      deliveryMethod: '自动交付',
      releaseTime: '2024-04-12 14:00:00',
      operator: '郑十二',
      createTime: '2024-02-10 11:30:00',
      status: 'pending'
    }
  ];

  // 获取状态标签
  const getStatusTag = (status) => {
    const statusMap = {
      active: { color: 'green', text: '进行中' },
      pending: { color: 'orange', text: '待执行' },
      completed: { color: 'blue', text: '已完成' },
      cancelled: { color: 'red', text: '已取消' }
    };
    const config = statusMap[status] || { color: 'default', text: '未知' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 格式化数字
  const formatNumber = (num) => {
    return num.toLocaleString() + ' 核';
  };

  // 表格列定义
  const columns = [
    {
      title: '筹措方式',
      dataIndex: 'procurementMethod',
      key: 'procurementMethod',
      width: 120,
      render: (text) => (
        <Tooltip title={text}>
          <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{text}</span>
        </Tooltip>
      )
    },
    {
      title: '供给时间',
      dataIndex: 'supplyTime',
      key: 'supplyTime',
      width: 150,
      render: (text) => (
        <span style={{ fontSize: '12px' }}>
          {dayjs(text).format('YYYY-MM-DD HH:mm')}
        </span>
      ),
      sorter: (a, b) => dayjs(a.supplyTime).unix() - dayjs(b.supplyTime).unix()
    },
    {
      title: '供给量级',
      dataIndex: 'supplyAmount',
      key: 'supplyAmount',
      width: 100,
      render: (amount) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          {formatNumber(amount)}
        </span>
      ),
      sorter: (a, b) => a.supplyAmount - b.supplyAmount
    },
    {
      title: '交付方式',
      dataIndex: 'deliveryMethod',
      key: 'deliveryMethod',
      width: 100,
      render: (method) => {
        const colorMap = {
          '自动交付': 'blue',
          '手动分配': 'orange',
          '批量交付': 'green',
          '即时交付': 'red',
          '分批交付': 'purple'
        };
        return <Tag color={colorMap[method] || 'default'}>{method}</Tag>;
      }
    },
    {
      title: '释放时间',
      dataIndex: 'releaseTime',
      key: 'releaseTime',
      width: 150,
      render: (text) => (
        <span style={{ fontSize: '12px' }}>
          {dayjs(text).format('YYYY-MM-DD HH:mm')}
        </span>
      ),
      sorter: (a, b) => dayjs(a.releaseTime).unix() - dayjs(b.releaseTime).unix()
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 80,
      render: (name) => (
        <span style={{ color: '#722ed1' }}>{name}</span>
      )
    },
    {
      title: '筹措创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
      render: (text) => (
        <span style={{ fontSize: '12px', color: '#666' }}>
          {dayjs(text).format('YYYY-MM-DD HH:mm')}
        </span>
      ),
      sorter: (a, b) => dayjs(a.createTime).unix() - dayjs(b.createTime).unix()
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看详情
          </Button>
        </Space>
      )
    }
  ];

  // 查看详情
  const handleViewDetail = (record) => {
    console.log('查看详情:', record);
    // 这里可以打开详情弹窗或跳转到详情页面
  };

  // 搜索和筛选
  const handleSearch = () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);
  };

  // 重置筛选
  const handleReset = () => {
    setFilters({
      procurementMethod: null,
      deliveryMethod: null,
      operator: null,
      dateRange: null
    });
    setData(mockData);
  };

  // 创建资源筹措
  const handleCreateProcurement = () => {
    setCreateModalVisible(true);
    createForm.resetFields();
  };

  // 提交创建表单
  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      console.log('创建资源筹措:', values);

      // 模拟API调用
      const newRecord = {
        id: data.length + 1,
        procurementMethod: values.procurementMethod,
        supplyTime: values.supplyTime.format('YYYY-MM-DD HH:mm:ss'),
        supplyAmount: values.supplyAmount,
        deliveryMethod: values.deliveryMethod,
        releaseTime: values.releaseTime.format('YYYY-MM-DD HH:mm:ss'),
        operator: values.operator,
        createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        status: 'pending'
      };

      // 添加到数据列表
      setData([newRecord, ...data]);
      setCreateModalVisible(false);
      message.success('资源筹措创建成功！');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 取消创建
  const handleCreateCancel = () => {
    setCreateModalVisible(false);
    createForm.resetFields();
  };

  // 初始化数据
  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="resource-procurement-page">
      <Card
        title={
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
            📋 资源筹措管理
          </div>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateProcurement}
            >
              创建资源筹措
            </Button>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
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
        }
      >
        {/* 筛选条件 */}
        <div className="filter-section" style={{ marginBottom: '16px' }}>
          <Space wrap>
            <div>
              <span style={{ marginRight: '8px' }}>筹措方式：</span>
               <Select
                 placeholder="请选择筹措方式"
                 style={{ width: 180 }}
                 value={filters.procurementMethod}
                 onChange={(value) => setFilters({...filters, procurementMethod: value})}
                 allowClear
               >
                 <Select.OptGroup label="私有云">
                   <Option value="私有云-采购">采购</Option>
                   <Option value="私有云-提拉">提拉</Option>
                   <Option value="私有云-借调">借调</Option>
                   <Option value="私有云-归还">归还</Option>
                   <Option value="私有云-报废">报废</Option>
                   <Option value="私有云-搬迁">搬迁</Option>
                   <Option value="私有云-改配">改配</Option>
                 </Select.OptGroup>
                 <Select.OptGroup label="公有云">
                   <Option value="公有云-采购">采购</Option>
                   <Option value="公有云-释放">释放</Option>
                   <Option value="公有云-腾退">腾退</Option>
                 </Select.OptGroup>
               </Select>
            </div>

            <div>
              <span style={{ marginRight: '8px' }}>交付方式：</span>
              <Select
                placeholder="请选择交付方式"
                style={{ width: 120 }}
                value={filters.deliveryMethod}
                onChange={(value) => setFilters({...filters, deliveryMethod: value})}
                allowClear
              >
                <Option value="自动交付">自动交付</Option>
                <Option value="手动分配">手动分配</Option>
                <Option value="批量交付">批量交付</Option>
                <Option value="即时交付">即时交付</Option>
                <Option value="分批交付">分批交付</Option>
              </Select>
            </div>

            <div>
              <span style={{ marginRight: '8px' }}>操作人：</span>
              <Input
                placeholder="请输入操作人"
                style={{ width: 120 }}
                value={filters.operator}
                onChange={(e) => setFilters({...filters, operator: e.target.value})}
                allowClear
              />
            </div>

            <div>
              <span style={{ marginRight: '8px' }}>创建时间：</span>
              <RangePicker
                style={{ width: 240 }}
                value={filters.dateRange}
                onChange={(dates) => setFilters({...filters, dateRange: dates})}
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
              />
            </div>
          </Space>
        </div>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            total: data.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
          size="small"
         />
       </Card>

       {/* 创建资源筹措弹窗 */}
       <Modal
         title={
           <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
             ➕ 创建资源筹措
           </div>
         }
         open={createModalVisible}
         onOk={handleCreateSubmit}
         onCancel={handleCreateCancel}
         width={600}
         okText="创建"
         cancelText="取消"
       >
         <Form
           form={createForm}
           layout="vertical"
           initialValues={{
             operator: '当前用户'
           }}
         >
            <Form.Item
              label="筹措方式"
              name="procurementMethod"
              rules={[{ required: true, message: '请选择筹措方式' }]}
            >
              <Select placeholder="请选择筹措方式">
                <Select.OptGroup label="私有云">
                  <Option value="私有云-采购">采购</Option>
                  <Option value="私有云-提拉">提拉</Option>
                  <Option value="私有云-借调">借调</Option>
                  <Option value="私有云-归还">归还</Option>
                  <Option value="私有云-报废">报废</Option>
                  <Option value="私有云-搬迁">搬迁</Option>
                  <Option value="私有云-改配">改配</Option>
                </Select.OptGroup>
                <Select.OptGroup label="公有云">
                  <Option value="公有云-采购">采购</Option>
                  <Option value="公有云-释放">释放</Option>
                  <Option value="公有云-腾退">腾退</Option>
                </Select.OptGroup>
              </Select>
            </Form.Item>

           <Form.Item
             label="供给量级（核）"
             name="supplyAmount"
             rules={[
               { required: true, message: '请输入供给量级' },
               { type: 'number', min: 1, message: '供给量级必须大于0' }
             ]}
           >
             <InputNumber
               style={{ width: '100%' }}
               placeholder="请输入供给量级"
               min={1}
               formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
               parser={value => value.replace(/\$\s?|(,*)/g, '')}
             />
           </Form.Item>

           <Form.Item
             label="供给时间"
             name="supplyTime"
             rules={[{ required: true, message: '请选择供给时间' }]}
           >
             <DatePicker
               style={{ width: '100%' }}
               showTime={{ format: 'HH:mm' }}
               format="YYYY-MM-DD HH:mm"
               placeholder="请选择供给时间"
             />
           </Form.Item>

           <Form.Item
             label="释放时间"
             name="releaseTime"
             rules={[{ required: true, message: '请选择释放时间' }]}
           >
             <DatePicker
               style={{ width: '100%' }}
               showTime={{ format: 'HH:mm' }}
               format="YYYY-MM-DD HH:mm"
               placeholder="请选择释放时间"
             />
           </Form.Item>

           <Form.Item
             label="交付方式"
             name="deliveryMethod"
             rules={[{ required: true, message: '请选择交付方式' }]}
           >
             <Select placeholder="请选择交付方式">
               <Option value="自动交付">自动交付</Option>
               <Option value="手动分配">手动分配</Option>
               <Option value="批量交付">批量交付</Option>
               <Option value="即时交付">即时交付</Option>
               <Option value="分批交付">分批交付</Option>
             </Select>
           </Form.Item>

           <Form.Item
             label="操作人"
             name="operator"
             rules={[{ required: true, message: '请输入操作人' }]}
           >
             <Input placeholder="请输入操作人" />
           </Form.Item>
         </Form>
       </Modal>
     </div>
   );
};

export default ResourceProcurementPage;
