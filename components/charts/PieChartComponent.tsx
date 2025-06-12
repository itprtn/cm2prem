
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PieChartDataPoint {
  name: string;
  value: number;
}

interface PieChartComponentProps {
  data: PieChartDataPoint[];
  colors?: string[]; // Array of hex colors
}

const defaultColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A354F1'];

const PieChartComponent: React.FC<PieChartComponentProps> = ({ data, colors = defaultColors }) => {
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = <T extends { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number; index: number }, >({ cx, cy, midAngle, innerRadius, outerRadius, percent }: T) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent * 100 < 5) return null; // Don't render label if too small

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px" fontWeight="medium">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={100}
          innerRadius={50} // For donut chart effect
          fill="#8884d8"
          dataKey="value"
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: 'white', borderRadius: '0.375rem', borderColor: '#E2E8F0', fontSize: '12px' }}
        />
        <Legend 
          iconType="circle" 
          iconSize={8}
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center"
          wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartComponent;
