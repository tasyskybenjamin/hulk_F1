import React from 'react';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';

const SupplyDemandTrendChart = ({ data, activeTab = 'all', filters }) => {
  if (!data || !data.labels || !data.datasets) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        color: '#999'
      }}>
        暂无数据
      </div>
    );
  }

  // 找到当前时间点的索引
  const today = new Date().toISOString().split('T')[0];
  const todayIndex = data.labels.findIndex(label => label === today);

  const getChartOption = () => {
    // 根据activeTab决定显示哪些数据系列
    let seriesToShow = [];

    // 库存始终显示
    const inventory = data.datasets.find(d => d.key === 'inventory');

    if (activeTab === 'all') {
      // 显示总需求
      const totalDemand = data.datasets.find(d => d.key === 'totalDemand');
      seriesToShow = [inventory, totalDemand];
    } else if (activeTab === 'pending') {
      // 只显示待评估需求
      const pendingDemand = data.datasets.find(d => d.key === 'pendingDemand');
      seriesToShow = [inventory, pendingDemand];
    } else if (activeTab === 'confirmed') {
      // 只显示确认待交付需求
      const confirmedDemand = data.datasets.find(d => d.key === 'confirmedDemand');
      seriesToShow = [inventory, confirmedDemand];
    }

    const series = [];

    seriesToShow.forEach((dataset, datasetIndex) => {
      if (!dataset) return;

      const historicalData = [];
      const forecastData = [];

      dataset.data.forEach((point, index) => {
        const isPast = todayIndex === -1 || index <= todayIndex;
        if (isPast) {
          historicalData.push(point.value);
          // 在NOW点也添加数据到预测系列，确保连贯
          if (index === todayIndex) {
            forecastData.push(point.value);
          } else {
            forecastData.push(null);
          }
        } else {
          // 在NOW点的下一个点也添加到历史数据，确保连贯
          if (index === todayIndex + 1) {
            historicalData.push(point.value);
          } else {
            historicalData.push(null);
          }
          forecastData.push(point.value);
        }
      });

      // 历史数据系列（实线）
      if (historicalData.some(d => d !== null)) {
        series.push({
          name: dataset.label,
          type: 'line',
          data: historicalData,
          lineStyle: {
            color: dataset.color,
            width: 3,
            type: 'solid'
          },
          itemStyle: {
            color: dataset.color
          },
          symbol: 'circle',
          symbolSize: 6,
          smooth: true,
          connectNulls: false,
          areaStyle: dataset.key !== 'inventory' ? {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: dataset.color + '40'
              }, {
                offset: 1, color: dataset.color + '10'
              }]
            }
          } : null,
          // 只在第一个数据集中添加NOW线
          ...(datasetIndex === 0 && todayIndex !== -1 ? {
            markLine: {
              silent: true,
              lineStyle: {
                color: '#ff4d4f',
                width: 2,
                type: 'dashed'
              },
              label: {
                show: true,
                position: 'insideEndTop',
                formatter: 'NOW',
                color: '#ff4d4f',
                fontSize: 12,
                fontWeight: 'bold',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: [2, 4],
                borderRadius: 3
              },
              data: [
                {
                  xAxis: data.labels[todayIndex]
                }
              ]
            }
          } : {})
        });
      }

      // 预测数据系列（虚线）
      if (forecastData.some(d => d !== null)) {
        series.push({
          name: dataset.label, // 使用相同的名称，这样图例中只显示一个
          type: 'line',
          data: forecastData,
          lineStyle: {
            color: dataset.color,
            width: 3,
            type: 'dashed'
          },
          itemStyle: {
            color: dataset.color,
            opacity: 0.7
          },
          symbol: 'circle',
          symbolSize: 6,
          smooth: true,
          connectNulls: false,
          showInLegend: false, // 不在图例中显示预测系列
          areaStyle: dataset.key !== 'inventory' ? {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: dataset.color + '20'
              }, {
                offset: 1, color: dataset.color + '05'
              }]
            }
          } : null
        });
      }
    });

    // 去重图例名称
    const uniqueLegendData = [...new Set(series.map(s => s.name))];

    return {
      title: {
        text: '可用库存 VS 需求匹配趋势',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        },
        formatter: function(params) {
          let result = `${params[0].axisValue}<br/>`;
          params.forEach(param => {
            const isPast = todayIndex === -1 || param.dataIndex <= todayIndex;
            const dataType = isPast ? '历史数据' : '预测数据';
            result += `${param.marker}${param.seriesName}: ${param.value} 核 (${dataType})<br/>`;
          });
          return result;
        }
      },
      legend: {
        data: uniqueLegendData,
        top: 35,
        left: 'center'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.labels,
        axisLabel: {
          formatter: function(value) {
            return dayjs(value).format('MM/DD');
          },
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: '数量（核）',
        nameLocation: 'middle',
        nameGap: 50,
        axisLabel: {
          formatter: '{value}'
        }
      },
      series: series
    };
  };

  return (
    <ReactECharts
      option={getChartOption()}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px'
      }}
    />
  );
};

export default SupplyDemandTrendChart;
