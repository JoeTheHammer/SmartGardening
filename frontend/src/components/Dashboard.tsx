import { useEffect, useState } from "react";
import { DeviceType, getSensorTypeFromString, SensorType } from "../enums.ts";
import { API_URL } from "../constants.ts";
import SensorDataDashboard from "./SensorDataDashboard.tsx";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import {Button} from "@mui/material";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import Paper from "@mui/material/Paper";

const getSensorsEndpoint = API_URL + "/device/get_sensors";
const getActuatorsEndpoint = API_URL + "/device/get_actuators";

function Dashboard() {
  interface ApiResponse {
    data: Array<Array<string | null>>;
  }

  interface Sensor {
    id: string;
    name: string;
    type: DeviceType;
    sensorType: SensorType | null;
  }

  interface Actuator {
    id: string;
    name: string;
    type: DeviceType;
    actionOn: boolean;
  }

  const [sensorList, setSensorList] = useState<Sensor[] | null>(null);
  const [actuatorList, setActuatorList] = useState<Actuator[] | null>(null);

  const fetchSensorData = async () => {
    try {
      const response = await fetch(getSensorsEndpoint);
      const result: ApiResponse = await response.json();

      const transformedData: {
        sensorType: SensorType | null;
        name: string | null;
        id: string | null;
        type: DeviceType;
      }[] = result.data.map((row) => ({
        id: row[0],
        name: row[1],
        type: DeviceType.SENSOR,
        sensorType: getSensorTypeFromString(row[3]),
      }));

      setSensorList(transformedData as unknown as Sensor[]);
    } catch (error) {
      console.error("Error fetching sensor data:", error);
    }
  };

  const fetchActuatorData = async () => {
    try {
      const response = await fetch(getActuatorsEndpoint);
      const result: ApiResponse = await response.json();

      const transformedData: {
        name: string | null;
        id: string | null;
        type: DeviceType;
        actionOn: string | null
      }[] = result.data.map((row) => ({
        id: row[0],
        name: row[1],
        type: DeviceType.ACTUATOR,
        actionOn: row[6],
      }));

      setActuatorList(transformedData as unknown as Actuator[]);
    } catch (error) {
      console.error("Error fetching actuator data:", error);
    }
  };

  const fetchData = async () => {
    await fetchSensorData();
    await fetchActuatorData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
      <>
        <h1 className="text-center">Dashboard</h1>
        <h2 className="text-center">Sensors</h2>
        {sensorList &&
            sensorList.map((sensor) => (
                <SensorDataDashboard key={sensor.id} sensorId={sensor.id} sensorName={sensor.name} />
            ))}
        <br/>
        <hr/>
        <br/>
        <h3 className="text-center">Actuators</h3>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">
                    <b>Name</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Status</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {actuatorList &&
                    actuatorList.map((actuator) => (
                        <TableRow
                            key={actuator.id}
                            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                        >
                          <TableCell align="center" component="th" scope="row">
                            {actuator.name}
                          </TableCell>

                          <TableCell align="center">
                            <Button
                                disabled={true}
                                color="primary"
                                startIcon={
                                  actuator.actionOn ? (
                                      <RadioButtonCheckedIcon />
                                  ) : (
                                      <RadioButtonUncheckedIcon />
                                  )
                                }
                            >
                              Activated
                            </Button>
                          </TableCell>
                        </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </>
  );
}

export default Dashboard;
