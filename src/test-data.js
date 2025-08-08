import { getResourceData } from './services/dataService';

// 测试数据服务
const testDataService = async () => {
  try {
    console.log('开始测试数据服务...');
    const data = await getResourceData({
      dateRange: null,
      region: null,
      productType: null,
      customer: null
    });
    console.log('数据服务测试成功:', data);
    return data;
  } catch (error) {
    console.error('数据服务测试失败:', error);
    return null;
  }
};

// 导出测试函数
export { testDataService };
