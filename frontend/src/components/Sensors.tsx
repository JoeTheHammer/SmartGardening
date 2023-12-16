import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button } from "@mui/material"; // Import Button from Material-UI
import { Settings, BarChart } from "@mui/icons-material";

function Sensors() {
  interface Sensor {
    id: string;
    name: string;
    measureType: String;
    measureAmount: number;
  }

  const [sensorList, setSensorList] = useState<Array<Sensor> | null>(null);

  const initialSensors: Array<Sensor> = [
    {
      id: "1",
      name: "Custom Sensor",
      measureType: "Humidity/Temperature",
      measureAmount: 2,
    },
    {
      id: "2",
      name: "Custom Sensor",
      measureType: "AirQulity",
      measureAmount: 1,
    },
    {
      id: "3",
      name: "Custom Sensor",
      measureType: "Moisture",
      measureAmount: 1,
    },
  ];

  useEffect(() => {
    // Set the initial sensor list inside the useEffect hook
    setSensorList(initialSensors);
  }, []);

  const handleButtonClick = (id: string) => {
    console.log("Button clicked for sensor ID:" + id);
    // Add your custom action based on the sensor ID here
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
                <TableCell>
                  <b>Name</b>
                </TableCell>
                <TableCell align="right">
                  <b>ID</b>
                </TableCell>
                <TableCell align="right">
                  <b>Measure Type</b>
                </TableCell>
                <TableCell align="right">
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
                  <TableCell align="right">{sensor.id}</TableCell>
                  <TableCell align="right">{sensor.measureType}</TableCell>
                  <TableCell align="right">{sensor.measureAmount}</TableCell>
                  <TableCell align="right">
                    <Button
                      onClick={() => handleButtonClick(sensor.id)}
                      color="primary"
                      startIcon={<Settings></Settings>}
                    >
                      Config
                    </Button>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      onClick={() => handleButtonClick(sensor.id)}
                      color="primary"
                      startIcon={<BarChart></BarChart>}
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
    </>
  );
}

export default Sensors;
