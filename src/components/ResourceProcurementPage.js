import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Space,
  Statistic,
  Progress,
  Tabs,
  Alert
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const ResourceProcurementPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ongoing');

  // 模拟资源筹措数据
  const procurementData = {
    ongoing: [
      {
        key: '1',
        id: 'RP-2024-001',
        type: '私有云提拉',
        amount: 5000,
        progress: 75,
        status: 'processing',
        expectedDate: '2024-12-25',
        responsible: '张三',
        description: '双十二活动资源筹措'
      },
      {
        key: '2',
        id: 'RP-2024-002',
        type: '私有云到货',
        amount: 3000,
        progress: 45,
        status: 'processing',
        expectedDate: '2024-12-30',
        responsible: '李四',
        description: '年终大促资源补充'
      },
      {
        key: '3',
        id: 'RP-2024-003',
        type: '私有云借调',
        amount: 2000,
        progress: 90,
        status: 'processing',
        expectedDate: '2024-12-22',
        responsible: '王五',
        description: '紧急需求资源调配'
      }
    ],
    completed: [
      {
        key: '4',
        id: 'RP-2024-004',
        type: '私有云提拉',
        amount: 4500,
        progress: 100,
        status: 'success',
        expectedDate: '2024-12-15',
        responsible: '赵六',
        description: '黑五活动资源筹措'
      },
      {
        key: '5',
        id: 'RP-2024-005',
        type: '私有云到货',
        amount: 2800,
        progress: 100,
        status: 'success',
        expectedDate: '2024-12-10',
        responsible: '钱七',
        description: '常规资源补充'
      }
    ]
  };

  const columns = [
    {
      title: '筹措ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text) => <span style={{ fontFamily: 'monospace', color: '#1890ff' }}>{text}</span>
    },
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
      title: '筹措数量',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (amount) => <span style={{ fontWeight: 'bold' }}>{amount.toLocaleString()} 核</span>
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (progress, record) => (
        <Progress
          percent={progress}
          size="small"
          status={record.status === 'success' ? 'success' : 'active'}
        />
      )
    },
    {
      title: '预计完成时间',
      dataIndex: 'expectedDate',
      key: 'expectedDate',
      width: 120
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
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small">详情</Button>
          {record.status === 'processing' && (
            <Button type="link" size="small">编辑</Button>
          )}
        </Space>
      )
    }
  ];

  const handleBack = () => {
    navigate('/supply-demand-matching');
  };

  const handleCreateProcurement = () => {
    // 这里可以打开创建资源筹措的弹窗或跳转到创建页面
    console.log('创建资源筹措');
  };

  // 计算统计数据
  const ongoingTotal = procurementData.ongoing.reduce((sum, item) => sum + item.amount, 0);
  const completedTotal = procurementData.completed.reduce((sum, item) => sum + item.amount, 0);
  const totalAmount = ongoingTotal + completedTotal;

  return (
    <div className="resource-procurement-page" style={{ padding: '24px' }}>
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              type="text"
            >
              返回供需匹配
            </Button>
            <div>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SettingOutlined style={{ color: '#1890ff' }} />
                资源筹措管理
              </h2>
              <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                管理和跟踪资源筹措进度，确保资源供给充足
              </p>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateProcurement}
          >
            新建筹措
          </Button>
        </div>
      </Card>

      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总筹措量"
              value={totalAmount}
              suffix="核"
              valueStyle={{ color: '#1890ff' }}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="进行中筹措"
              value={ongoingTotal}
              suffix="核"
              valueStyle={{ color: '#faad14' }}
              prefix={<CloudServerOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="已完成筹措"
              value={completedTotal}
              suffix="核"
              valueStyle={{ color: '#52c41a' }}
              prefix={<SettingOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 筹措列表 */}
      <Card
        title="资源筹措列表"
        extra={
          <Space>
            <Tag color="processing">进行中: {procurementData.ongoing.length}</Tag>
            <Tag color="success">已完成: {procurementData.completed.length}</Tag>
          </Space>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'ongoing',
              label: `进行中 (${procurementData.ongoing.length})`,
              children: (
                <div>
                  <Alert
                    message="进行中的资源筹措"
                    description="以下是当前正在进行的资源筹措项目，请及时跟踪进度确保按时完成。"
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <Table
                    columns={columns}
                    dataSource={procurementData.ongoing}
                    pagination={false}
                    size="middle"
                  />
                </div>
              )
            },
            {
              key: 'completed',
              label: `已完成 (${procurementData.completed.length})`,
              children: (
                <div>
                  <Alert
                    message="已完成的资源筹措"
                    description="以下是已经完成的资源筹措项目，资源已成功交付。"
                    type="success"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <Table
                    columns={columns}
                    dataSource={procurementData.completed}
                    pagination={false}
                    size="middle"
                  />
                </div>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default ResourceProcurementPage;
