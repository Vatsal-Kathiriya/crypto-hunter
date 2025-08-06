import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
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

// Default chart configuration for better performance
export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 750, // Reduced animation duration for better performance
  },
  elements: {
    point: {
      radius: 0,
      hoverRadius: 5,
      hitRadius: 10,
    },
    line: {
      tension: 0.1,
    },
  },
  scales: {
    x: {
      display: true,
      grid: {
        color: "rgba(255, 255, 255, 0.1)",
        drawOnChartArea: true,
      },
      ticks: {
        maxTicksLimit: 10, // Limit number of ticks for performance
        color: "rgba(255, 255, 255, 0.7)",
      },
    },
    y: {
      display: true,
      grid: {
        color: "rgba(255, 255, 255, 0.1)",
        drawOnChartArea: true,
      },
      ticks: {
        maxTicksLimit: 8, // Limit number of ticks for performance
        color: "rgba(255, 255, 255, 0.7)",
      },
    },
  },
  plugins: {
    legend: {
      display: true,
      labels: {
        color: "white",
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "white",
      bodyColor: "white",
      borderColor: "#EEBC1D",
      borderWidth: 1,
    },
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
  datasets: {
    line: {
      pointRadius: 0,
      pointHoverRadius: 5,
    },
  },
};

export default ChartJS;
