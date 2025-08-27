import React from 'react';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';

const InventoryUsageTrendChart = ({ data, filters }) => {
  if (!data || !data.labels || !data.usageData) {
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
    const series = [];

    // 为每个集群/专区/调用方生成已使用和未使用的曲线
    data.usageData.forEach((item, index) => {
      const baseColor = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'][index % 6];

      // 已使用曲线（实线）
      const usedHistoricalData = [];
      const usedForecastData = [];

      // 未使用曲线（实线）
      const unusedHistoricalData = [];
      const unusedForecastData = [];

      item.used.forEach((point, pointIndex) => {
        const isPast = todayIndex === -1 || pointIndex <= todayIndex;

        if (isPast) {
          usedHistoricalData.push(point.value);
          unusedHistoricalData.push(item.unused[pointIndex].value);

          // 在NOW点也添加数据到预测系列，确保连贯
          if (pointIndex === todayIndex) {
            usedForecastData.push(point.value);
            unusedForecastData.push(item.unused[pointIndex].value);
          } else {
            usedForecastData.push(null);
            unusedForecastData.push(null);
          }
        } else {
          // 在NOW点的下一个点也添加到历史数据，确保连贯
          if (pointIndex === todayIndex + 1) {
            usedHistoricalData.push(point.value);
            unusedHistoricalData.push(item.unused[pointIndex].value);
          } else {
            usedHistoricalData.push(null);
            unusedHistoricalData.push(null);
          }

          usedForecastData.push(point.value);
          unusedForecastData.push(item.unused[pointIndex].value);
        }
      });

      // 已使用历史数据系列
      if (usedHistoricalData.some(d => d !== null)) {
        series.push({
          name: `${item.name} - 已使用`,
          type: 'line',
          data: usedHistoricalData,
          lineStyle: {
            color: baseColor,
            width: 3,
            type: 'solid'
          },
          itemStyle: {
            color: baseColor
          },
          symbol: 'circle',
          symbolSize: 6,
          smooth: true,
          connectNulls: false,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: baseColor + '40'
              }, {
                offset: 1, color: baseColor + '10'
              }]
            }
          }
        });
      }

      // 已使用预测数据系列
      if (usedForecastData.some(d => d !== null)) {
        series.push({
          name: `${item.name} - 已使用`,
          type: 'line',
          data: usedForecastData,
          lineStyle: {
            color: baseColor,
            width: 3,
            type: 'dashed'
          },
          itemStyle: {
            color: baseColor,
            opacity: 0.7
          },
          symbol: 'circle',
          symbolSize: 6,
          smooth: true,
          connectNulls: false,
          showInLegend: false,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: baseColor + '20'
              }, {
                offset: 1, color: baseColor + '05'
              }]
            }
          }
        });
      }

      // 未使用历史数据系列
      const unusedColor = baseColor.replace('#', '#') + '80'; // 添加透明度
      if (unusedHistoricalData.some(d => d !== null)) {
        series.push({
          name: `${item.name} - 未使用`,
          type: 'line',
          data: unusedHistoricalData,
          lineStyle: {
            color: unusedColor,
            width: 2,
            type: 'solid'
          },
          itemStyle: {
            color: unusedColor
          },
          symbol: 'diamond',
          symbolSize: 5,
          smooth: true,
          connectNulls: false
        });
      }

      // 未使用预测数据系列
      if (unusedForecastData.some(d => d !== null)) {
        series.push({
          name: `${item.name} - 未使用`,
          type: 'line',
          data: unusedForecastData,
          lineStyle: {
            color: unusedColor,
            width: 2,
            type: 'dashed'
          },
          itemStyle: {
            color: unusedColor,
            opacity: 0.7
          },
          symbol: 'diamond',
          symbolSize: 5,
          smooth: true,
          connectNulls: false,
          showInLegend: false
        });
      }

      // 只在第一个数据集中添加NOW线
      if (index === 0 && todayIndex !== -1) {
        series.push({
          name: 'NOW线',
          type: 'line',
          showInLegend: false,
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
          },
          data: []
        });
      }
    });

    // 去重图例名称
    const uniqueLegendData = [...new Set(series.map(s => s.name))];

    return {
      title: {
        text: '库存使用趋势',
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
        left: 'center',
        type: 'scroll'
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

export default InventoryUsageTrendChart;
