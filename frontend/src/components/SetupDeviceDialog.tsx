import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import { SensorType, DeviceType } from "../enums";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import Box from "@mui/material/Box";
import { API_URL } from "../constants";

// Interface definition for this component.
export interface SetupDeviceDialogProps {
  open: boolean;
  id: string | null;
  initialName: string;
  initialDeviceType: DeviceType | null;
  initialSensorType: SensorType | null;
  initialMeasureAmount: string;
  onClose: (value: string) => void;
}

function SetupDeviceDialog(props: SetupDeviceDialogProps) {
  //TODO: Add value in seconds in which interval the sensor sends
  // Get props from parent component.
  const {
    open,
    id,
    initialName,
    initialDeviceType,
    initialSensorType,
    initialMeasureAmount,
    onClose,
  } = props;

  // Set variables with state.
  const [name, setName] = useState("");
  const [deviceType, setDeviceType] = useState<DeviceType | null>(null);
  const [sensorType, setSensorType] = useState<SensorType | null>(null);
  const [measureAmount, setMeasureAmount] = useState<string>("");

  // Initialize data, use data that was given from parent component.
  useEffect(() => {
    if (open) {
      console.log("INIT CONFIG DIALOG!");
      setName(initialName);
      setDeviceType(initialDeviceType);
      setSensorType(initialSensorType);
      setMeasureAmount(initialMeasureAmount);
    }
  }, [open]);

  // Return value to parent component on close.
  const handleClose = () => {
    onClose("");
  };

  // Send value to backend.
  const handleSave = async () => {
    let sendName = null;
    let sendDeviceType = null;
    let sendSensorType = null;
    let sendMeasureAmount = null;

    if (name !== null) {
      sendName = name;
    }

    if (deviceType != null) {
      sendDeviceType = deviceType.toString();
    }

    if (deviceType != null && deviceType === DeviceType.SENSOR) {
      if (sensorType != null) {
        sendSensorType = sensorType.toString();
      }
      if (measureAmount != null) {
        sendMeasureAmount = measureAmount.toString();
      }
    }

    try {
      const response = await fetch(API_URL + "/device/modify_info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          name: sendName,
          deviceType: sendDeviceType,
          sensorType: sendSensorType,
          measureAmount: sendMeasureAmount,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json();
      console.log("Server response:", responseData);

      handleClose();
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  // Handle changes of values in dialog.
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleDeviceTypeChange = (
    event: SelectChangeEvent<string> // Update the type to SelectChangeEvent<string>
  ) => {
    setDeviceType(event.target.value as DeviceType);
  };

  const handleSensorTypeChange = (
    event: SelectChangeEvent<string> // Update the type to SelectChangeEvent<string>
  ) => {
    setSensorType(event.target.value as SensorType);
  };

  const handleMeasureAmountChange = (
    event: SelectChangeEvent<string> // Update the type to SelectChangeEvent<string>
  ) => {
    setMeasureAmount(event.target.value);
  };

  return (
    <React.Fragment>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Configure Device {id}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            fullWidth
            variant="standard"
            value={name}
            onChange={handleNameChange}
          />
          <Box mt={2} mb={2}>
            {/* Separate sections with spacing using Box */}
          </Box>
          <InputLabel id="device-type-select-label">Device Type</InputLabel>
          <Select
            labelId="device-type-select-label"
            id="device-type-select"
            value={deviceType ? deviceType.toString() : ""}
            label="Device Type"
            onChange={handleDeviceTypeChange}
            fullWidth
            variant="standard"
          >
            {Object.values(DeviceType).map((deviceType) => (
              <MenuItem key={deviceType} value={deviceType}>
                {deviceType}
              </MenuItem>
            ))}
          </Select>
          <Box mt={2} mb={2}>
            {/* Separate sections with spacing using Box */}
          </Box>
          {deviceType === DeviceType.SENSOR && (
            <>
              <Box mt={2} mb={2}>
                {/* Separate sections with spacing using Box */}
              </Box>
              <InputLabel id="measure-type-select-label">
                Sensor Type
              </InputLabel>
              <Select
                labelId="measure-type-select-label"
                id="measure-type-select"
                value={sensorType ? sensorType.toString() : ""}
                label="Sensor Type"
                onChange={handleSensorTypeChange}
                fullWidth
                variant="standard"
              >
                {Object.values(SensorType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
              <Box mt={2} mb={2}>
                {/* Separate sections with spacing using Box */}
              </Box>
              <InputLabel id="measure-amount-select-label">
                Measure Amount
              </InputLabel>
              <Select
                labelId="measure-amount-select-label"
                id="measure-amount-select"
                value={measureAmount}
                label="Measure Amount"
                onChange={handleMeasureAmountChange}
                fullWidth
                variant="standard"
              >
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
              </Select>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default SetupDeviceDialog;
