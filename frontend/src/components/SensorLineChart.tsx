import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Paper from "@mui/material/Paper";

interface Measurement {
  timestamp: Date;
  value: number;
}

interface SensorDataPerMeasureValue {
  measure_value: string; // Change this to the correct type
  measurements: Measurement[];
}

interface SensorLineChartProps {
  sensorData: SensorDataPerMeasureValue;
}

const formatTimestamp = (timestamp: Date) => {
  return timestamp.toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const SensorLineChart: React.FC<SensorLineChartProps> = ({ sensorData }) => {
  return (
    <Paper elevation={3} style={{ padding: 20 }}>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart width={600} height={400} data={sensorData.measurements}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tickFormatter={formatTimestamp} />
          <YAxis
            label={{
              value: sensorData.measure_value,
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default SensorLineChart;
