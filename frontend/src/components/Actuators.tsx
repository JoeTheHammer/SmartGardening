import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import DataThresholdingIcon from "@mui/icons-material/DataThresholding";
import { Button } from "@mui/material";
import { Settings } from "@mui/icons-material";
import {DeviceType} from "../enums";
import ConfigureDeviceDialog, {
  ConfigureDeviceDialogProps,
} from "./ConfigureDeviceDialog";
import GroupDialog, { GroupDialogProps } from "./GroupDialog";
import ThresholdDialog, { ThresholdDialogProps } from "./ThresholdDialog";
import {API_URL} from "../constants.ts";

const getActuatorsEndpoint = API_URL + "/device/get_actuators";


function Actuators() {
  interface Actuator {
    id: string;
    name: string;
    actionOn: boolean;
  }

  interface ApiResponse {
    data: Array<Array<string>>;
  }

  const fetchActuatorData = async () => {
    try {
      const response = await fetch(getActuatorsEndpoint);
      const result: ApiResponse = await response.json();

      const transformedData: { name: string; id: string; actionOn: string }[] = result.data.map((row) => ({
        id: row[0],
        name: row[1],
        actionOn: row[5]
      }));

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      setActuatorList([...transformedData]);

      console.log(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };


  const handleCloseDialog = () => {
    setDialogOpen(false);
    setConfigureDialogProps((prevProps) => ({
      ...prevProps,
      open: false,
    }));

    setGroupDialogProps((prevProps) => ({
      ...prevProps,
      open: false,
    }));

    setThresholdDialogProps((prevProps) => ({
      ...prevProps,
      open: false,
    }));

    fetchActuatorData();
    if (isDialogOpen){
      setDialogOpen(false);
    }
  };

  const [actuatorList, setActuatorList] = useState<Array<Actuator>>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDialogOpen, setDialogOpen] = useState(false);

  const [configureDialogProps, setConfigureDialogProps] =
    useState<ConfigureDeviceDialogProps>({
      open: false,
      id: "",
      initialName: "",
      initialDeviceType: DeviceType.ACTUATOR,
      initialSensorType: null,
      initialMeasureAmount: "",
      onClose: handleCloseDialog,
    });

  const [groupDialogProps, setGroupDialogProps] = useState<GroupDialogProps>({
    open: false,
    actuatorId: "",
    onClose: handleCloseDialog,
  });

  const [thresholdDialogProps, setThresholdDialogProps] =
    useState<ThresholdDialogProps>({
      open: false,
      actuatorId: "",
      onClose: handleCloseDialog,
    });

  useEffect(() => {
    //TODO: Load actuators from backend.
    //TODO: Load actuator status from "Command" table for button
    fetchActuatorData();

  }, []);

  const handleConfigDialogClick = (actuator: Actuator) => {
    setDialogOpen(true);

    setConfigureDialogProps((prevProps) => ({
      ...prevProps,
      open: true,
      id: actuator.id,
      initialName: actuator.name,
      initialDeviceType: DeviceType.ACTUATOR,
    }));
  };

  const handleToggleActionClick = (actuator: Actuator) => {
    const updatedActuators = actuatorList?.map((a) =>
      a.id === actuator.id ? { ...a, actionOn: !a.actionOn } : a
    );
    setActuatorList(updatedActuators);
    console.log(
      "Actuator" + actuator.id + "set Status to " + !actuator.actionOn
    );
    //TODO: Write entry in "Command" table.
  };

  const handleGroupDialogClick = (actuator: Actuator) => {
    setDialogOpen(true);

    setGroupDialogProps((prevProps) => ({
      ...prevProps,
      open: true,
      actuatorId: actuator.id,
    }));
  };

  const handleThresholdDialogClick = (actuator: Actuator) => {
    setDialogOpen(true);

    setThresholdDialogProps((prevProps) => ({
      ...prevProps,
      open: true,
      actuatorId: actuator.id,
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
                      onClick={() => handleConfigDialogClick(actuator)}
                      color="primary"
                      startIcon={<Settings></Settings>}
                    >
                      Config
                    </Button>
                  </TableCell>
                  <TableCell align="left">
                    <Button
                      onClick={() => handleGroupDialogClick(actuator)}
                      color="primary"
                      startIcon={<GroupWorkIcon></GroupWorkIcon>}
                    >
                      Group
                    </Button>
                  </TableCell>
                  <TableCell align="left">
                    <Button
                      onClick={() => handleThresholdDialogClick(actuator)}
                      color="primary"
                      startIcon={<DataThresholdingIcon></DataThresholdingIcon>}
                    >
                      Thresholds
                    </Button>
                  </TableCell>
                  <TableCell align="left">
                    <Button
                      onClick={() => handleToggleActionClick(actuator)}
                      color="primary"
                      startIcon={
                        actuator.actionOn ? (
                          <RadioButtonCheckedIcon></RadioButtonCheckedIcon>
                        ) : (
                          <RadioButtonUncheckedIcon></RadioButtonUncheckedIcon>
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
      ) : (
        <h4 className="text-center">
          There are no Acutators known to the system.
        </h4>
      )}
      <ConfigureDeviceDialog {...configureDialogProps} />
      <GroupDialog {...groupDialogProps} />
      <ThresholdDialog {...thresholdDialogProps} />
    </>
  );
}

export default Actuators;
