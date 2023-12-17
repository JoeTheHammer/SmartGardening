import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button } from "@mui/material";
import { Settings, BarChart } from "@mui/icons-material";
import { MeasureType, DeviceType } from "../enums";
import ConfigureDeviceDialog, {
  ConfigureDeviceDialogProps,
} from "./ConfigureDeviceDialog";

function Actuators() {
  interface Actuator {
    id: string;
    name: string;
  }

  const handleCloseDialog = () => {
    setDialogOpen(false);

    setConfigureDialogProps((prevProps) => ({
      ...prevProps,
      open: false,
    }));
  };

  const [actuatorList, setActuatorList] = useState<Array<Actuator> | null>(
    null
  );
  const [isDialogOpen, setDialogOpen] = useState(false);

  const [configureDialogProps, setConfigureDialogProps] =
    useState<ConfigureDeviceDialogProps>({
      open: false,
      id: "",
      initialName: "",
      initialDeviceType: DeviceType.ACTUATOR,
      initialMeasureType: null,
      initialMeasureAmount: "",
      onClose: handleCloseDialog,
    });

  const initialActuators: Array<Actuator> = [
    {
      id: "1",
      name: "Actuator 1",
    },
    {
      id: "2",
      name: "Actuator 2",
    },
    {
      id: "3",
      name: "Actuator 3",
    },
  ];

  useEffect(() => {
    // Set the initial sensor list inside the useEffect hook
    setActuatorList(initialActuators);
  }, []);

  const handleButtonClick = (actuator: Actuator) => {
    setDialogOpen(true);

    setConfigureDialogProps((prevProps) => ({
      ...prevProps,
      open: true,
      id: actuator.id,
      initialName: actuator.name,
      initialDeviceType: DeviceType.ACTUATOR,
    }));
  };

  return (
    <>
      <h2 className="text-center">Actuators</h2>
      {actuatorList !== null && actuatorList.length > 0 ? (
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
              </TableRow>
            </TableHead>
            <TableBody>
              {actuatorList.map((actuator) => (
                <TableRow
                  key={actuator.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {actuator.name}
                  </TableCell>
                  <TableCell align="left">{actuator.id}</TableCell>
                  <TableCell align="left">
                    <Button
                      onClick={() => handleButtonClick(actuator)}
                      color="primary"
                      startIcon={<Settings></Settings>}
                    >
                      Config
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

export default Actuators;
