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
import { MeasureType, DeviceType } from "../enums";
import ConfigureDeviceDialog, {
  ConfigureDeviceDialogProps,
} from "./ConfigureDeviceDialog";
import { useNavigate } from "react-router-dom";

function Sensors() {
  interface Sensor {
    id: string;
    name: string;
    measureType: MeasureType | null;
    measureAmount: string;
  }

  // Used to navigate the data page.
  const navigate = useNavigate();

  const handleCloseDialog = () => {
    setConfigureDialogProps((prevProps) => ({
      ...prevProps,
      open: false,
    }));
  };

  const [sensorList, setSensorList] = useState<Array<Sensor> | null>(null);

  // Set initial configure props
  const [configureDialogProps, setConfigureDialogProps] =
    useState<ConfigureDeviceDialogProps>({
      open: false,
      id: "",
      initialName: "",
      initialDeviceType: DeviceType.SENSOR,
      initialMeasureType: null,
      initialMeasureAmount: "",
      onClose: handleCloseDialog,
    });

  //TODO: Remove static sensors.
  const initialSensors: Array<Sensor> = [
    {
      id: "1",
      name: "Sensor 1",
      measureType: MeasureType.TEMPERATURE_HUMIDITY,
      measureAmount: "2",
    },
    {
      id: "2",
      name: "Sensor 2",
      measureType: MeasureType.AIR_QUALITY,
      measureAmount: "1",
    },
    {
      id: "3",
      name: "Sensor 3",
      measureType: MeasureType.MOISTURE,
      measureAmount: "1",
    },
  ];

  useEffect(() => {
    //TODO: Get sensor list from backend.
    setSensorList(initialSensors);
  }, []);

  const handleOpenConfigClick = (sensor: Sensor) => {
    setConfigureDialogProps((prevProps) => ({
      ...prevProps,
      open: true,
      id: sensor.id,
      initialName: sensor.name,
      initialDeviceType: DeviceType.SENSOR,
      initialMeasureType: sensor.measureType,
      initialMeasureAmount: sensor.measureAmount,
    }));
  };

  const handleOpenDataClick = (sensorId: String) => {
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
                  <b>Measure Type</b>
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
                  <TableCell align="left">{sensor.measureType}</TableCell>
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
      <ConfigureDeviceDialog {...configureDialogProps} />
    </>
  );
}

export default Sensors;
