
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BarChartProps {
  data: any[];
  xAxisKey: string;
  barKey: string;
  barName?: string;
  fillColor?: string;
  secondBarKey?: string;
  secondBarName?: string;
  secondFillColor?: string;
}

const BarChartComponent: React.FC<BarChartProps> = ({ 
    data, 
    xAxisKey, 
    barKey, 
    barName,
    fillColor = "#8884d8",
    secondBarKey,
    secondBarName,
    secondFillColor = "#82ca9d"
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey={xAxisKey} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={{ stroke: '#E2E8F0' }} />
        <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={{ stroke: '#E2E8F0' }} />
        <Tooltip
          cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
          contentStyle={{ backgroundColor: 'white', borderRadius: '0.375rem', borderColor: '#E2E8F0', fontSize: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'}}
        />
        { (barName || secondBarName) && <Legend wrapperStyle={{fontSize: "12px"}}/> }
        <Bar dataKey={barKey} name={barName} fill={fillColor} radius={[4, 4, 0, 0]} barSize={30}/>
        {secondBarKey && <Bar dataKey={secondBarKey} name={secondBarName} fill={secondFillColor} radius={[4, 4, 0, 0]} barSize={30}/>}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent;
