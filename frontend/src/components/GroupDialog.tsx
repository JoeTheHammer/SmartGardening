import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import DialogContentText from "@mui/material/DialogContentText";
import { SensorType } from "../enums";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

// Interface definition for this component.
export interface GroupDialogProps {
  open: boolean;
  actuatorId: string;
  onClose: (value: string) => void;
}

interface Sensor {
  id: string;
  name: string;
  sensorType: SensorType;
}

interface GroupData {
  actuatorId: string;
  name: string;
  assignedSensors: Sensor[];
}

function GroupDialog(props: GroupDialogProps) {
  // Get props from parent component.
  const { open, actuatorId, onClose } = props;

  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [formName, setFormName] = useState<string>("");
  const [availableSensors, setAvailableSensors] = useState<Array<Sensor>>([]);

  const initialSensors: Array<Sensor> = [
    { id: "1", name: "Sensor1", sensorType: SensorType.AIR_QUALITY },
    { id: "2", name: "Sensor 2", sensorType: SensorType.MOISTURE },
    {
      id: "3",
      name: "Sensor 3",
      sensorType: SensorType.TEMPERATURE_HUMIDITY,
    },
  ];

  useEffect(() => {
    if (open) {
      // TODO: Load Initial Group Data
      // TODO: Load Initial Available Sensors
      // Set the initial sensor list inside the useEffect hook
      //setGroupData(initialGroupData);
      //if (groupData !== null) {
      //  setFormName(groupData.name);
      //}
      setAvailableSensors(initialSensors);
    }
  }, [open]);

  useEffect(() => {
    // Set formName after groupData is updated
    if (groupData !== null) {
      setFormName(groupData.name);
    }
  }, [groupData]);

  // Return value to paren component on close.
  const handleClose = () => {
    onClose("");
  };

  const handleSave = () => {
    console.log("Save clicked");
    //TODO: Implement create JSON from groupData and send to backend
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormName(event.target.value);
  };

  const handleClickCreateGroup = () => {
    setGroupData((prevData) => {
      if (prevData) {
        return {
          ...prevData,
          name: formName,
        };
      } else {
        return {
          actuatorId: props.actuatorId,
          name: formName,
          assignedSensors: [],
        };
      }
    });
  };

  const addSensor = (sensor: Sensor) => {
    setGroupData((prevData): GroupData | null => {
      if (prevData) {
        const updatedAvailableSensors = availableSensors.filter(
          (s) => s.id !== sensor.id
        );
        setAvailableSensors(updatedAvailableSensors);
        return {
          ...prevData,
          assignedSensors: [...prevData.assignedSensors, sensor],
        };
      }
      return null;
    });
  };

  const removeSensor = (sensor: Sensor) => {
    setAvailableSensors([sensor, ...availableSensors]);
    setGroupData((prevData): GroupData | null => {
      if (prevData) {
        const newSensors = prevData.assignedSensors.filter(
          (s) => s.id !== sensor.id
        );
        return {
          ...prevData,
          assignedSensors: newSensors,
        };
      }
      return null;
    });
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle className="text-center">
          Configure Group for Actuator{actuatorId}
        </DialogTitle>
        {!groupData ? (
          <>
            <DialogContentText
              style={{ paddingLeft: "10px", paddingRight: "10px" }}
            >
              No group created yet.
            </DialogContentText>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Name"
                fullWidth
                variant="standard"
                value={formName}
                onChange={handleNameChange}
              />
              <Button
                style={{ width: "100%" }}
                disabled={!formName.trim()}
                onClick={handleClickCreateGroup}
              >
                Create new group
              </Button>
            </DialogContent>
          </>
        ) : (
          <>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Name"
                fullWidth
                variant="standard"
                value={formName}
                onChange={handleNameChange}
              />

              <p className="text-center">Assigned Sensors:</p>
              {groupData.assignedSensors.length > 0 &&
                groupData.assignedSensors.map((sensor) => (
                  <div
                    key={sensor.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <strong>{sensor.name}</strong> - {sensor.sensorType}
                    </div>
                    <Button
                      variant="outlined"
                      size="small"
                      style={{ marginLeft: "8px" }}
                      startIcon={<RemoveIcon />}
                      onClick={() => removeSensor(sensor)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              <hr />
              <p className="text-center">Available Sensors:</p>
              {availableSensors.map((sensor) => (
                <div
                  key={sensor.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <strong>{sensor.name}</strong> - {sensor.sensorType}
                  </div>
                  <Button
                    variant="outlined"
                    size="small"
                    style={{ marginLeft: "8px" }}
                    startIcon={<AddIcon />}
                    onClick={() => addSensor(sensor)}
                  >
                    Add
                  </Button>
                </div>
              ))}
            </DialogContent>
          </>
        )}

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!formName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default GroupDialog;
