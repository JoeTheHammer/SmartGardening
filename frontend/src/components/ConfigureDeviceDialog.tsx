import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import { MeasureType, DeviceType } from "../enums";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import Box from "@mui/material/Box";

export interface ConfigureDeviceDialogProps {
  open: boolean;
  id: string;
  onClose: (value: string) => void;
}

function ConfigureDeviceDialog(props: ConfigureDeviceDialogProps) {
  const { open, id, onClose } = props;

  const [name, setName] = useState("");
  const [deviceType, setDeviceType] = useState<DeviceType | null>(null);
  const [measureType, setMeasureType] = useState<MeasureType | null>(null);
  const [measureAmount, setMeasureAmount] = useState<string>("");

  useEffect(() => {
    // Reset values when the dialog is opened
    if (open) {
      setName("");
      setDeviceType(null);
      setMeasureType(null);
      setMeasureAmount("");
    }
  }, [open]);

  const handleClose = () => {
    onClose(""); // Pass an empty string (or any default value) when closing the dialog
  };

  const handleSave = () => {
    console.log("Submit with name:", name);
    console.log("Submit with Device Type:", deviceType);
    if (deviceType === DeviceType.SENSOR) {
      console.log("Submit with Measure Type:", measureType);
      console.log("Submit with Measure Amount:", measureAmount);
    }

    //TODO: Make post request with the values and id
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleDeviceTypeChange = (
    event: SelectChangeEvent<string> // Update the type to SelectChangeEvent<string>
  ) => {
    setDeviceType(event.target.value as DeviceType);
  };

  const handleMeasureTypeChange = (
    event: SelectChangeEvent<string> // Update the type to SelectChangeEvent<string>
  ) => {
    setMeasureType(event.target.value as MeasureType);
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
            defaultValue=""
            labelId="device-type-select-label"
            id="device-type-select"
            value={deviceType?.toString()}
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
                Measure Type
              </InputLabel>
              <Select
                defaultValue=""
                labelId="measure-type-select-label"
                id="measure-type-select"
                value={measureType?.toString()}
                label="Measure Type"
                onChange={handleMeasureTypeChange}
                fullWidth
                variant="standard"
              >
                {Object.values(MeasureType).map((type) => (
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
                defaultValue=""
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

export default ConfigureDeviceDialog;
