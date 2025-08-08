import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Empty } from 'antd';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ResourceGapChart = ({ data }) => {
  const chartRef = useRef();

  console.log('ResourceGapChart 接收到的数据:', data);

  // 计算14天后的位置
  const calculateFourteenDaysLaterIndex = () => {
    if (!data || !data.labels || data.labels.length === 0) {
      return 14; // 默认值
    }

    // 如果是小时格式（HH:00），14天后就是第14个小时
    if (data.labels[0] && data.labels[0].includes(':')) {
      return Math.min(14, data.labels.length - 1);
    }

    // 如果是日期格式（MM-DD），需要计算14天后的位置
    if (data.labels.length <= 14) {
      // 如果总天数少于14天，取中间位置
      return Math.floor(data.labels.length * 0.6);
    } else {
      // 如果总天数大于14天，取第14天的位置
      return 14;
    }
  };

  const fourteenDaysLaterIndex = calculateFourteenDaysLaterIndex();

  // 图表配置
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      // 自定义插件：绘制14天后的背景区域
      beforeDraw: function(chart) {
        const ctx = chart.ctx;
        const chartArea = chart.chartArea;
        const xScale = chart.scales.x;

        if (fourteenDaysLaterIndex < data.labels.length - 1) {
          // 计算14天分界线的x坐标
          const x14Days = xScale.getPixelForValue(fourteenDaysLaterIndex);

          // 绘制14天后的背景区域
          ctx.save();
          ctx.fillStyle = 'rgba(147, 51, 234, 0.05)'; // 淡紫色背景
          ctx.fillRect(
            x14Days,
            chartArea.top,
            chartArea.right - x14Days,
            chartArea.bottom - chartArea.top
          );

          // 绘制14天分界虚线
          ctx.strokeStyle = 'rgba(147, 51, 234, 0.8)';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 4]);
          ctx.beginPath();
          ctx.moveTo(x14Days, chartArea.top);
          ctx.lineTo(x14Days, chartArea.bottom);
          ctx.stroke();
          ctx.setLineDash([]); // 重置虚线样式
          ctx.restore();
        }
      },
      legend: {
        position: 'top',
        labels: {
          usePointStyle: false, // 使用方块而不是圆形
          padding: 15,
          font: {
            size: 11
          },
          generateLabels: function(chart) {
            const original = ChartJS.defaults.plugins.legend.labels.generateLabels;
            const labels = original.call(this, chart);

            // 对图例进行分组显示
            labels.forEach((label, index) => {
              if (index === 0) {
                label.text = '⚠️ ' + label.text; // 资源缺口
              } else if (index === 1) {
                label.text = '📈 ' + label.text; // 累计缺口
              } else if (index === 2) {
                label.text = '🚨 ' + label.text; // 14天分界线
              }
            });

            return labels;
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context) {
            const label = context[0].label;
            const isAfter14Days = context[0].dataIndex >= fourteenDaysLaterIndex;
            return `时间: ${label}${isAfter14Days ? ' (参考数据)' : ''}`;
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} 核`;
          },
          afterBody: function(context) {
            const isAfter14Days = context[0].dataIndex >= fourteenDaysLaterIndex;
            if (isAfter14Days) {
              return [``, `⚠️ 14天后数据仅作参考`];
            }
            return [];
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: (data && data.labels && data.labels[0] && data.labels[0].includes(':')) ? '时间（小时）' : '时间（日期）',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          color: function(context) {
            // 通过网格线颜色标记14天分界
            if (context.tick && context.tick.value === fourteenDaysLaterIndex) {
              return 'rgba(147, 51, 234, 0.8)'; // 紫色
            }
            return 'rgba(0, 0, 0, 0.1)';
          },
          lineWidth: function(context) {
            if (context.tick && context.tick.value === fourteenDaysLaterIndex) {
              return 3;
            }
            return 1;
          }
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: '内核数量',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString() + ' 核';
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.3
      },
      point: {
        radius: 3,
        hoverRadius: 5
      }
    }
  };

  // 如果没有数据，显示空状态
  if (!data || !data.labels || data.labels.length === 0) {
    console.log('ResourceGapChart: 没有数据，显示空状态');
    return (
      <div className="chart-container">
        <Empty
          description="暂无数据"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
          }}
        />
      </div>
    );
  }

  // 通过自定义数据点标记14天分界
  const createReferenceLineData = () => {
    if (!data.resourceGap || !data.cumulativeGap) {
      return data.labels.map(() => null);
    }
    const maxValue = Math.max(
      ...data.resourceGap,
      ...data.cumulativeGap
    );
    return data.labels.map((_, index) =>
      index === fourteenDaysLaterIndex ? maxValue * 1.1 : null
    );
  };

  // 图表数据
  const chartData = {
    labels: data.labels,
    datasets: [
      // 当前资源缺口
      {
        label: '当前资源缺口',
        data: data.resourceGap || [],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        fill: true,
        tension: 0.3,
        borderWidth: 3,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      // 累计资源缺口
      {
        label: '累计资源缺口',
        data: data.cumulativeGap || [],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.3,
        borderWidth: 2,
        pointBackgroundColor: 'rgb(245, 158, 11)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderDash: [5, 5]
      },
      // 14天分界线数据点
      {
        label: '14天分界线',
        data: createReferenceLineData(),
        borderColor: 'rgba(147, 51, 234, 0)',
        backgroundColor: 'rgba(147, 51, 234, 0)',
        pointBackgroundColor: 'rgb(147, 51, 234)', // 紫色
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointRadius: 8,
        pointHoverRadius: 10,
        showLine: false,
        fill: false
      }
    ]
  };

  console.log('ResourceGapChart 图表数据:', chartData);

  return (
    <div className="chart-container">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default ResourceGapChart;
