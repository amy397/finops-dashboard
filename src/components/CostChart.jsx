import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function CostChart({ data }) {
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.costDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    cost: parseFloat(item.totalCost)
  }));

  return (
    <div className="chart-container">
      <h3>일별 비용 추이</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => `$${value}`} />
          <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, '비용']} />
          <Line
            type="monotone"
            dataKey="cost"
            stroke="#1976d2"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CostChart;
