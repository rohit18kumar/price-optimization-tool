import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  PointElement,
  LineElement,
  LineController,
  ScatterController,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Chart } from 'react-chartjs-2';
import { getForecastChartData } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  PointElement,
  LineElement,
  LineController,
  ScatterController,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CHART_COLORS = ['#38a169', '#3182ce', '#805ad5', '#d69e2e', '#e53e3e'];

function DemandForecastCharts() {
  const [chartData, setChartData] = useState({ products: [], regression_lines: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchChartData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getForecastChartData();
      setChartData(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  if (loading) {
    return <div className="charts-loading">Loading charts...</div>;
  }
  if (error) {
    return <div className="charts-error">{error}</div>;
  }

  const { products, regression_lines } = chartData;
  if (!products.length) {
    return <div className="charts-empty">No product data. Run Recalculate Forecasts to see charts.</div>;
  }

  const barData = {
    labels: products.map((p) => (p.name.length > 20 ? p.name.slice(0, 20) + '…' : p.name)),
    datasets: [
      {
        label: 'Demand Forecast',
        data: products.map((p) => p.demand_forecast),
        backgroundColor: 'rgba(56, 161, 105, 0.6)',
        borderColor: 'rgb(56, 161, 105)',
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Demand Forecast by Product' },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Forecasted Demand' } },
      x: { title: { display: true, text: 'Product' } },
    },
  };

  const scatterPoints = products.map((p) => ({
    x: p.selling_price,
    y: p.demand_forecast,
    label: p.name,
  }));

  const scatterDatasets = [
    {
      type: 'scatter',
      label: 'Products (Price vs Forecast)',
      data: scatterPoints,
      backgroundColor: 'rgba(49, 130, 206, 0.7)',
      borderColor: 'rgb(49, 130, 206)',
      pointRadius: 8,
      pointHoverRadius: 10,
    },
    ...regression_lines.map((line, i) => ({
      type: 'line',
      label: `Regression: ${line.category}`,
      data: line.points.map((pt) => ({ x: pt.price, y: pt.demand })),
      borderColor: CHART_COLORS[i % CHART_COLORS.length],
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      tension: 0,
    })),
  ];

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: true, text: 'Forecasted Demand vs Selling Price (with regression lines)' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const d = ctx.raw;
            if (d?.label) return `${d.label}: $${d.x} → ${d.y} forecast`;
            if (d) return `Price $${d.x} → Demand ${d.y}`;
            return '';
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        title: { display: true, text: 'Selling Price ($)' },
        beginAtZero: true,
      },
      y: {
        title: { display: true, text: 'Forecasted Demand' },
        beginAtZero: true,
      },
    },
  };

  const scatterData = { datasets: scatterDatasets };

  return (
    <div className="demand-forecast-charts">
      <h3 className="charts-title">Demand Forecast Charts</h3>
      <details className="charts-how-it-works">
        <summary>How are these charts plotted? What data is used?</summary>
        <p>
          <strong>Data source:</strong> <code>GET /api/v1/forecast/chart-data</code> returns two arrays:
        </p>
        <ul>
          <li><strong>products</strong> — each item has <code>name</code>, <code>selling_price</code>, <code>units_sold</code>, <code>demand_forecast</code> (and category).</li>
          <li><strong>regression_lines</strong> — per category, an array of <code>{'{ price, demand }'}</code> points for the regression line (demand = a − b×price).</li>
        </ul>
        <p>
          <strong>Bar chart:</strong> X = product name, Y = <code>demand_forecast</code> from <code>products</code>. One bar per product.
        </p>
        <p>
          <strong>Scatter + lines chart:</strong> Scatter points = <code>products</code> with x = <code>selling_price</code>, y = <code>demand_forecast</code>. Lines = <code>regression_lines[].points</code> (x = price, y = demand) per category. So you see each product as a point and the regression “forecasted demand vs selling price” as a line per category.
        </p>
      </details>
      <div className="charts-row">
        <div className="chart-container bar-chart">
          <Bar data={barData} options={barOptions} />
        </div>
        <div className="chart-container scatter-chart">
          <Chart type="scatter" data={scatterData} options={scatterOptions} />
        </div>
      </div>
      <button type="button" className="refresh-charts-btn" onClick={fetchChartData}>
        Refresh chart data
      </button>
    </div>
  );
}

export default DemandForecastCharts;
