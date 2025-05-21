"use client"

import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function OrderStatusChart({ data }) {
  // Use static data if none provided
  const chartData = data || [
    { name: "DELIVERED", value: 45, color: "#10b981" },
    { name: "PENDING", value: 20, color: "#f59e0b" },
    { name: "CONFIRMED", value: 25, color: "#3b82f6" },
    { name: "CANCELED", value: 10, color: "#ef4444" }
  ];

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} orders`} />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
