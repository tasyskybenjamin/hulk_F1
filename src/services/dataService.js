import dayjs from 'dayjs';

// 模拟数据生成函数
const generateMockData = (filters) => {
  // 根据时间范围生成时间标签
  const generateTimeLabels = (dateRange) => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      // 如果没有选择时间范围，默认生成24小时的时间标签
      const labels = [];
      for (let i = 0; i < 24; i++) {
        labels.push(`${i.toString().padStart(2, '0')}:00`);
      }
      return labels;
    }

    const startDate = dayjs(dateRange[0]);
    const endDate = dayjs(dateRange[1]);
    const labels = [];

    // 计算时间跨度
    const diffInDays = endDate.diff(startDate, 'day');

    if (diffInDays <= 1) {
      // 1天内：按小时显示
      for (let i = 0; i < 24; i++) {
        labels.push(`${i.toString().padStart(2, '0')}:00`);
      }
    } else if (diffInDays <= 7) {
      // 7天内：按天显示
      let current = startDate;
      while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
        labels.push(current.format('MM-DD'));
        current = current.add(1, 'day');
      }
    } else if (diffInDays <= 30) {
      // 30天内：按天显示，但可能需要间隔
      let current = startDate;
      let step = Math.ceil(diffInDays / 20); // 最多显示20个点
      let dayCount = 0;
      while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
        if (dayCount % step === 0) {
          labels.push(current.format('MM-DD'));
        }
        current = current.add(1, 'day');
        dayCount++;
      }
    } else {
      // 超过30天：按周或月显示
      let current = startDate;
      const step = Math.ceil(diffInDays / 20);
      let dayCount = 0;
      while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
        if (dayCount % step === 0) {
          labels.push(current.format('MM-DD'));
        }
        current = current.add(step, 'day');
        dayCount += step;
      }
    }

    return labels;
  };

  const labels = generateTimeLabels(filters.dateRange);

  // 基础数据生成函数
  const generateRandomData = (base, variance, trend = 0) => {
    return labels.map((_, index) => {
      const trendValue = trend * index;
      const randomVariance = (Math.random() - 0.5) * variance;
      return Math.max(0, Math.round(base + trendValue + randomVariance));
    });
  };

  // 生成有明显缺口的需求数据
  const generateDemandWithGaps = (base, variance, trend = 0) => {
    return labels.map((_, index) => {
      const trendValue = trend * index;
      const randomVariance = (Math.random() - 0.5) * variance;

      // 在特定时间段制造缺口
      let gapMultiplier = 1;
      if (index >= 3 && index <= 8) {
        // 在第3-8个时间点制造较大缺口
        gapMultiplier = 2.5;
      } else if (index >= 12 && index <= 16) {
        // 在第12-16个时间点制造另一个缺口
        gapMultiplier = 2.0;
      } else if (index >= 18 && index <= 22) {
        // 在第18-22个时间点制造第三个缺口
        gapMultiplier = 1.8;
      }

      return Math.max(0, Math.round((base + trendValue + randomVariance) * gapMultiplier));
    });
  };

  // 根据筛选条件调整基础值
  let baseInventory = 5000;
  let baseDemand = 3000;
  let baseFulfilled = 2800;
  let baseDelivered = 2500;

  // 根据地域调整
  if (filters.region) {
    if (filters.region.includes('beijing')) {
      baseInventory *= 1.5;
      baseDemand *= 1.3;
      baseFulfilled *= 1.3;
      baseDelivered *= 1.2;
    } else if (filters.region === 'shanghai') {
      baseInventory *= 1.2;
      baseDemand *= 1.1;
      baseFulfilled *= 1.1;
      baseDelivered *= 1.0;
    } else if (filters.region === 'huailai') {
      baseInventory *= 0.8;
      baseDemand *= 0.7;
      baseFulfilled *= 0.7;
      baseDelivered *= 0.6;
    }
  }

  // 根据产品类型调整
  if (filters.productType) {
    switch (filters.productType) {
      case 'high-performance':
        baseInventory *= 0.6;
        baseDemand *= 1.4;
        baseFulfilled *= 1.2;
        baseDelivered *= 1.1;
        break;
      case 'economy':
        baseInventory *= 1.8;
        baseDemand *= 0.8;
        baseFulfilled *= 0.9;
        baseDelivered *= 0.8;
        break;
      case 'high-io':
        baseInventory *= 0.4;
        baseDemand *= 1.6;
        baseFulfilled *= 1.3;
        baseDelivered *= 1.2;
        break;
      case 'dedicated-host':
        baseInventory *= 0.3;
        baseDemand *= 2.0;
        baseFulfilled *= 1.5;
        baseDelivered *= 1.4;
        break;
      default:
        break;
    }
  }

  // 生成按供给方式分类的库存数据（调整为更容易产生缺口的数据）
  const stockQuotaRemaining = generateRandomData(baseInventory * 0.3, 300, -12);
  const stockMachineConversion = generateRandomData(baseInventory * 0.2, 200, -8);
  const privateCloudSupply = generateRandomData(baseInventory * 0.15, 150, -6);
  const publicCloudSupply = generateRandomData(baseInventory * 0.08, 100, -4);
  const otherSupply = generateRandomData(baseInventory * 0.03, 50, -2);

  // 计算总可用库存
  const totalAvailableInventory = labels.map((_, index) =>
    stockQuotaRemaining[index] +
    stockMachineConversion[index] +
    privateCloudSupply[index] +
    publicCloudSupply[index] +
    otherSupply[index]
  );

  // 生成按供给方式分类的已出库数据
  const deliveredStockQuota = generateRandomData(baseDelivered * 0.45, 150, 6);
  const deliveredStockMachine = generateRandomData(baseDelivered * 0.25, 100, 4);
  const deliveredPrivateCloud = generateRandomData(baseDelivered * 0.15, 80, 3);
  const deliveredPublicCloud = generateRandomData(baseDelivered * 0.1, 60, 2);
  const deliveredOther = generateRandomData(baseDelivered * 0.05, 30, 1);

  // 计算总已出库库存
  const totalDeliveredInventory = labels.map((_, index) =>
    deliveredStockQuota[index] +
    deliveredStockMachine[index] +
    deliveredPrivateCloud[index] +
    deliveredPublicCloud[index] +
    deliveredOther[index]
  );

  // 生成图表1的数据：可用库存按供给方式分类 VS 未满足需求
  const inventoryDemandData = {
    labels,
    // 按供给方式分类的可用库存
    stockQuotaRemaining,
    stockMachineConversion,
    privateCloudSupply,
    publicCloudSupply,
    otherSupply,
    totalAvailableInventory,
    unfulfilledDemand: generateDemandWithGaps(baseDemand - baseFulfilled + 2500, 800, 30)
  };

  // 生成图表2的数据：已满足需求 VS 已出库库存按供给方式分类
  const fulfilledData = {
    labels,
    fulfilledDemand: generateRandomData(baseFulfilled, 400, 15),
    // 按供给方式分类的已出库库存
    deliveredStockQuota,
    deliveredStockMachine,
    deliveredPrivateCloud,
    deliveredPublicCloud,
    deliveredOther,
    totalDeliveredInventory
  };

  // 生成图表3的数据：资源缺口趋势
  const resourceGapTrendData = {
    labels,
    // 计算每个时间点的资源缺口（未满足需求 - 可用库存，如果为负数则为0）
    resourceGap: labels.map((_, index) => {
      const unfulfilled = inventoryDemandData.unfulfilledDemand[index];
      const available = inventoryDemandData.totalAvailableInventory[index];
      return Math.max(0, unfulfilled - available);
    }),
    // 累计资源缺口
    cumulativeGap: labels.map((_, index) => {
      let cumulative = 0;
      for (let i = 0; i <= index; i++) {
        const unfulfilled = inventoryDemandData.unfulfilledDemand[i];
        const available = inventoryDemandData.totalAvailableInventory[i];
        cumulative += Math.max(0, unfulfilled - available);
      }
      return cumulative;
    })
  };

  // 计算汇总数据
  const calculateSummary = () => {
    // 计算累计需求和库存
    const totalUnfulfilledDemand = inventoryDemandData.unfulfilledDemand.reduce((sum, val) => sum + val, 0);
    const totalFulfilledDemand = fulfilledData.fulfilledDemand.reduce((sum, val) => sum + val, 0);

    // 计算总需求（累计）
    const totalDemand = totalUnfulfilledDemand + totalFulfilledDemand;

    // 计算已交付需求（累计）
    const deliveredDemand = totalFulfilledDemand;

    // 计算未满足需求（累计）
    const unfulfilledDemand = totalUnfulfilledDemand;

    // 计算14天分界点
    const fourteenDaysIndex = Math.min(14, labels.length - 1);

    // 计算未满足明确需求（14天内累计）
    const unfulfilledClearDemand = inventoryDemandData.unfulfilledDemand
      .slice(0, fourteenDaysIndex)
      .reduce((sum, val) => sum + val, 0);

    // 计算未满足不明确需求（14天后累计）
    const unfulfilledUnclearDemand = inventoryDemandData.unfulfilledDemand
      .slice(fourteenDaysIndex)
      .reduce((sum, val) => sum + val, 0);

    // 计算可使用库存总计（累计）
    const totalAvailableStock = inventoryDemandData.totalAvailableInventory.reduce((sum, val) => sum + val, 0);

    // 计算各类库存（累计）
    const stockQuotaTotal = inventoryDemandData.stockQuotaRemaining.reduce((sum, val) => sum + val, 0);
    const stockMachineTotal = inventoryDemandData.stockMachineConversion.reduce((sum, val) => sum + val, 0);
    const privateCloudTotal = inventoryDemandData.privateCloudSupply.reduce((sum, val) => sum + val, 0);
    const publicCloudTotal = inventoryDemandData.publicCloudSupply.reduce((sum, val) => sum + val, 0);
    const otherSupplyTotal = inventoryDemandData.otherSupply.reduce((sum, val) => sum + val, 0);

    // 计算占比
    const stockQuotaRatio = totalAvailableStock > 0 ? (stockQuotaTotal / totalAvailableStock * 100).toFixed(1) : 0;
    const stockMachineRatio = totalAvailableStock > 0 ? (stockMachineTotal / totalAvailableStock * 100).toFixed(1) : 0;
    const privateCloudRatio = totalAvailableStock > 0 ? (privateCloudTotal / totalAvailableStock * 100).toFixed(1) : 0;
    const publicCloudRatio = totalAvailableStock > 0 ? (publicCloudTotal / totalAvailableStock * 100).toFixed(1) : 0;
    const otherSupplyRatio = totalAvailableStock > 0 ? (otherSupplyTotal / totalAvailableStock * 100).toFixed(1) : 0;

    // 计算资源缺口
    const resourceGaps = [];
    inventoryDemandData.labels.forEach((label, index) => {
      const demand = inventoryDemandData.unfulfilledDemand[index];
      const available = inventoryDemandData.totalAvailableInventory[index];
      if (demand > available) {
        resourceGaps.push({
          time: label,
          gap: demand - available
        });
      }
    });

    const totalGap = resourceGaps.reduce((sum, item) => sum + item.gap, 0);

    // 计算已使用库存（累计）
    const totalUsedStock = fulfilledData.totalDeliveredInventory.reduce((sum, val) => sum + val, 0);

    // 计算各类已使用库存（累计）
    const usedStockQuotaTotal = fulfilledData.deliveredStockQuota.reduce((sum, val) => sum + val, 0);
    const usedStockMachineTotal = fulfilledData.deliveredStockMachine.reduce((sum, val) => sum + val, 0);
    const usedPrivateCloudTotal = fulfilledData.deliveredPrivateCloud.reduce((sum, val) => sum + val, 0);
    const usedPublicCloudTotal = fulfilledData.deliveredPublicCloud.reduce((sum, val) => sum + val, 0);
    const usedOtherSupplyTotal = fulfilledData.deliveredOther.reduce((sum, val) => sum + val, 0);

    // 计算已使用库存占比
    const usedStockQuotaRatio = totalUsedStock > 0 ? (usedStockQuotaTotal / totalUsedStock * 100).toFixed(1) : 0;
    const usedStockMachineRatio = totalUsedStock > 0 ? (usedStockMachineTotal / totalUsedStock * 100).toFixed(1) : 0;
    const usedPrivateCloudRatio = totalUsedStock > 0 ? (usedPrivateCloudTotal / totalUsedStock * 100).toFixed(1) : 0;
    const usedPublicCloudRatio = totalUsedStock > 0 ? (usedPublicCloudTotal / totalUsedStock * 100).toFixed(1) : 0;
    const usedOtherSupplyRatio = totalUsedStock > 0 ? (usedOtherSupplyTotal / totalUsedStock * 100).toFixed(1) : 0;

    return {
      totalDemand,
      deliveredDemand,
      unfulfilledDemand,
      unfulfilledClearDemand,
      unfulfilledUnclearDemand,
      totalAvailableStock,
      stockBreakdown: {
        stockQuota: { total: stockQuotaTotal, ratio: stockQuotaRatio },
        stockMachine: { total: stockMachineTotal, ratio: stockMachineRatio },
        privateCloud: { total: privateCloudTotal, ratio: privateCloudRatio },
        publicCloud: { total: publicCloudTotal, ratio: publicCloudRatio },
        otherSupply: { total: otherSupplyTotal, ratio: otherSupplyRatio }
      },
      totalUsedStock,
      usedStockBreakdown: {
        stockQuota: { total: usedStockQuotaTotal, ratio: usedStockQuotaRatio },
        stockMachine: { total: usedStockMachineTotal, ratio: usedStockMachineRatio },
        privateCloud: { total: usedPrivateCloudTotal, ratio: usedPrivateCloudRatio },
        publicCloud: { total: usedPublicCloudTotal, ratio: usedPublicCloudRatio },
        otherSupply: { total: usedOtherSupplyTotal, ratio: usedOtherSupplyRatio }
      },
      resourceGaps,
      totalGap
    };
  };

  return {
    inventoryDemand: inventoryDemandData,
    fulfilled: fulfilledData,
    resourceGapTrend: resourceGapTrendData,
    summary: calculateSummary()
  };
};

