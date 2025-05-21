import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

export const AreaChart = ({ data, index, categories, colors, valueFormatter, className }) => {
  if (!data || data.length === 0) {
    return <div className={className}>No data available</div>;
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            {categories.map((category, i) => (
              <linearGradient key={`gradient-${category}`} id={`color-${category}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors?.[i] || "#0088FE"} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors?.[i] || "#0088FE"} stopOpacity={0.1} />
              </linearGradient>
            ))}
          </defs>
          <XAxis dataKey={index} />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip formatter={(value) => valueFormatter ? valueFormatter(value) : value} />
          {categories.map((category, i) => (
            <Area
              key={`area-${category}`}
              type="monotone"
              dataKey={category}
              stroke={colors?.[i] || "#0088FE"}
              fillOpacity={1}
              fill={`url(#color-${category})`}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const BarChart = ({ data, index, categories, colors, valueFormatter, className }) => {
  if (!data || data.length === 0) {
    return <div className={className}>No data available</div>;
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={index} />
          <YAxis />
          <Tooltip formatter={(value) => valueFormatter ? valueFormatter(value) : value} />
          <Legend />
          {categories.map((category, i) => (
            <Bar
              key={`bar-${category}`}
              dataKey={category}
              fill={colors?.[i] || "#8884d8"}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PieChart = ({ data, index, categories, valueFormatter, className }) => {
  if (!data || data.length === 0) {
    return <div className={className}>No data available</div>;
  }

  // Fixed colors for different statuses
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  // Simple console log to debug data
  console.log("PieChart data:", data);
  console.log("Categories:", categories);

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value" // Always use "value" directly
            nameKey="name"  // Always use "name" directly
            label
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.fill || COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => valueFormatter ? valueFormatter(value) : value} />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};
  
  