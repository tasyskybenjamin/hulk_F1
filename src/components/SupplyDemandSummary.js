import React from 'react';
import { Card, Row, Col, Statistic, Alert, Tag } from 'antd';
import { WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const SupplyDemandSummary = ({ data, dateRange }) => {
  if (!data || !data.datasets) {
    return null;
  }

  // 计算汇总数据
  const calculateSummary = () => {
    const inventory = data.datasets.find(d => d.key === 'inventory');
    const totalDemand = data.datasets.find(d => d.key === 'totalDemand');
    const pendingDemand = data.datasets.find(d => d.key === 'pendingDemand');
    const confirmedDemand = data.datasets.find(d => d.key === 'confirmedDemand');

    if (!inventory || !totalDemand) return null;

    // 找到当前时间点的索引
    const today = new Date().toISOString().split('T')[0];
    const todayIndex = data.labels.findIndex(label => label === today);

    // 计算需求相关数据
    const totalDemandSum = totalDemand.data.reduce((sum, point) => sum + point.value, 0);
    const peakDemand = Math.max(...totalDemand.data.map(point => point.value));
    const peakDemandIndex = totalDemand.data.findIndex(point => point.value === peakDemand);
    const peakDemandDate = data.labels[peakDemandIndex];

    // 状态分布（模拟数据）
    const pendingSum = pendingDemand.data.reduce((sum, point) => sum + point.value, 0);
    const confirmedSum = confirmedDemand.data.reduce((sum, point) => sum + point.value, 0);
    const deliveredSum = Math.round(totalDemandSum * 0.6); // 模拟已交付
    const recycledSum = Math.round(totalDemandSum * 0.1); // 模拟已回收
    const rejectedSum = Math.round(totalDemandSum * 0.05); // 模拟驳回

    // 渠道分布（模拟数据）
    const dailyDemand = Math.round(totalDemandSum * 0.4);
    const activityDemand = Math.round(totalDemandSum * 0.3);
    const emergencyDemand = Math.round(totalDemandSum * 0.15);
    const specialDemand = Math.round(totalDemandSum * 0.1);
    const poolDemand = Math.round(totalDemandSum * 0.05);

    // 库存相关数据
    const peakInventory = inventory.data[peakDemandIndex]?.value || 0;
    const inventoryStatus = peakInventory >= peakDemand ? 'sufficient' :
                           peakInventory >= peakDemand * 0.8 ? 'adequate' : 'insufficient';

    // 可使用库存分解（模拟数据）
    const quotaRemaining = Math.round(peakInventory * 0.4);
    const privateCloudPull = Math.round(peakInventory * 0.25);
    const normalArrival = Math.round(peakInventory * 0.2);
    const resourceBorrow = Math.round(peakInventory * 0.15);

    // 计算资源缺口
    const gaps = [];
    inventory.data.forEach((invPoint, index) => {
      const demandPoint = totalDemand.data[index];
      const gap = Math.max(0, demandPoint.value - invPoint.value);
      if (gap > 0) {
        gaps.push({
          gap,
          date: data.labels[index],
          isPast: todayIndex === -1 || index <= todayIndex
        });
      }
    });

    const currentGap = todayIndex !== -1 && gaps.find(g => g.date === data.labels[todayIndex]);
    const maxGap = gaps.length > 0 ? gaps.reduce((max, current) =>
      current.gap > max.gap ? current : max
    ) : null;

    return {
      // 需求数据
      totalDemandSum,
      peakDemand,
      peakDemandDate,
      statusDistribution: {
        pending: pendingSum,
        confirmed: confirmedSum,
        delivered: deliveredSum,
        recycled: recycledSum,
        rejected: rejectedSum
      },
      channelDistribution: {
        daily: dailyDemand,
        activity: activityDemand,
        emergency: emergencyDemand,
        special: specialDemand,
        pool: poolDemand
      },
      // 库存数据
      peakInventory,
      inventoryStatus,
      availableInventory: {
        quota: quotaRemaining,
        privateCloudPull: privateCloudPull,
        normalArrival: normalArrival,
        resourceBorrow: resourceBorrow,
        total: quotaRemaining + privateCloudPull + normalArrival + resourceBorrow
      },
      // 缺口数据
      currentGap: currentGap?.gap || 0,
      currentGapDate: currentGap?.date,
      maxGap: maxGap?.gap || 0,
      maxGapDate: maxGap?.date,
      hasGap: gaps.length > 0
    };
  };

  const summary = calculateSummary();
  if (!summary) return null;

  const formatDate = (dateStr) => {
    return dayjs(dateStr).format('YYYY年MM月DD日');
  };

  const getInventoryStatusText = (status) => {
    switch (status) {
      case 'sufficient': return '大于需求峰值';
      case 'adequate': return '接近需求峰值';
      case 'insufficient': return '小于需求峰值';
      default: return '未知';
    }
  };

  const getInventoryStatusColor = (status) => {
    switch (status) {
      case 'sufficient': return 'success';
      case 'adequate': return 'warning';
      case 'insufficient': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📊 选择时间范围内资源汇总说明</span>
        </div>
      }
      className="supply-demand-summary"
      style={{ marginBottom: 16 }}
    >
      {/* 时间范围 */}
      <div style={{ marginBottom: 16, color: '#666', fontSize: '14px' }}>
        时间范围：{dateRange ? `${dateRange[0].format('YYYY-MM-DD')} 至 ${dateRange[1].format('YYYY-MM-DD')}` : '过去1个月 + 未来1个月'}
      </div>

      <Row gutter={[24, 16]}>
        {/* 需求汇总 */}
        <Col xs={24} lg={12}>
          <div style={{ background: '#fff7e6', padding: '16px', borderRadius: '8px', border: '1px solid #ffd591' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <WarningOutlined style={{ color: '#fa8c16' }} />
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>需求：共 {summary.totalDemandSum.toLocaleString()} 核</span>
            </div>

            <div style={{ marginBottom: '8px' }}>
              峰值时刻需求 <span style={{ color: '#fa8c16', fontWeight: 'bold' }}>{summary.peakDemand.toLocaleString()} 核</span>，
              时间：{formatDate(summary.peakDemandDate)}
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>状态分布：</div>
              <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                待评估 <span style={{ color: '#faad14' }}>{summary.statusDistribution.pending.toLocaleString()} 核</span>、
                确认待交付 <span style={{ color: '#f5222d' }}>{summary.statusDistribution.confirmed.toLocaleString()} 核</span>、
                已交付 <span style={{ color: '#52c41a' }}>{summary.statusDistribution.delivered.toLocaleString()} 核</span>、
                已回收 <span style={{ color: '#1890ff' }}>{summary.statusDistribution.recycled.toLocaleString()} 核</span>、
                驳回 <span style={{ color: '#d9d9d9' }}>{summary.statusDistribution.rejected.toLocaleString()} 核</span>（不算入需求总量）
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>渠道分布：</div>
              <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                日常 <span style={{ color: '#1890ff' }}>{summary.channelDistribution.daily.toLocaleString()} 核</span>、
                活动 <span style={{ color: '#fa541c' }}>{summary.channelDistribution.activity.toLocaleString()} 核</span>、
                应急 <span style={{ color: '#f5222d' }}>{summary.channelDistribution.emergency.toLocaleString()} 核</span>、
                专项 <span style={{ color: '#722ed1' }}>{summary.channelDistribution.special.toLocaleString()} 核</span>、
                资源池 <span style={{ color: '#13c2c2' }}>{summary.channelDistribution.pool.toLocaleString()} 核</span>
              </div>
            </div>
          </div>
        </Col>

        {/* 库存汇总 */}
        <Col xs={24} lg={12}>
          <div style={{ background: '#f6ffed', padding: '16px', borderRadius: '8px', border: '1px solid #b7eb8f' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>库存：需求峰值时库存 {summary.peakInventory.toLocaleString()} 核</span>
              <Tag color={getInventoryStatusColor(summary.inventoryStatus)}>
                {getInventoryStatusText(summary.inventoryStatus)}
              </Tag>
            </div>

            <div style={{ marginBottom: '12px' }}>
              可使用库存约为：<span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                {summary.availableInventory.total.toLocaleString()} 核
              </span>
            </div>

            <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
              <div>【可用库存】配额余量 - <span style={{ color: '#52c41a' }}>{summary.availableInventory.quota.toLocaleString()} 核</span></div>
              <div>【资源筹备】私有云提拉 - <span style={{ color: '#1890ff' }}>{summary.availableInventory.privateCloudPull.toLocaleString()} 核</span></div>
              <div>【正常到货】私有云到货 - <span style={{ color: '#fa8c16' }}>{summary.availableInventory.normalArrival.toLocaleString()} 核</span></div>
              <div>【资源筹措】私有云借调 - <span style={{ color: '#722ed1' }}>{summary.availableInventory.resourceBorrow.toLocaleString()} 核</span></div>
            </div>
          </div>
        </Col>
      </Row>

      {/* 缺口提示 */}
      <div style={{ marginTop: '16px' }}>
        {summary.hasGap ? (
          <Alert
            message="资源缺口预警"
            description={
              <div>
                <div style={{ marginBottom: '8px' }}>
                  时间范围内存在资源缺口，最大资源缺口：<span style={{ color: '#f5222d', fontWeight: 'bold' }}>{summary.maxGap.toLocaleString()} 核</span>，
                  时间：{formatDate(summary.maxGapDate)}
                </div>
                {summary.currentGap > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    最近资源缺口：<span style={{ color: '#f5222d', fontWeight: 'bold' }}>{summary.currentGap.toLocaleString()} 核</span>，
                    时间：{formatDate(summary.currentGapDate)}
                  </div>
                )}
                <div style={{ color: '#f5222d' }}>
                  请 Hulk 资源运营及时进行资源筹备
                </div>
              </div>
            }
            type="warning"
            showIcon
          />
        ) : (
          <Alert
            message="资源供给充足"
            description="当前时间范围内无资源缺口，资源供给充足"
            type="success"
            showIcon
          />
        )}
      </div>
    </Card>
  );
};

export default SupplyDemandSummary;
