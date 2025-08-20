import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Row,
  Col,
  Tag,
  Space,
  Modal,
  Form,
  Select,
  InputNumber,
  Input,
  DatePicker,
  message,
  Divider
} from 'antd';
import {
  PlusOutlined,
  SettingOutlined,
  EyeOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const ResourceProcurementPage = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // 处理从其他页面跳转过来的参数
  React.useEffect(() => {
    const procurementParams = sessionStorage.getItem('procurementParams');
    if (procurementParams) {
      try {
        const params = JSON.parse(procurementParams);
        console.log('接收到跳转参数:', params);

        // 如果是从库存趋势页面跳转过来的
        if (params.source === 'inventory-trend') {
          // 可以根据参数自动打开创建表单并预填充一些信息
          message.info(`检测到库存增加事件：${params.type}，时间：${params.date}，数量：${params.amount}核`);

          // 清除参数，避免重复处理
          sessionStorage.removeItem('procurementParams');

          // 可选：自动打开创建表单
          // setCreateModalVisible(true);
        }
      } catch (error) {
        console.error('解析跳转参数失败:', error);
        sessionStorage.removeItem('procurementParams');
      }
    }
  }, []);

  // 根据时间点计算状态的函数
  const calculateStatus = (timePoints) => {
    const now = new Date(); // 当前精确时间

    // 检查是否有任何时间点大于当前时间
    const hasFutureTimePoint = timePoints.some(item => {
      const timePointDate = new Date(item.timePoint);
      return timePointDate > now;
    });

    return hasFutureTimePoint ? 'pending' : 'expired';
  };

  // 模拟资源筹措数据
  const [procurementData, setProcurementData] = useState([
    // 已过期的筹措记录
    {
      key: '1',
      type: '私有云提拉',
      responsible: '赵六',
      description: '黑五活动资源筹措',
      timePoints: [
        { timePoint: '2024-12-15', amount: 2500 },
        { timePoint: '2024-12-16', amount: 2000 }
      ],
      totalAmount: 4500
    },
    {
      key: '2',
      type: '私有云到货',
      responsible: '钱七',
      description: '常规资源补充',
      timePoints: [
        { timePoint: '2024-12-10', amount: 2800 }
      ],
      totalAmount: 2800
    },
    {
      key: '3',
      type: '私有云借调',
      responsible: '李四',
      description: '双十一活动资源调配',
      timePoints: [
        { timePoint: '2024-11-28', amount: 1200 },
        { timePoint: '2024-11-30', amount: 2000 }
      ],
      totalAmount: 3200
    },
    {
      key: '4',
      type: '私有云提拉',
      responsible: '张三',
      description: '年终大促资源筹措',
      timePoints: [
        { timePoint: '2024-11-18', amount: 2000 },
        { timePoint: '2024-11-20', amount: 1500 },
        { timePoint: '2024-11-22', amount: 1500 }
      ],
      totalAmount: 5000
    },
    {
      key: '5',
      type: '私有云借调',
      responsible: '陈八',
      description: '紧急需求资源调配',
      timePoints: [
        { timePoint: '2024-10-25', amount: 1800 }
      ],
      totalAmount: 1800
    },
    // 待验证的筹措记录（未来时间点）
    {
      key: '6',
      type: '私有云到货',
      responsible: '王五',
      description: '春节前资源储备',
      timePoints: [
        { timePoint: '2025-01-05', amount: 3000 },
        { timePoint: '2025-01-08', amount: 3000 }
      ],
      totalAmount: 6000
    },
    {
      key: '7',
      type: '私有云提拉',
      responsible: '刘九',
      description: '春节活动资源筹措',
      timePoints: [
        { timePoint: '2025-01-15', amount: 4000 },
        { timePoint: '2025-01-20', amount: 2500 },
        { timePoint: '2025-01-25', amount: 1500 }
      ],
      totalAmount: 8000
    },
    {
      key: '8',
      type: '私有云借调',
      responsible: '周十',
      description: '元宵节促销资源调配',
      timePoints: [
        { timePoint: '2025-02-10', amount: 2200 },
        { timePoint: '2025-02-12', amount: 1800 }
      ],
      totalAmount: 4000
    },
    {
      key: '9',
      type: '私有云到货',
      responsible: '吴十一',
      description: 'Q1季度资源补充计划',
      timePoints: [
        { timePoint: '2025-02-15', amount: 5000 }
      ],
      totalAmount: 5000
    },
    {
      key: '10',
      type: '私有云提拉',
      responsible: '郑十二',
      description: '情人节活动资源筹措',
      timePoints: [
        { timePoint: '2025-02-12', amount: 1500 },
        { timePoint: '2025-02-14', amount: 2500 }
      ],
      totalAmount: 4000
    },
    {
      key: '11',
      type: '私有云借调',
      responsible: '孙十三',
      description: '三月女神节资源调配',
      timePoints: [
        { timePoint: '2025-03-05', amount: 3500 },
        { timePoint: '2025-03-08', amount: 2000 }
      ],
      totalAmount: 5500
    },
    {
      key: '12',
      type: '私有云到货',
      responsible: '李十四',
      description: '春季大促资源储备',
      timePoints: [
        { timePoint: '2025-03-15', amount: 4500 },
        { timePoint: '2025-03-20', amount: 3000 },
        { timePoint: '2025-03-25', amount: 2500 }
      ],
      totalAmount: 10000
    }
  ].map(item => ({
    ...item,
    status: calculateStatus(item.timePoints)
  })));

  const columns = [
    {
      title: '筹措类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        const colorMap = {
          '私有云提拉': 'blue',
          '私有云到货': 'orange',
          '私有云借调': 'purple'
        };
        return <Tag color={colorMap[type]}>{type}</Tag>;
      }
    },
    {
      title: '总筹措数量',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount) => <span style={{ fontWeight: 'bold' }}>{amount.toLocaleString()} 核</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusConfig = {
          'expired': { color: 'green', text: '已过期' },
          'pending': { color: 'orange', text: '待验证' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '时间点详情',
      dataIndex: 'timePoints',
      key: 'timePoints',
      width: 250,
      render: (timePoints) => (
        <div>
          {timePoints.map((item, index) => (
            <div key={index} style={{ fontSize: '12px', marginBottom: '2px' }}>
              <span style={{ color: '#666' }}>{item.timePoint}</span>
              <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>
                {item.amount.toLocaleString()} 核
              </span>
            </div>
          ))}
        </div>
      )
    },
    {
      title: '负责人',
      dataIndex: 'responsible',
      key: 'responsible',
      width: 80
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />}>详情</Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleEditProcurement(record)}
            >
              修改
            </Button>
          )}
          <Button
            type="link"
            size="small"
            danger
            onClick={() => handleDeleteProcurement(record)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  const handleCreateProcurement = () => {
    setCreateModalVisible(true);
    form.resetFields();
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 处理时间点数据，格式化日期时间并计算总数量
      const timePoints = values.timePoints.map(item => ({
        timePoint: item.timePoint.format('YYYY-MM-DD HH:mm'),
        amount: item.amount
      }));

      const totalAmount = timePoints.reduce((sum, item) => sum + item.amount, 0);

      // 生成新的筹措记录，自动计算状态
      const newProcurement = {
        key: Date.now().toString(),
        type: values.type,
        responsible: values.responsible,
        description: values.description || '',
        timePoints: timePoints,
        totalAmount: totalAmount,
        status: calculateStatus(timePoints)
      };

      // 添加到数据列表
      setProcurementData(prev => [newProcurement, ...prev]);

      message.success(`资源筹措记录创建成功！共筹措 ${totalAmount.toLocaleString()} 核资源`);
      setCreateModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleCreateCancel = () => {
    setCreateModalVisible(false);
    form.resetFields();
  };

  // 修改筹措记录
  const handleEditProcurement = (record) => {
    setEditingRecord(record);
    setEditModalVisible(true);

    // 填充表单数据，使用dayjs替代moment
    const timePointsWithDayjs = record.timePoints.map(item => ({
      timePoint: dayjs(item.timePoint, 'YYYY-MM-DD HH:mm'),
      amount: item.amount
    }));

    editForm.setFieldsValue({
      type: record.type,
      responsible: record.responsible,
      description: record.description,
      timePoints: timePointsWithDayjs
    });
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();

      // 处理时间点数据，格式化日期时间并计算总数量
      const timePoints = values.timePoints.map(item => ({
        timePoint: item.timePoint.format('YYYY-MM-DD HH:mm'),
        amount: item.amount
      }));

      const totalAmount = timePoints.reduce((sum, item) => sum + item.amount, 0);

      // 更新筹措记录
      const updatedRecord = {
        ...editingRecord,
        type: values.type,
        responsible: values.responsible,
        description: values.description || '',
        timePoints: timePoints,
        totalAmount: totalAmount,
        status: calculateStatus(timePoints)
      };

      // 更新数据列表
      setProcurementData(prev =>
        prev.map(item => item.key === editingRecord.key ? updatedRecord : item)
      );

      message.success(`资源筹措记录修改成功！共筹措 ${totalAmount.toLocaleString()} 核资源`);
      setEditModalVisible(false);
      setEditingRecord(null);
      editForm.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
    setEditingRecord(null);
    editForm.resetFields();
  };

  // 删除筹措记录
  const handleDeleteProcurement = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除这条筹措记录吗？\n类型：${record.type}\n负责人：${record.responsible}\n总数量：${record.totalAmount.toLocaleString()} 核`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        setProcurementData(prev => prev.filter(item => item.key !== record.key));
        message.success('筹措记录删除成功');
      }
    });
  };

  return (
    <div className="resource-procurement-page" style={{ padding: '24px' }}>
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SettingOutlined style={{ color: '#1890ff' }} />
              资源筹措管理
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#666' }}>
              记录和管理已完成的资源筹措数据，维护筹措历史记录
            </p>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
              <span style={{ marginRight: '16px' }}>
                <Tag color="green" size="small">已过期</Tag>
                筹措时间点小于当前时间，资源已进入库存
              </span>
              <span>
                <Tag color="orange" size="small">待验证</Tag>
                筹措时间点大于当前时间，录入数据待未来交付
              </span>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateProcurement}
          >
            新建筹措记录
          </Button>
        </div>
      </Card>

      {/* 筹措列表 */}
      <Card
        title="资源筹措记录"
        extra={
          <Space>
            <Tag color="orange">待验证: {procurementData.filter(item => item.status === 'pending').length}</Tag>
            <Tag color="green">已过期: {procurementData.filter(item => item.status === 'expired').length}</Tag>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={procurementData}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
          size="middle"
        />
      </Card>

      {/* 创建筹措Modal */}
      <Modal
        title="新建资源筹措记录"
        open={createModalVisible}
        onOk={handleCreateSubmit}
        onCancel={handleCreateCancel}
        width={600}
        okText="创建"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="筹措类型"
                rules={[{ required: true, message: '请选择筹措类型' }]}
              >
                <Select placeholder="请选择筹措类型">
                  <Option value="私有云提拉">私有云提拉</Option>
                  <Option value="私有云到货">私有云到货</Option>
                  <Option value="私有云借调">私有云借调</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="responsible"
                label="负责人"
                rules={[{ required: true, message: '请输入负责人' }]}
              >
                <Input placeholder="请输入负责人姓名" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">时间点和资源数量</Divider>

          <Form.List
            name="timePoints"
            initialValue={[{ timePoint: null, amount: null }]}
            rules={[
              {
                validator: async (_, timePoints) => {
                  if (!timePoints || timePoints.length < 1) {
                    return Promise.reject(new Error('至少需要添加一个时间点'));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={16} style={{ marginBottom: 8 }}>
                    <Col span={10}>
                      <Form.Item
                        {...restField}
                        name={[name, 'timePoint']}
                        rules={[{ required: true, message: '请选择时间点' }]}
                      >
                         <DatePicker
                           showTime={{ format: 'HH:mm' }}
                           placeholder="选择时间点"
                           format="YYYY-MM-DD HH:mm"
                           style={{ width: '100%' }}
                           disabledDate={(current) => {
                             // 禁用今天及之前的日期
                             return current && current <= dayjs().endOf('day');
                           }}
                           disabledTime={(current) => {
                             const now = dayjs();
                             const today = dayjs().startOf('day');
                             const selectedDay = current ? current.startOf('day') : null;

                             // 如果选择的是今天，禁用当前时间之前的时间
                             if (selectedDay && selectedDay.isSame(today, 'day')) {
                               return {
                                 disabledHours: () => {
                                   const hours = [];
                                   for (let i = 0; i < now.hour(); i++) {
                                     hours.push(i);
                                   }
                                   return hours;
                                 },
                                 disabledMinutes: (selectedHour) => {
                                   if (selectedHour === now.hour()) {
                                     const minutes = [];
                                     for (let i = 0; i <= now.minute(); i++) {
                                       minutes.push(i);
                                     }
                                     return minutes;
                                   }
                                   return [];
                                 }
                               };
                             }
                             return {};
                           }}
                         />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item
                        {...restField}
                        name={[name, 'amount']}
                        rules={[
                          { required: true, message: '请输入资源数量' },
                          { type: 'number', min: 1, message: '资源数量必须大于0' }
                        ]}
                      >
                        <InputNumber
                          placeholder="资源数量（核）"
                          style={{ width: '100%' }}
                          min={1}
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      {fields.length > 1 && (
                        <Button
                          type="text"
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(name)}
                          style={{ marginTop: 4 }}
                        />
                      )}
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加时间点
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea
              placeholder="请输入筹措描述（可选）"
              rows={3}
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 修改筹措Modal */}
      <Modal
        title="修改资源筹措记录"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={handleEditCancel}
        width={600}
        okText="保存修改"
        cancelText="取消"
      >
        <Form
          form={editForm}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="筹措类型"
                rules={[{ required: true, message: '请选择筹措类型' }]}
              >
                <Select placeholder="请选择筹措类型">
                  <Option value="私有云提拉">私有云提拉</Option>
                  <Option value="私有云到货">私有云到货</Option>
                  <Option value="私有云借调">私有云借调</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="responsible"
                label="负责人"
                rules={[{ required: true, message: '请输入负责人' }]}
              >
                <Input placeholder="请输入负责人姓名" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">时间点和资源数量</Divider>

          <Form.List
            name="timePoints"
            rules={[
              {
                validator: async (_, timePoints) => {
                  if (!timePoints || timePoints.length < 1) {
                    return Promise.reject(new Error('至少需要添加一个时间点'));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={16} style={{ marginBottom: 8 }}>
                    <Col span={10}>
                      <Form.Item
                        {...restField}
                        name={[name, 'timePoint']}
                        rules={[{ required: true, message: '请选择时间点' }]}
                      >
                         <DatePicker
                           showTime={{ format: 'HH:mm' }}
                           placeholder="选择时间点"
                           format="YYYY-MM-DD HH:mm"
                           style={{ width: '100%' }}
                           disabledDate={(current) => {
                             // 禁用今天及之前的日期
                             return current && current <= dayjs().endOf('day');
                           }}
                           disabledTime={(current) => {
                             const now = dayjs();
                             const today = dayjs().startOf('day');
                             const selectedDay = current ? current.startOf('day') : null;

                             // 如果选择的是今天，禁用当前时间之前的时间
                             if (selectedDay && selectedDay.isSame(today, 'day')) {
                               return {
                                 disabledHours: () => {
                                   const hours = [];
                                   for (let i = 0; i < now.hour(); i++) {
                                     hours.push(i);
                                   }
                                   return hours;
                                 },
                                 disabledMinutes: (selectedHour) => {
                                   if (selectedHour === now.hour()) {
                                     const minutes = [];
                                     for (let i = 0; i <= now.minute(); i++) {
                                       minutes.push(i);
                                     }
                                     return minutes;
                                   }
                                   return [];
                                 }
                               };
                             }
                             return {};
                           }}
                         />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item
                        {...restField}
                        name={[name, 'amount']}
                        rules={[
                          { required: true, message: '请输入资源数量' },
                          { type: 'number', min: 1, message: '资源数量必须大于0' }
                        ]}
                      >
                        <InputNumber
                          placeholder="资源数量（核）"
                          style={{ width: '100%' }}
                          min={1}
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      {fields.length > 1 && (
                        <Button
                          type="text"
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(name)}
                          style={{ marginTop: 4 }}
                        />
                      )}
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加时间点
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea
              placeholder="请输入筹措描述（可选）"
              rows={3}
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ResourceProcurementPage;
