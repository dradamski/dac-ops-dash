import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SensorReading } from '../../types/domain';
import { formatSensorValue, formatSensorTypeName } from '../../utils/formatters';
import { SensorLegend } from './SensorLegend';

interface SensorChartProps {
  data: SensorReading[];
  sensorType: string;
  height?: number;
  showLegend?: boolean;
}

/**
 * Chart component for displaying sensor data over time
 */
export function SensorChart({
  data,
  sensorType,
  height = 300,
  showLegend = true,
}: SensorChartProps) {
  // Transform data for Recharts
  const chartData = data.map((reading) => ({
    timestamp: new Date(reading.timestamp).getTime(),
    time: new Date(reading.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    value: reading.value,
    unit: reading.unit,
  }));

  const unit = data[0]?.unit || '';
  const sensorName = formatSensorTypeName(sensorType as any);

  // Custom tooltip formatter
  const formatTooltip = (value: number, unit: string) => {
    return formatSensorValue(value, unit);
  };

  return (
    <div className="sensor-chart">
      {showLegend && <SensorLegend sensorType={sensorType} unit={unit} />}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="time"
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            label={{ value: unit, angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
          />
          <Tooltip
            formatter={(value: number) => formatTooltip(value, unit)}
            labelStyle={{ color: '#111827' }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <style jsx>{`
        .sensor-chart {
          width: 100%;
        }
      `}</style>
    </div>
  );
}

