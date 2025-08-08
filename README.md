# HOM-Hulk运维平台

一个基于React的企业级运维管理平台，提供资源供需匹配、库存管理和资源筹措等核心功能。

## 🚀 功能特性

### 📊 供需匹配看板
- **可用库存 VS 未满足需求趋势图**：堆叠面积图展示各供给方式贡献
- **资源缺口趋势图**：实时监控资源缺口变化
- **已出库库存 VS 已满足需求图**：跟踪资源使用情况
- **14天预测分界线**：区分准确数据和参考数据

### 📋 资源筹措管理
- **筹措记录列表**：完整的筹措历史记录
- **创建资源筹措**：支持多种筹措方式
- **筛选和搜索**：按筹措方式、交付方式、操作人等筛选
- **详情查看**：查看筹措记录详细信息

### 🔍 智能分析
- **资源汇总说明**：自动生成资源使用情况报告
- **缺口预警**：发现资源缺口时自动提醒
- **一键跳转**：从缺口发现直接跳转到筹措管理

## 🛠 技术栈

- **前端框架**：React 18
- **UI组件库**：Ant Design
- **图表库**：Chart.js + react-chartjs-2
- **日期处理**：Day.js
- **构建工具**：Create React App
- **包管理**：npm

## 📦 项目结构

```
Hulk_F1/
├── public/                 # 静态资源
├── src/
│   ├── components/         # React组件
│   │   ├── FilterPanel.js          # 筛选面板
│   │   ├── SummaryPanel.js         # 汇总面板
│   │   ├── InventoryDemandChart.js # 库存需求图表
│   │   ├── FulfilledChart.js       # 已满足需求图表
│   │   ├── ResourceGapChart.js     # 资源缺口图表
│   │   └── ResourceProcurementPage.js # 资源筹措页面
│   ├── services/           # 数据服务
│   │   └── dataService.js
│   ├── App.js             # 主应用组件
│   ├── App.css            # 样式文件
│   └── index.js           # 入口文件
├── package.json           # 项目配置
└── README.md             # 项目说明
```

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm start
```

应用将在 [http://localhost:3000](http://localhost:3000) 启动

### 构建生产版本
```bash
npm run build
```

## 🎯 核心页面

### 1. 供需匹配看板
- **路径**：默认首页
- **功能**：
  - 📈 三个核心图表展示资源状况
  - 🔍 筛选面板支持时间范围、地区等筛选
  - 📊 智能汇总面板自动分析数据

### 2. 资源筹措管理
- **路径**：左侧导航 → HOM → 资源筹措
- **功能**：
  - 📋 筹措记录列表展示
  - ➕ 创建新的资源筹措
  - 🔍 多维度筛选和搜索
  - 👁 查看筹措详情

## 📊 数据模型

### 筹措记录
```javascript
{
  id: Number,                    // 记录ID
  procurementMethod: String,     // 筹措方式
  supplyTime: String,           // 供给时间
  supplyAmount: Number,         // 供给量级（核）
  deliveryMethod: String,       // 交付方式
  releaseTime: String,          // 释放时间
  operator: String,             // 操作人
  createTime: String,           // 创建时间
  status: String                // 状态
}
```

## 🎨 界面特色

### 现代化UI设计
- **配色方案**：蓝色主题 + 状态色彩区分
- **图标系统**：丰富的Emoji和Ant Design图标
- **响应式布局**：适配桌面和移动端

### 数据可视化
- **堆叠面积图**：展示各供给方式贡献
- **趋势线图**：显示资源变化趋势
- **预警标记**：14天后数据特殊标记

### 交互体验
- **智能跳转**：资源缺口一键跳转筹措
- **实时筛选**：筛选条件实时生效
- **状态反馈**：加载、成功、错误状态清晰

## 🔧 开发说明

### 添加新功能
1. 在 `src/components/` 创建新组件
2. 在 `App.js` 中添加路由配置
3. 更新左侧导航菜单

### 自定义样式
- 主样式文件：`src/App.css`
- 组件样式：每个组件对应的 `.css` 文件

### 数据接口
- 模拟数据：`src/services/dataService.js`
- 可替换为真实API接口

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📝 更新日志

### v1.0.0 (2024-01-30)
- ✨ 初始版本发布
- 📊 供需匹配看板完整功能
- 📋 资源筹措管理系统
- 🔍 智能筛选和搜索
- 🎨 现代化UI设计

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👥 团队

- **产品设计**：HOM运维团队
- **前端开发**：AI Coding Assistant
- **技术支持**：Hulk运维平台

---

🌟 **如果这个项目对您有帮助，请给一个Star支持我们！** ⭐
