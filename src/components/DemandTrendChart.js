import React from 'react';
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

const DemandTrendChart = ({ data }) => {
  if (!data) {
    return <div>暂无数据</div>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} 核`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: '时间',
          font: {
            size: 12
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: '需求量（核）',
          font: {
            size: 12
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6
      },
      line: {
        tension: 0.3
      }
    }
  };

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: '明确交付需求',
        data: data.clearDemand,
        borderColor: '#ff7875',
        backgroundColor: 'rgba(255, 120, 117, 0.1)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#ff7875',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: '未明确交付需求',
        data: data.unclearDemand,
        borderColor: '#ffa940',
        backgroundColor: 'rgba(255, 169, 64, 0.1)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#ffa940',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: '总需求',
        data: data.totalDemand,
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24, 144, 255, 0.1)',
        fill: false,
        tension: 0.3,
        pointBackgroundColor: '#1890ff',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        borderWidth: 3
      }
    ]
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default DemandTrendChart;
