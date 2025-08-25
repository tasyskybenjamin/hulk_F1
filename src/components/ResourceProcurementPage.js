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
  Divider,
  Popconfirm,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  SettingOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
  DownOutlined,
  RightOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './ResourceProcurementPage.css';

const { Option } = Select;
const { TextArea } = Input;

const ResourceProcurementPage = () => {
  const [createPlanModalVisible, setCreatePlanModalVisible] = useState(false);
  const [editPlanModalVisible, setEditPlanModalVisible] = useState(false);
  const [addMeasureModalVisible, setAddMeasureModalVisible] = useState(false);
  const [editMeasureModalVisible, setEditMeasureModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editingMeasure, setEditingMeasure] = useState(null);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const [planForm] = Form.useForm();
  const [editPlanForm] = Form.useForm();
  const [measureForm] = Form.useForm();
  const [editMeasureForm] = Form.useForm();

  // 模拟筹措计划数据
  const [procurementPlans, setProcurementPlans] = useState([
    {
      id: '1',
      resourceGapMax: 5000,
      gapStartTime: '2024-12-25 09:00',
      gapEndTime: '2024-12-28 18:00',
      datacenter: ['BJ-DC1', 'BJ-DC2'],
      status: '筹备中',
      initiator: 'zhangsan',
      createTime: '2024-12-20 14:30',
      measures: [
        {
          id: '1-1',
          type: '私有云提拉',
          name: '黑五活动资源紧急调配',
          expectedTime: '2024-12-26 10:00',
          expectedAmount: 3000,
          actualTime: '',
          actualAmount: 0,
          status: '处理中'
        },
        {
          id: '1-2',
          type: '公有云采购',
          name: '临时扩容补充',
          expectedTime: '2024-12-27 15:00',
          expectedAmount: 2000,
          actualTime: '',
          actualAmount: 0,
          status: '处理中'
        }
      ]
    },
    {
      id: '2',
      resourceGapMax: 8000,
      gapStartTime: '2025-01-15 08:00',
      gapEndTime: '2025-01-20 20:00',
      datacenter: ['SH-DC2'],
      status: '待筹备',
      initiator: 'lisi',
      createTime: '2024-12-18 16:45',
      measures: [
        {
          id: '2-1',
          type: '私有云采购',
          name: '春节大促资源储备',
          expectedTime: '2025-01-10 12:00',
          expectedAmount: 5000,
          actualTime: '',
          actualAmount: 0,
          status: '处理中'
        },
        {
          id: '2-2',
          type: 'paas借调',
          name: '内部资源调配',
          expectedTime: '2025-01-12 14:00',
          expectedAmount: 3000,
          actualTime: '',
          actualAmount: 0,
          status: '处理中'
        }
      ]
    },
    {
      id: '3',
      resourceGapMax: 3500,
      gapStartTime: '2024-12-10 10:00',
      gapEndTime: '2024-12-15 16:00',
      datacenter: ['GZ-DC1'],
      status: '筹备完成',
      initiator: 'wangwu',
      createTime: '2024-12-05 11:20',
      measures: [
        {
          id: '3-1',
          type: '资源盘活',
          name: '闲置资源重新分配',
          expectedTime: '2024-12-08 09:00',
          expectedAmount: 2000,
          actualTime: '2024-12-08 10:30',
          actualAmount: 2200,
          status: '完成'
        },
        {
          id: '3-2',
          type: '私有云提拉',
          name: '紧急资源调配',
          expectedTime: '2024-12-09 14:00',
          expectedAmount: 1500,
          actualTime: '2024-12-09 13:45',
          actualAmount: 1300,
          status: '完成'
        }
      ]
    }
  ]);

  // 筹措类型选项
  const measureTypes = [
    { value: '私有云提拉', label: '私有云提拉', color: 'blue' },
    { value: '私有云采购', label: '私有云采购', color: 'green' },
    { value: '公有云采购', label: '公有云采购', color: 'orange' },
    { value: 'paas借调', label: 'paas借调', color: 'purple' },
    { value: '资源盘活', label: '资源盘活', color: 'cyan' }
  ];

  // 计划状态选项
  const planStatusOptions = [
    { value: '待筹备', label: '待筹备', color: 'default' },
    { value: '筹备中', label: '筹备中', color: 'processing' },
    { value: '筹备完成', label: '筹备完成', color: 'success' },
    { value: '已取消', label: '已取消', color: 'error' }
  ];

  // 举措状态选项
  const measureStatusOptions = [
    { value: '处理中', label: '处理中', color: 'processing' },
    { value: '完成', label: '完成', color: 'success' },
    { value: '取消', label: '取消', color: 'error' }
  ];

  // 机房选项
  const datacenterOptions = [
    { value: 'BJ-DC1', label: 'BJ-DC1', region: '北京' },
    { value: 'BJ-DC2', label: 'BJ-DC2', region: '北京' },
    { value: 'BJ-DC3', label: 'BJ-DC3', region: '北京' },
    { value: 'SH-DC1', label: 'SH-DC1', region: '上海' },
    { value: 'SH-DC2', label: 'SH-DC2', region: '上海' },
    { value: 'GZ-DC1', label: 'GZ-DC1', region: '广州' },
    { value: 'GZ-DC2', label: 'GZ-DC2', region: '广州' },
    { value: 'SZ-DC1', label: 'SZ-DC1', region: '深圳' },
    { value: 'HL-DC1', label: 'HL-DC1', region: '怀来' },
    { value: 'HL-DC2', label: 'HL-DC2', region: '怀来' },
    { value: 'OTHER', label: '其他', region: '其他' }
  ];

  // 主表列配置
  const mainColumns = [
    {
      title: '资源缺口最大值',
      dataIndex: 'resourceGapMax',
      key: 'resourceGapMax',
      width: 140,
      render: (value) => <span style={{ fontWeight: 'bold', color: '#f5222d' }}>{value.toLocaleString()} 核</span>
    },
    {
      title: '缺口时间段',
      key: 'gapTimeRange',
      width: 200,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div>开始：{record.gapStartTime}</div>
          <div>结束：{record.gapEndTime}</div>
        </div>
      )
    },
    {
      title: '涉及机房',
      dataIndex: 'datacenter',
      key: 'datacenter',
      width: 120,
      render: (value) => (
        <div>
          {Array.isArray(value) ? (
            value.map((dc, index) => (
              <Tag key={index} color="blue" style={{ marginBottom: '2px' }}>
                {dc}
              </Tag>
            ))
          ) : (
            <Tag color="blue">{value}</Tag>
          )}
        </div>
      )
    },
    {
      title: '计划状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const config = planStatusOptions.find(item => item.value === status);
        return <Tag color={config?.color}>{status}</Tag>;
      }
    },
    {
      title: '发起人',
      dataIndex: 'initiator',
      key: 'initiator',
      width: 80
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 140,
      render: (time) => <span style={{ fontSize: '12px' }}>{time}</span>
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditPlanStatus(record)}
          >
            修改状态
          </Button>
          <Button
            type="link"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleAddMeasure(record)}
          >
            添加举措
          </Button>
        </Space>
      )
    }
  ];

  // 子表列配置
  const subColumns = [
    {
      title: '筹措类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        const config = measureTypes.find(item => item.value === type);
        return <Tag color={config?.color}>{type}</Tag>;
      }
    },
    {
      title: '举措名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true
    },
    {
      title: '预计到位时间',
      dataIndex: 'expectedTime',
      key: 'expectedTime',
      width: 140,
      render: (time) => <span style={{ fontSize: '12px' }}>{time}</span>
    },
    {
      title: '预计量级',
      dataIndex: 'expectedAmount',
      key: 'expectedAmount',
      width: 100,
      render: (amount) => <span style={{ fontWeight: 'bold' }}>{amount.toLocaleString()} 核</span>
    },
    {
      title: '实际到位时间',
      dataIndex: 'actualTime',
      key: 'actualTime',
      width: 140,
      render: (time) => (
        <span style={{ fontSize: '12px', color: time ? '#52c41a' : '#999' }}>
          {time || '未完成'}
        </span>
      )
    },
    {
      title: '实际量级',
      dataIndex: 'actualAmount',
      key: 'actualAmount',
      width: 100,
      render: (amount) => (
        <span style={{
          fontWeight: 'bold',
          color: amount > 0 ? '#52c41a' : '#999'
        }}>
          {amount > 0 ? `${amount.toLocaleString()} 核` : '未完成'}
        </span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => {
        const config = measureStatusOptions.find(item => item.value === status);
        return <Tag color={config?.color}>{status}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleEditMeasure(record)}
          >
            修改信息
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这条筹措举措吗？"
            onConfirm={() => handleDeleteMeasure(record)}
            okText="确认删除"
            cancelText="取消"
          >
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 展开行渲染
  const expandedRowRender = (record) => {
    return (
      <Table
        columns={subColumns}
        dataSource={record.measures}
        pagination={false}
        size="small"
        rowKey="id"
        style={{ margin: '0 48px' }}
      />
    );
  };

  // 处理展开/收起
  const handleExpand = (expanded, record) => {
    const keys = expanded
      ? [...expandedRowKeys, record.id]
      : expandedRowKeys.filter(key => key !== record.id);
    setExpandedRowKeys(keys);
  };

  // 模拟需求数据API
  const getDemandData = (startTime, endTime) => {
    // 模拟根据时间范围获取需求数据
    const mockDemandData = [
      { time: '2024-12-25 09:00', datacenter: 'BJ-DC1', demand: 2000 },
      { time: '2024-12-25 12:00', datacenter: 'BJ-DC2', demand: 1500 },
      { time: '2024-12-26 10:00', datacenter: 'BJ-DC1', demand: 3000 },
      { time: '2024-12-27 15:00', datacenter: 'SH-DC1', demand: 2500 },
      { time: '2025-01-15 08:00', datacenter: 'SH-DC2', demand: 4000 },
      { time: '2025-01-16 14:00', datacenter: 'GZ-DC1', demand: 1800 }
    ];

    return mockDemandData.filter(item => {
      const itemTime = dayjs(item.time);
      return itemTime.isAfter(dayjs(startTime)) && itemTime.isBefore(dayjs(endTime));
    });
  };

  // 模拟库存数据API
  const getInventoryData = (startTime, endTime) => {
    // 模拟根据时间范围获取库存数据
    const mockInventoryData = [
      { time: '2024-12-25 09:00', datacenter: 'BJ-DC1', inventory: 800 },
      { time: '2024-12-25 12:00', datacenter: 'BJ-DC2', inventory: 600 },
      { time: '2024-12-26 10:00', datacenter: 'BJ-DC1', inventory: 1200 },
      { time: '2024-12-27 15:00', datacenter: 'SH-DC1', inventory: 1000 },
      { time: '2025-01-15 08:00', datacenter: 'SH-DC2', inventory: 1500 },
      { time: '2025-01-16 14:00', datacenter: 'GZ-DC1', inventory: 900 }
    ];

    return mockInventoryData.filter(item => {
      const itemTime = dayjs(item.time);
      return itemTime.isAfter(dayjs(startTime)) && itemTime.isBefore(dayjs(endTime));
    });
  };

  // 获取现有筹措举措数据
  const getExistingMeasures = (startTime, endTime) => {
    const allMeasures = procurementPlans.flatMap(plan =>
      plan.measures.map(measure => ({
        ...measure,
        datacenter: plan.datacenter
      }))
    );

    return allMeasures.filter(measure => {
      const measureTime = dayjs(measure.expectedTime);
      return measureTime.isAfter(dayjs(startTime)) && measureTime.isBefore(dayjs(endTime));
    });
  };

  // 自动计算资源缺口和涉及机房
  const calculateResourceGap = (startTime, endTime) => {
    const demandData = getDemandData(startTime, endTime);
    const inventoryData = getInventoryData(startTime, endTime);
    const existingMeasures = getExistingMeasures(startTime, endTime);

    // 按机房分组计算
    const datacenterStats = {};

    // 统计需求量
    demandData.forEach(item => {
      if (!datacenterStats[item.datacenter]) {
        datacenterStats[item.datacenter] = { demand: 0, inventory: 0, measures: 0 };
      }
      datacenterStats[item.datacenter].demand += item.demand;
    });

    // 统计库存量
    inventoryData.forEach(item => {
      if (!datacenterStats[item.datacenter]) {
        datacenterStats[item.datacenter] = { demand: 0, inventory: 0, measures: 0 };
      }
      datacenterStats[item.datacenter].inventory += item.inventory;
    });

    // 统计现有筹措举措
    existingMeasures.forEach(measure => {
      const datacenters = Array.isArray(measure.datacenter) ? measure.datacenter : [measure.datacenter];
      datacenters.forEach(dc => {
        if (!datacenterStats[dc]) {
          datacenterStats[dc] = { demand: 0, inventory: 0, measures: 0 };
        }
        datacenterStats[dc].measures += measure.expectedAmount;
      });
    });

    // 计算各机房缺口
    const gaps = {};
    let maxGap = 0;
    const involvedDatacenters = [];

    Object.keys(datacenterStats).forEach(datacenter => {
      const stats = datacenterStats[datacenter];
      const gap = stats.demand - stats.inventory - stats.measures;

      if (gap > 0) {
        gaps[datacenter] = gap;
        maxGap += gap;
        involvedDatacenters.push(datacenter);
      }
    });

    return {
      resourceGapMax: maxGap,
      involvedDatacenters: involvedDatacenters,
      datacenterGaps: gaps
    };
  };

  // 创建筹措计划
  const handleCreatePlan = () => {
    setCreatePlanModalVisible(true);
    planForm.resetFields();
  };

  const handleCreatePlanSubmit = async () => {
    try {
      const values = await planForm.validateFields();

      const startTime = values.gapStartTime.format('YYYY-MM-DD HH:mm');
      const endTime = values.gapEndTime.format('YYYY-MM-DD HH:mm');

      // 自动计算资源缺口和涉及机房
      const calculation = calculateResourceGap(startTime, endTime);

      if (calculation.resourceGapMax <= 0) {
        message.warning('该时间段内无资源缺口，无需创建筹措计划！');
        return;
      }

      const newPlan = {
        id: Date.now().toString(),
        resourceGapMax: calculation.resourceGapMax,
        gapStartTime: startTime,
        gapEndTime: endTime,
        datacenter: calculation.involvedDatacenters,
        status: '待完善',
        initiator: 'system',
        createTime: dayjs().format('YYYY-MM-DD HH:mm'),
        measures: [],
        datacenterGaps: calculation.datacenterGaps // 保存各机房的缺口详情
      };

      setProcurementPlans(prev => [newPlan, ...prev]);

      message.success(
        `筹措计划创建成功！\n` +
        `资源缺口最大值：${calculation.resourceGapMax.toLocaleString()} 核\n` +
        `涉及机房：${calculation.involvedDatacenters.join(', ')}`
      );

      setCreatePlanModalVisible(false);
      planForm.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 修改计划状态
  const handleEditPlanStatus = (record) => {
    setEditingPlan(record);
    setEditPlanModalVisible(true);
    editPlanForm.setFieldsValue({
      status: record.status
    });
  };

  const handleEditPlanStatusSubmit = async () => {
    try {
      const values = await editPlanForm.validateFields();

      setProcurementPlans(prev =>
        prev.map(plan =>
          plan.id === editingPlan.id
            ? { ...plan, status: values.status }
            : plan
        )
      );

      message.success('计划状态修改成功！');
      setEditPlanModalVisible(false);
      setEditingPlan(null);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 添加筹措举措
  const handleAddMeasure = (plan) => {
    setCurrentPlanId(plan.id);
    setAddMeasureModalVisible(true);
    measureForm.resetFields();
  };

  const handleAddMeasureSubmit = async () => {
    try {
      const values = await measureForm.validateFields();

      const newMeasure = {
        id: `${currentPlanId}-${Date.now()}`,
        type: values.type,
        name: values.name,
        expectedTime: values.expectedTime.format('YYYY-MM-DD HH:mm'),
        expectedAmount: values.expectedAmount,
        actualTime: values.actualTime ? values.actualTime.format('YYYY-MM-DD HH:mm') : '',
        actualAmount: values.actualAmount || 0,
        status: values.status
      };

      setProcurementPlans(prev =>
        prev.map(plan =>
          plan.id === currentPlanId
            ? { ...plan, measures: [...plan.measures, newMeasure] }
            : plan
        )
      );

      message.success('筹措举措添加成功！');
      setAddMeasureModalVisible(false);
      setCurrentPlanId(null);
      measureForm.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 修改筹措举措
  const handleEditMeasure = (measure) => {
    setEditingMeasure(measure);
    setEditMeasureModalVisible(true);

    editMeasureForm.setFieldsValue({
      type: measure.type,
      name: measure.name,
      expectedTime: dayjs(measure.expectedTime, 'YYYY-MM-DD HH:mm'),
      expectedAmount: measure.expectedAmount,
      actualTime: measure.actualTime ? dayjs(measure.actualTime, 'YYYY-MM-DD HH:mm') : null,
      actualAmount: measure.actualAmount,
      status: measure.status
    });
  };

  const handleEditMeasureSubmit = async () => {
    try {
      const values = await editMeasureForm.validateFields();

      setProcurementPlans(prev =>
        prev.map(plan => ({
          ...plan,
          measures: plan.measures.map(measure =>
            measure.id === editingMeasure.id
              ? {
                  ...measure,
                  type: values.type,
                  name: values.name,
                  expectedTime: values.expectedTime.format('YYYY-MM-DD HH:mm'),
                  expectedAmount: values.expectedAmount,
                  actualTime: values.actualTime ? values.actualTime.format('YYYY-MM-DD HH:mm') : '',
                  actualAmount: values.actualAmount || 0,
                  status: values.status
                }
              : measure
          )
        }))
      );

      message.success('筹措举措修改成功！');
      setEditMeasureModalVisible(false);
      setEditingMeasure(null);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 删除筹措举措
  const handleDeleteMeasure = (measure) => {
    setProcurementPlans(prev =>
      prev.map(plan => ({
        ...plan,
        measures: plan.measures.filter(m => m.id !== measure.id)
      }))
    );
    message.success('筹措举措删除成功！');
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
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreatePlan}
          >
            添加筹措计划
          </Button>
        </div>
      </Card>

      {/* 筹措计划列表 */}
      <Card title="筹措计划列表">
        <Table
          columns={mainColumns}
          dataSource={procurementPlans}
          rowKey="id"
          expandable={{
            expandedRowRender,
            expandedRowKeys,
            onExpand: handleExpand,
            expandIcon: ({ expanded, onExpand, record }) => (
              <Button
                type="text"
                size="small"
                icon={expanded ? <DownOutlined /> : <RightOutlined />}
                onClick={e => onExpand(record, e)}
              />
            )
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
          size="middle"
        />
      </Card>

      {/* 创建筹措计划Modal */}
      <Modal
        title="添加筹措计划"
        open={createPlanModalVisible}
        onOk={handleCreatePlanSubmit}
        onCancel={() => setCreatePlanModalVisible(false)}
        width={600}
        okText="创建"
        cancelText="取消"
      >
        <Form form={planForm} layout="vertical" style={{ marginTop: 16 }}>
          <div style={{
            backgroundColor: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '14px', color: '#52c41a', marginBottom: '4px' }}>
              📊 自动计算说明
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              • 资源缺口最大值 = 时间范围内全部需求量 - 全部库存量 - 现有筹措举措预计量级<br/>
              • 涉及机房将根据计算结果自动确定（英文缩写）<br/>
              • 计划状态默认为"待完善"
            </div>
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gapStartTime"
                label="资源缺口开始时间"
                rules={[{ required: true, message: '请选择开始时间' }]}
              >
                <DatePicker
                  showTime={{ format: 'HH:mm' }}
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: '100%' }}
                  placeholder="选择开始时间"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gapEndTime"
                label="资源缺口结束时间"
                rules={[{ required: true, message: '请选择结束时间' }]}
              >
                <DatePicker
                  showTime={{ format: 'HH:mm' }}
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: '100%' }}
                  placeholder="选择结束时间"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 修改计划状态Modal */}
      <Modal
        title="修改计划状态"
        open={editPlanModalVisible}
        onOk={handleEditPlanStatusSubmit}
        onCancel={() => setEditPlanModalVisible(false)}
        width={400}
        okText="保存"
        cancelText="取消"
      >
        <Form form={editPlanForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="status"
            label="计划状态"
            rules={[{ required: true, message: '请选择计划状态' }]}
          >
            <Select>
              {planStatusOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加筹措举措Modal */}
      <Modal
        title="添加筹措举措"
        open={addMeasureModalVisible}
        onOk={handleAddMeasureSubmit}
        onCancel={() => setAddMeasureModalVisible(false)}
        width={600}
        okText="添加"
        cancelText="取消"
      >
        <Form form={measureForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="筹措类型"
                rules={[{ required: true, message: '请选择筹措类型' }]}
              >
                <Select>
                  {measureTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
                initialValue="处理中"
              >
                <Select>
                  {measureStatusOptions.map(status => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="name"
            label="筹备举措名称"
            rules={[
              { required: true, message: '请输入举措名称' },
              { max: 20, message: '名称不能超过20个字符' }
            ]}
          >
            <Input placeholder="请输入举措名称（不超过20字符）" maxLength={20} showCount />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="expectedTime"
                label="预计资源到位时间"
                rules={[{ required: true, message: '请选择预计到位时间' }]}
              >
                <DatePicker
                  showTime={{ format: 'HH:mm' }}
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expectedAmount"
                label="预计资源筹备量级（核）"
                rules={[{ required: true, message: '请输入预计筹备量级' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="actualTime"
                label="实际资源到位时间"
              >
                <DatePicker
                  showTime={{ format: 'HH:mm' }}
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="actualAmount"
                label="实际资源筹备量级（核）"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 修改筹措举措Modal */}
      <Modal
        title="修改筹措举措信息"
        open={editMeasureModalVisible}
        onOk={handleEditMeasureSubmit}
        onCancel={() => setEditMeasureModalVisible(false)}
        width={600}
        okText="保存修改"
        cancelText="取消"
      >
        <Form form={editMeasureForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="筹措类型"
                rules={[{ required: true, message: '请选择筹措类型' }]}
              >
                <Select>
                  {measureTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select>
                  {measureStatusOptions.map(status => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="name"
            label="筹备举措名称"
            rules={[
              { required: true, message: '请输入举措名称' },
              { max: 20, message: '名称不能超过20个字符' }
            ]}
          >
            <Input placeholder="请输入举措名称（不超过20字符）" maxLength={20} showCount />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="expectedTime"
                label="预计资源到位时间"
                rules={[{ required: true, message: '请选择预计到位时间' }]}
              >
                <DatePicker
                  showTime={{ format: 'HH:mm' }}
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expectedAmount"
                label="预计资源筹备量级（核）"
                rules={[{ required: true, message: '请输入预计筹备量级' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="actualTime"
                label="实际资源到位时间"
              >
                <DatePicker
                  showTime={{ format: 'HH:mm' }}
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="actualAmount"
                label="实际资源筹备量级（核）"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default ResourceProcurementPage;
