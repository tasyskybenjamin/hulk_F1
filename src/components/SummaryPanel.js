import React from 'react';
import { Card, Row, Col, Divider, Alert, Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import DemandTrendChart from './DemandTrendChart';
import InventoryTrendChart from './InventoryTrendChart';
import './SummaryPanel.css';

const SummaryPanel = ({ summary, filters, onNavigateToResourceProcurement, demandTrendData, inventoryTrendData }) => {
  if (!summary) {
    return null;
  }

  // 格式化数字，添加千分位分隔符
  const formatNumber = (num) => {
    return Math.round(num).toLocaleString();
  };

  // 获取时间范围描述
  const getTimeRangeText = () => {
    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      return `${filters.dateRange[0].format('YYYY-MM-DD')} 至 ${filters.dateRange[1].format('YYYY-MM-DD')}`;
    }
    return '默认时间范围（24小时）';
  };

  // 生成资源缺口描述
  const getResourceGapText = () => {
    if (summary.resourceGaps.length === 0) {
      return '当前时间范围内无资源缺口';
    }

    const gapTimes = summary.resourceGaps.map(gap => gap.time);
    const timeRangeText = gapTimes.length > 3
      ? `${gapTimes[0]} 至 ${gapTimes[gapTimes.length - 1]}`
      : gapTimes.join('、');

    return `${timeRangeText} 存在资源缺口，总共为：${formatNumber(summary.totalGap)} 核，请 Hulk 资源运营同学进行资源筹措`;
  };

  return (
    <Card
      title={
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
          📊 选择时间范围内资源汇总说明
        </div>
      }
      className="summary-panel"
      size="small"
      style={{ marginBottom: '16px' }}
    >
      <div className="summary-content">
        <div className="time-range">
          <strong>时间范围：</strong>{getTimeRangeText()}
        </div>

        {/* 未满足需求和可使用库存 */}
        <Row gutter={[24, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24} md={12}>
            <div className="summary-section">
              <h4 className="section-title">⚠️ 未满足需求：{formatNumber(summary.unfulfilledDemand)} 核</h4>
              <div className="section-content">
                <div className="summary-item">
                  <span className="item-label">其中</span>
                </div>
                <div className="summary-item indent">
                  <span className="item-label">明确交付需求：</span>
                  <span className="item-value unfulfilled-clear">{formatNumber(summary.unfulfilledClearDemand)} 核</span>
                </div>
                 <div className="summary-item indent">
                   <span className="item-label">未明确交付需求：</span>
                   <span className="item-value unfulfilled-unclear">{formatNumber(summary.unfulfilledUnclearDemand)} 核</span>
                 </div>
               </div>

               {/* 需求趋势图 */}
               {demandTrendData && (
                 <div style={{
                   marginTop: '16px',
                   padding: '12px',
                   border: '1px solid #f0f0f0',
                   borderRadius: '6px',
                   backgroundColor: '#fafafa'
                 }}>
                   <div style={{
                     fontSize: '14px',
                     fontWeight: 'bold',
                     marginBottom: '12px',
                     color: '#666'
                   }}>
                     📈 需求趋势变化
                   </div>
                   <div style={{ height: '200px' }}>
                     <DemandTrendChart data={demandTrendData} />
                   </div>
                 </div>
               )}
             </div>
           </Col>

          <Col xs={24} md={12}>
            <div className="summary-section">
              <h4 className="section-title">📦 可使用库存：{formatNumber(summary.totalAvailableStock)} 核</h4>
              <div className="section-content">
                <div className="summary-item">
                  <span className="item-label">其中</span>
                </div>
                <div className="summary-item indent">
                  <span className="item-label">存量可用配额可用库存：</span>
                  <span className="item-value stock-quota">
                    {formatNumber(summary.stockBreakdown.stockQuota.total)} 核
                    <span className="ratio">（占比 {summary.stockBreakdown.stockQuota.ratio}%）</span>
                  </span>
                </div>
                <div className="summary-item indent">
                  <span className="item-label">存量物理机转化配额可用库存：</span>
                  <span className="item-value stock-machine">
                    {formatNumber(summary.stockBreakdown.stockMachine.total)} 核
                    <span className="ratio">（占比 {summary.stockBreakdown.stockMachine.ratio}%）</span>
                  </span>
                </div>
                <div className="summary-item indent">
                  <span className="item-label">私有云供给转化配额可用库存：</span>
                  <span className="item-value private-cloud">
                    {formatNumber(summary.stockBreakdown.privateCloud.total)} 核
                    <span className="ratio">（占比 {summary.stockBreakdown.privateCloud.ratio}%）</span>
                  </span>
                </div>
                <div className="summary-item indent">
                  <span className="item-label">公有云供给转化配额可用库存：</span>
                  <span className="item-value public-cloud">
                    {formatNumber(summary.stockBreakdown.publicCloud.total)} 核
                    <span className="ratio">（占比 {summary.stockBreakdown.publicCloud.ratio}%）</span>
                  </span>
                </div>
                 <div className="summary-item indent">
                   <span className="item-label">其他方式转化配额可用库存：</span>
                   <span className="item-value other-supply">
                     {formatNumber(summary.stockBreakdown.otherSupply.total)} 核
                     <span className="ratio">（占比 {summary.stockBreakdown.otherSupply.ratio}%）</span>
                   </span>
                 </div>
               </div>

               {/* 库存趋势图 */}
               {inventoryTrendData && (
                 <div style={{
                   marginTop: '16px',
                   padding: '12px',
                   border: '1px solid #f0f0f0',
                   borderRadius: '6px',
                   backgroundColor: '#fafafa'
                 }}>
                   <div style={{
                     fontSize: '14px',
                     fontWeight: 'bold',
                     marginBottom: '12px',
                     color: '#666'
                   }}>
                     📊 库存趋势变化
                   </div>
                   <div style={{ height: '200px' }}>
                     <InventoryTrendChart data={inventoryTrendData} />
                   </div>
                 </div>
               )}
             </div>
           </Col>
        </Row>

        <Divider style={{ margin: '16px 0' }} />

        {/* 资源缺口部分 */}
        <div className="resource-gap-section">
          <h4 className="section-title">⚠️ 资源缺口</h4>
          {summary.resourceGaps.length > 0 ? (
            <div style={{ marginTop: '8px' }}>
              <Alert
                message={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{getResourceGapText()}</span>
                     <Button
                       type="primary"
                       size="small"
                       icon={<ArrowRightOutlined />}
                       onClick={onNavigateToResourceProcurement}
                       style={{
                         marginLeft: '16px',
                         backgroundColor: '#ff7875',
                         borderColor: '#ff7875',
                         fontWeight: 'bold'
                       }}
                     >
                       去资源筹措
                     </Button>
                  </div>
                }
                type="warning"
                showIcon
              />
            </div>
          ) : (
            <Alert
              message="当前时间范围内无资源缺口，资源供给充足"
              type="success"
              showIcon
              style={{ marginTop: '8px' }}
            />
          )}
        </div>

        <Divider style={{ margin: '16px 0' }} />

        {/* 已交付需求和已使用库存 */}
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <div className="summary-section">
              <h4 className="section-title">✅ 已交付需求：{formatNumber(summary.deliveredDemand)} 核</h4>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div className="summary-section">
              <h4 className="section-title">📤 已使用库存：{formatNumber(summary.totalUsedStock)} 核</h4>
              <div className="section-content">
                <div className="summary-item">
                  <span className="item-label">其中</span>
                </div>
                <div className="summary-item indent">
                  <span className="item-label">存量可用配额库存：</span>
                  <span className="item-value stock-quota">
                    {formatNumber(summary.usedStockBreakdown.stockQuota.total)} 核
                    <span className="ratio">（占比 {summary.usedStockBreakdown.stockQuota.ratio}%）</span>
                  </span>
                </div>
                <div className="summary-item indent">
                  <span className="item-label">存量物理机转化配额库存：</span>
                  <span className="item-value stock-machine">
                    {formatNumber(summary.usedStockBreakdown.stockMachine.total)} 核
                    <span className="ratio">（占比 {summary.usedStockBreakdown.stockMachine.ratio}%）</span>
                  </span>
                </div>
                <div className="summary-item indent">
                  <span className="item-label">私有云供给转化配额库存：</span>
                  <span className="item-value private-cloud">
                    {formatNumber(summary.usedStockBreakdown.privateCloud.total)} 核
                    <span className="ratio">（占比 {summary.usedStockBreakdown.privateCloud.ratio}%）</span>
                  </span>
                </div>
                <div className="summary-item indent">
                  <span className="item-label">公有云供给转化配额库存：</span>
                  <span className="item-value public-cloud">
                    {formatNumber(summary.usedStockBreakdown.publicCloud.total)} 核
                    <span className="ratio">（占比 {summary.usedStockBreakdown.publicCloud.ratio}%）</span>
                  </span>
                </div>
                <div className="summary-item indent">
                  <span className="item-label">其他方式转化配额库存：</span>
                  <span className="item-value other-supply">
                    {formatNumber(summary.usedStockBreakdown.otherSupply.total)} 核
                    <span className="ratio">（占比 {summary.usedStockBreakdown.otherSupply.ratio}%）</span>
                  </span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default SummaryPanel;
