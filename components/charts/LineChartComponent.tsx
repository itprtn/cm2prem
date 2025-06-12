import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LineChartProps {
  data: any[];
  xAxisKey: string;
  lineKey: string;
  lineName?: string;
  strokeColor?: string;
  secondLineKey?: string;
  secondLineName?: string;
  secondStrokeColor?: string;
}

const LineChartComponent: React.FC<LineChartProps> = ({ 
    data, 
    xAxisKey, 
    lineKey, 
    lineName,
    strokeColor = "#8884d8",
    secondLineKey,
    secondLineName,
    secondStrokeColor = "#82ca9d"
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey={xAxisKey} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={{ stroke: '#E2E8F0' }} />
        <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={{ stroke: '#E2E8F0' }} />
        <Tooltip
          cursor={{ stroke: 'rgba(200,200,200,0.5)', strokeWidth: 1 }}
          contentStyle={{ backgroundColor: 'white', borderRadius: '0.375rem', borderColor: '#E2E8F0', fontSize: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'}}
        />
        { (lineName || secondLineName) && <Legend wrapperStyle={{fontSize: "12px"}}/> }
        <Line type="monotone" dataKey={lineKey} name={lineName} stroke={strokeColor} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
        {secondLineKey && <Line type="monotone" dataKey={secondLineKey} name={secondLineName} stroke={secondStrokeColor} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;
