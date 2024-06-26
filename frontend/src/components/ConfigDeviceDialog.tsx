import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { SensorType, DeviceType } from "../enums";
import { API_URL } from "../constants";
import DeleteIcon from "@mui/icons-material/Delete";

// Interface definition for this component.
export interface ConfigureDeviceDialogProps {
  open: boolean;
  id: string | null;
  initialName: string;
  initialUpdateInterval: number;
  initialDeviceType: DeviceType | null;
  initialSensorType: SensorType | null;
  initialMeasureAmount: string;
  onClose: (value: string) => void;
}

function ConfigDeviceDialog(props: ConfigureDeviceDialogProps) {
  // Get props from parent component.
  const {
    open,
    id,
    initialName,
    initialUpdateInterval,
    initialDeviceType,
    initialSensorType,
    initialMeasureAmount,
    onClose,
  } = props;

  // Set variables with state.
  const [name, setName] = useState("");
  const [updateInterval, setUpdateInterval] = useState(2000);
  const [deviceType, setDeviceType] = useState<DeviceType | null>(null);
  const [sensorType, setSensorType] = useState<SensorType | null>(null);
  const [measureAmount, setMeasureAmount] = useState<string>("");

  // Initialize data, use data that was given from parent component.
  useEffect(() => {
    if (open) {
      setName(initialName);
      setUpdateInterval(initialUpdateInterval);
      setDeviceType(initialDeviceType);
      setSensorType(initialSensorType);
      setMeasureAmount(initialMeasureAmount);
    }
  }, [open]);

  // Return value to parent component on close.
  const handleClose = () => {
    onClose("");
  };

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  const handleDeleteConfirmationOpen = () => {
    setDeleteConfirmationOpen(true);
  };


  const handleDeleteConfirmationClose = () => {
    setDeleteConfirmationOpen(false);
  };

  const handleDeleteDevice = async () => {
    handleDeleteConfirmationClose(); // Close the confirmation dialog

    try {
      const response = await fetch(`${API_URL}/device/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      handleClose(); // Close the dialog after successful deletion
    } catch (error) {
      console.error("Error deleting device:", error);
    }
  };

  // Handle changes of values in dialog.
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleUpdateIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpdateInterval(+event.target.value);
  };

  // Send value to backend.
  const handleSave = async () => {
    let sendName = null;
    let sendDeviceType = null;
    let sendSensorType = null;
    let sendMeasureAmount = null;
    let sendUpdateInterval = null;

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

    if (updateInterval > 0){
      sendUpdateInterval = updateInterval * 1000; // calculate ms from s.
    } else {
      sendUpdateInterval = 2000; //set 2s as default.
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
          updateInterval: sendUpdateInterval
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      handleClose();
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  return (
      <React.Fragment>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Configure Device {initialName}</DialogTitle>
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
                required
            />
            <TextField
                autoFocus
                margin="dense"
                id="updateInterval"
                label="Update Interval (s)"
                fullWidth
                value={updateInterval}
                inputProps={{ type: 'number'}}
                onChange={handleUpdateIntervalChange}
                required
            />
          </DialogContent>
          <Button
              startIcon={<DeleteIcon />}
              color="error"
              onClick={handleDeleteConfirmationOpen}
          >            Delete Device
          </Button>
          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteConfirmationOpen} onClose={handleDeleteConfirmationClose}>
            <DialogTitle>Delete Device</DialogTitle>
            <DialogContent>
              <p>Are you sure you want to delete this device?</p>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteConfirmationClose}>Cancel</Button>
              <Button onClick={handleDeleteDevice} color="error" startIcon={<DeleteIcon />}>
                Delete
              </Button>
            </DialogActions>
          </Dialog>
          {/* End of Delete Confirmation Dialog */}
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
  );
}

export default ConfigDeviceDialog;
