import { useParams } from "react-router-dom";
import { MeasureValue } from "../enums";
import { useEffect, useState } from "react";
import SensorLineChart from "./SensorLineChart";
import SensorDataTable from "./SensorDataTable";

interface Measurement {
  timestamp: Date;
  value: number;
}

interface SensorDataPerMeasureValue {
  measureValue: MeasureValue;
  measurements: Measurement[];
}

function SensorData() {
  const { sensorId } = useParams();
  const [sensorData, setSensorData] =
    useState<Array<SensorDataPerMeasureValue> | null>(null);

  const initialSensorData: Array<SensorDataPerMeasureValue> = [
    {
      measureValue: MeasureValue.TEMPERATURE,
      measurements: [
        { timestamp: new Date(new Date().getTime() - 19 * 60000), value: 22.9 },
        { timestamp: new Date(new Date().getTime() - 18 * 60000), value: 22.4 },
        { timestamp: new Date(new Date().getTime() - 17 * 60000), value: 21.2 },
        { timestamp: new Date(new Date().getTime() - 16 * 60000), value: 22.0 },
        { timestamp: new Date(new Date().getTime() - 15 * 60000), value: 23.9 },
        { timestamp: new Date(new Date().getTime() - 14 * 60000), value: 23.8 },
        { timestamp: new Date(new Date().getTime() - 13 * 60000), value: 25.2 },
        { timestamp: new Date(new Date().getTime() - 12 * 60000), value: 21.5 },
        { timestamp: new Date(new Date().getTime() - 11 * 60000), value: 20.3 },
        { timestamp: new Date(new Date().getTime() - 10 * 60000), value: 20.5 },
        { timestamp: new Date(new Date().getTime() - 9 * 60000), value: 22.7 },
        { timestamp: new Date(new Date().getTime() - 8 * 60000), value: 21.7 },
        { timestamp: new Date(new Date().getTime() - 7 * 60000), value: 22.1 },
        { timestamp: new Date(new Date().getTime() - 6 * 60000), value: 23.3 },
        { timestamp: new Date(new Date().getTime() - 5 * 60000), value: 23.5 },
        { timestamp: new Date(new Date().getTime() - 4 * 60000), value: 25.3 },
        { timestamp: new Date(new Date().getTime() - 3 * 60000), value: 21.0 },
        { timestamp: new Date(new Date().getTime() - 2 * 60000), value: 20.4 },
        { timestamp: new Date(new Date().getTime() - 1 * 60000), value: 20.2 },
        { timestamp: new Date(new Date().getTime()), value: 24.9 },
      ],
    },
  ];

  const getMostRecentValue = (
    measurements: Measurement[] | undefined
  ): number | null => {
    if (!measurements || measurements.length === 0) {
      return null;
    }

    // Find the measurement with the maximum timestamp
    const mostRecentMeasurement = measurements.reduce(
      (max, measurement) =>
        measurement.timestamp > max.timestamp ? measurement : max,
      measurements[0]
    );

    return mostRecentMeasurement.value;
  };

  const mostRecentValue = getMostRecentValue(
    initialSensorData[0]?.measurements
  );

  useEffect(() => {
    setSensorData(initialSensorData);
  }, []);

  //Fetch data like this:
  //{[measure_value: 'Temperature', measurements: [{timestamp: '01.02...', value: 23}, {timestamp: '01.02...', value: 23}],
  //[measure_value: 'Humidity', measurements: [{timestamp: '01.02...', value: 23}, {timestamp: '01.02...', value: 23}]]}

  return (
    <>
      <h2 className="text-center">Data of Sensor {sensorId}</h2>
      {sensorData && (
        <>
          <h5 className="text-center">
            {sensorData[0].measureValue}: Current Value: {mostRecentValue}
          </h5>
          <SensorLineChart sensorData={sensorData[0]} />
          <SensorDataTable sensorData={sensorData[0]} />
        </>
      )}
    </>
  );
}

export default SensorData;
