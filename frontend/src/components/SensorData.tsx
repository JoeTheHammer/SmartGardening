import { useParams } from "react-router-dom";
import { MeasureValue } from "../enums";
import { useEffect, useState } from "react";
import SensorLineChart from "./SensorLineChart";
import SensorDataTable from "./SensorDataTable";
import {API_URL} from "../constants.ts";

const measurementDataEndpoint = API_URL + "/measurement/request";

interface ApiResponse {
  data: Array<string | Array<string | null>>;
}

interface Measurement {
  timestamp: Date;
  value: number;
}

interface SensorDataPerMeasureValue {
  measure_value: MeasureValue;
  measurements: Measurement[];
}

function SensorData() {
  const { sensorId } = useParams();
  const [sensorData, setSensorData] =
    useState<Array<SensorDataPerMeasureValue> | null>(null);



  const fetchMeasurementeData = async () => {
    try {
      const response = await fetch(measurementDataEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: sensorId,
        }),
      });
      const result: ApiResponse = await response.json();

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      setSensorData(result)
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

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

  useEffect(() => {
    //TODO: Get sensor data from backend by sensor id.
    fetchMeasurementeData();
  }, []);

  return (
      <>
        <h2 className="text-center">Data of Sensor {sensorId}</h2>
        {sensorData && (
            <>
              {sensorData.map((currentSensorData) => (
                  <div key={currentSensorData.measure_value}>
                    <h5 className="text-center">
                      {currentSensorData.measure_value}: Current Value: {getMostRecentValue(currentSensorData.measurements)}
                    </h5>
                    <SensorLineChart sensorData={currentSensorData} />
                    <SensorDataTable sensorData={currentSensorData} />
                  </div>
              ))}
            </>
        )}
      </>
  );
}

export default SensorData;