// 模拟API延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 获取资源数据的主函数
export const getResourceData = async (filters) => {
  // 模拟网络延迟
  await delay(800 + Math.random() * 400);

  try {
    // 在实际项目中，这里应该是真实的API调用
    // const response = await axios.post('/api/resource-data', filters);
    // return response.data;

    // 目前返回模拟数据
    const mockData = generateMockData(filters);

    // 模拟可能的错误情况
    if (Math.random() < 0.05) { // 5% 概率模拟错误
      throw new Error('网络请求失败');
    }

    return mockData;
  } catch (error) {
    console.error('获取数据失败:', error);
    throw error;
  }
};

// 获取筛选选项数据
export const getFilterOptions = async () => {
  await delay(200);

  return {
    regions: [
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
    ],
    productTypes: [
      { label: '通用', value: 'general' },
      { label: '经济', value: 'economy' },
      { label: '高性能', value: 'high-performance' },
      { label: '高IO', value: 'high-io' },
      { label: '专用宿主机', value: 'dedicated-host' },
      { label: '其他', value: 'other' }
    ],
    customers: [
      { label: '客户A', value: 'customer-a' },
      { label: '客户B', value: 'customer-b' },
      { label: '客户C', value: 'customer-c' },
      { label: '客户D', value: 'customer-d' },
      { label: '客户E', value: 'customer-e' },
      { label: '客户F', value: 'customer-f' },
      { label: '客户G', value: 'customer-g' },
      { label: '客户H', value: 'customer-h' }
    ]
  };
};

// 导出数据的函数
export const exportData = async (filters, format = 'excel') => {
  await delay(1000);

  const data = await getResourceData(filters);

  // 在实际项目中，这里应该调用后端API来生成和下载文件
  console.log('导出数据:', { filters, format, data });

  // 模拟文件下载
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `container-resource-data-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { success: true, message: '数据导出成功' };
};
