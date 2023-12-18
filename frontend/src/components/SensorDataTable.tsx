import React from "react";
import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

interface Measurement {
  timestamp: Date;
  value: number;
}

interface SensorDataPerMeasureValue {
  measureValue: string; // Change this to the correct type
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

const SensorDataTable: React.FC<SensorLineChartProps> = ({ sensorData }) => {
  return (
    <>
      <TableContainer component={Paper}>
        <Table
          sx={{ minWidth: 50, overflow: "auto" }}
          aria-label="simple table"
        >
          <TableHead>
            <TableRow>
              <TableCell align="left">
                <b>Timestamp</b>
              </TableCell>
              <TableCell align="left">
                <b>Value</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sensorData.measurements.reverse().map((measurement) => (
              <TableRow
                key={measurement.timestamp.toString()}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {formatTimestamp(measurement.timestamp)}
                </TableCell>
                <TableCell align="left">{measurement.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default SensorDataTable;
