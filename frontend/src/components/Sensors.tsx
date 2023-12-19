import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button } from "@mui/material";
import { Settings, ShowChart } from "@mui/icons-material";
import { SensorType, DeviceType, getSensorTypeFromString } from "../enums";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../constants";
import ConfigDeviceDialog, {ConfigureDeviceDialogProps} from "./ConfigDeviceDialog.tsx";

const getServicesEndpoint = API_URL + "/device/get_sensors";

function Sensors() {
  interface Sensor {
    id: string;
    name: string;
    sensorType: SensorType | null;
    measureAmount: string;
  }

  interface ApiResponse {
    data: Array<Array<string>>;
  }

  // Used to navigate the data page.
  const navigate = useNavigate();

  const handleCloseDialog = () => {
    setConfigureDialogProps((prevProps) => ({
      ...prevProps,
      open: false,
    }));
    fetchSensorData();
  };

  const [sensorList, setSensorList] = useState<Array<Sensor> | null>(null);

  const fetchSensorData = async () => {
    try {
      const response = await fetch(getServicesEndpoint);
      const result: ApiResponse = await response.json();

      const transformedData: {
        measureAmount: string;
        sensorType: SensorType | null;
        name: string;
        id: string;
        type: DeviceType;
      }[] = result.data.map((row) => ({
        id: row[0],
        name: row[1],
        type: DeviceType.SENSOR,
        sensorType: getSensorTypeFromString(row[3]),
        measureAmount: row[4],
      }));

      setSensorList([...transformedData]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Set initial configure props
  const [configureDialogProps, setConfigureDialogProps] =
    useState<ConfigureDeviceDialogProps>({
      open: false,
      id: "",
      initialName: "",
      initialDeviceType: DeviceType.SENSOR,
      initialSensorType: null,
      initialMeasureAmount: "",
      onClose: handleCloseDialog,
    });

  useEffect(() => {
    //TODO: Get sensor list from backend.
    fetchSensorData();
  }, []);

  const handleOpenConfigClick = (sensor: Sensor) => {
    setConfigureDialogProps((prevProps) => ({
      ...prevProps,
      open: true,
      id: sensor.id,
      initialName: sensor.name,
      initialDeviceType: DeviceType.SENSOR,
      initialSensorType: sensor.sensorType,
      initialMeasureAmount: sensor.measureAmount,
    }));
  };

  const handleOpenDataClick = (sensorId: string) => {
    navigate(`/sensor-data/${sensorId}`);
  };

  return (
    <>
      <h2 className="text-center">Sensors</h2>
      {sensorList !== null && sensorList.length > 0 ? (
        <TableContainer component={Paper}>
          <Table
            sx={{ minWidth: 50, overflow: "auto" }}
            aria-label="simple table"
          >
            <TableHead>
              <TableRow>
                <TableCell align="left">
                  <b>Name</b>
                </TableCell>
                <TableCell align="left">
                  <b>ID</b>
                </TableCell>
                <TableCell align="left">
                  <b>Sensor Type</b>
                </TableCell>
                <TableCell align="left">
                  <b>Measure Amount</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sensorList.map((sensor) => (
                <TableRow
                  key={sensor.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {sensor.name}
                  </TableCell>
                  <TableCell align="left">{sensor.id}</TableCell>
                  <TableCell align="left">{sensor.sensorType}</TableCell>
                  <TableCell align="left">{sensor.measureAmount}</TableCell>
                  <TableCell align="left">
                    <Button
                      onClick={() => handleOpenConfigClick(sensor)}
                      color="primary"
                      startIcon={<Settings></Settings>}
                    >
                      Config
                    </Button>
                  </TableCell>
                  <TableCell align="left">
                    <Button
                      onClick={() => handleOpenDataClick(sensor.id)}
                      color="primary"
                      startIcon={<ShowChart></ShowChart>}
                    >
                      Data
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <h4 className="text-center">
          There are no sensors known to the system.
        </h4>
      )}
      <ConfigDeviceDialog {...configureDialogProps} />
    </>
  );
}

export default Sensors;
