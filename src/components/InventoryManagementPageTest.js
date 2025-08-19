import React from 'react';

const InventoryManagementPageTest = () => {
  return (
    <div style={{
      padding: '24px',
      background: '#f0f0f0',
      minHeight: '500px',
      border: '2px solid red'
    }}>
      <h1 style={{ color: 'red', fontSize: '32px' }}>🎯 库存管理页面测试</h1>
      <p style={{ fontSize: '18px', color: 'blue' }}>
        如果你能看到这个红色边框和大标题，说明库存管理页面路由正常工作！
      </p>
      <div style={{ background: 'yellow', padding: '20px', marginTop: '20px' }}>
        <p>这是一个黄色背景的测试区域</p>
        <p>当前时间: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default InventoryManagementPageTest;
