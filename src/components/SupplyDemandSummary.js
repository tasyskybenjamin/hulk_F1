import React from 'react';
import { Card, Row, Col, Statistic, Alert, Tag, Button } from 'antd';
import { WarningOutlined, CheckCircleOutlined, SettingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const SupplyDemandSummary = ({ data, filters, onNavigateToResourceProcurement }) => {
  if (!data || !data.datasets) {
    return null;
  }

  // 跳转到资源筹措页面
  const handleGoToProcurement = () => {
    if (onNavigateToResourceProcurement) {
      onNavigateToResourceProcurement();
    }
  };

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
    const currentInventory = inventory.data[todayIndex]?.value || peakInventory;
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
      currentInventory,
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

  const formatPeakTime = (dateStr) => {
    // 为峰值时刻生成随机的小时和分钟
    const date = dayjs(dateStr);
    const randomHour = Math.floor(Math.random() * 24);
    const randomMinute = Math.floor(Math.random() * 60);
    return date.hour(randomHour).minute(randomMinute).format('YYYY年MM月DD日HH点mm分');
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
      {/* 筛选条件的时间范围 */}
      <div style={{ marginBottom: 20, color: '#666', fontSize: '14px' }}>
        时间范围：{filters?.dateRange ? `${filters.dateRange[0].format('YYYY-MM-DD')} 至 ${filters.dateRange[1].format('YYYY-MM-DD')}` : '2025-07-20 至 2025-09-20'}
      </div>

      {/* 上半部分：左右两栏布局 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {/* 左侧：需求信息 */}
        <Col span={12}>
          <div style={{
            backgroundColor: '#fff7e6',
            border: '1px solid #ffd591',
            borderRadius: '6px',
            padding: '16px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              color: '#fa8c16',
              fontSize: '16px'
            }}>
              ⚠️
            </div>
            <div style={{ marginLeft: '24px' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#d46b08' }}>
                需求：共 {summary.totalDemandSum.toLocaleString()} 核，峰值时刻为：{formatPeakTime(summary.peakDemandDate)}，需求为 {summary.peakDemand.toLocaleString()} 核
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#595959' }}>
                  状态分布：
                </div>
                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  待评估 <span style={{ color: '#fa8c16', fontWeight: 'bold' }}>{summary.statusDistribution.pending.toLocaleString()} 核</span>、
                  确认待交付 <span style={{ color: '#f5222d', fontWeight: 'bold' }}>{summary.statusDistribution.confirmed.toLocaleString()} 核</span>、
                  已交付 <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{summary.statusDistribution.delivered.toLocaleString()} 核</span>、
                  已回收 <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{summary.statusDistribution.recycled.toLocaleString()} 核</span>、
                  驳回 <span style={{ color: '#8c8c8c', fontWeight: 'bold' }}>{summary.statusDistribution.rejected.toLocaleString()} 核</span>（不算入需求总量）
                </div>
              </div>

              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#595959' }}>
                  渠道分布：
                </div>
                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  日常 <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{summary.channelDistribution.daily.toLocaleString()} 核</span>、
                  活动 <span style={{ color: '#fa541c', fontWeight: 'bold' }}>{summary.channelDistribution.activity.toLocaleString()} 核</span>、
                  应急 <span style={{ color: '#f5222d', fontWeight: 'bold' }}>{summary.channelDistribution.emergency.toLocaleString()} 核</span>、
                  专项 <span style={{ color: '#722ed1', fontWeight: 'bold' }}>{summary.channelDistribution.special.toLocaleString()} 核</span>、
                  资源池 <span style={{ color: '#13c2c2', fontWeight: 'bold' }}>{summary.channelDistribution.pool.toLocaleString()} 核</span>
                </div>
              </div>
            </div>
          </div>
        </Col>

        {/* 右侧：库存信息 */}
        <Col span={12}>
          <div style={{
            backgroundColor: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: '6px',
            padding: '16px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              color: '#52c41a',
              fontSize: '16px'
            }}>
              ✅
            </div>
            <div style={{ marginLeft: '24px' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#389e0d' }}>
                库存：当前可用库存 {summary.availableInventory.total.toLocaleString()} 核 需求峰值时库存 {summary.peakInventory.toLocaleString()} 核
                <span style={{
                  fontSize: '12px',
                  color: '#fa8c16',
                  marginLeft: '8px',
                  backgroundColor: '#fff7e6',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  border: '1px solid #ffd591'
                }}>
                  小于需求峰值
                </span>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', marginBottom: '8px', color: '#52c41a', fontWeight: 'bold' }}>
                  可使用库存约为：{summary.availableInventory.total.toLocaleString()} 核
                </div>
              </div>

              <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                <div>
                  <span style={{ color: '#595959', fontWeight: 'bold' }}>【可用库存】</span>
                  配额余量：<span style={{ color: '#52c41a', fontWeight: 'bold' }}>{summary.availableInventory.quota.toLocaleString()} 核</span>
                </div>
                <div>
                  <span style={{ color: '#595959', fontWeight: 'bold' }}>【正常供给】</span>
                  私有云到货：<span style={{ color: '#fa8c16', fontWeight: 'bold' }}>{summary.availableInventory.normalArrival.toLocaleString()} 核</span>
                </div>
                <div>
                  <span style={{ color: '#595959', fontWeight: 'bold' }}>【资源筹备】</span>
                  私有云提拉：<span style={{ color: '#1890ff', fontWeight: 'bold' }}>{summary.availableInventory.privateCloudPull.toLocaleString()} 核</span>
                </div>
                <div>
                  <span style={{ color: '#595959', fontWeight: 'bold' }}>【资源筹措】</span>
                  私有云借调：<span style={{ color: '#722ed1', fontWeight: 'bold' }}>{summary.availableInventory.resourceBorrow.toLocaleString()} 核</span>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* 下半部分：资源缺口预警 */}
      {summary.hasGap ? (
        <div style={{
          backgroundColor: '#fff7e6',
          border: '1px solid #ffd591',
          borderRadius: '6px',
          padding: '16px',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            color: '#fa8c16',
            fontSize: '16px'
          }}>
            ⚠️
          </div>
          <div style={{ marginLeft: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#d46b08' }}>
                资源缺口预警
              </span>
              <Button
                type="primary"
                size="small"
                icon={<SettingOutlined />}
                onClick={handleGoToProcurement}
                style={{
                  backgroundColor: '#f5222d',
                  borderColor: '#f5222d',
                  boxShadow: '0 2px 4px rgba(245, 34, 45, 0.3)'
                }}
              >
                资源筹措
              </Button>
            </div>
            <div style={{ fontSize: '14px', color: '#d46b08', lineHeight: '1.6' }}>
              时间范围内存在资源缺口，最大资源缺口：<span style={{ fontWeight: 'bold', color: '#f5222d' }}>{summary.maxGap.toLocaleString()} 核</span>，
              时间：{formatDate(summary.maxGapDate)}
            </div>
            <div style={{ fontSize: '14px', color: '#f5222d', marginTop: '4px' }}>
              请 Hulk 资源运营及时进行资源筹备
            </div>
          </div>
        </div>
      ) : (
        <Alert
          message="资源供给充足"
          description="当前时间范围内无资源缺口，资源供给充足"
          type="success"
          showIcon
        />
      )}
    </Card>
  );
};

export default SupplyDemandSummary;
