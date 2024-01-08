import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import DialogContentText from "@mui/material/DialogContentText";
import {SensorType} from "../enums";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {API_URL} from "../constants.ts";

const getGroupDataEndpoint = API_URL + "/group/sensors";
const updateGroupEndpoint = API_URL + "/group/update";

// Interface definition for this component.
export interface GroupDialogProps {
  open: boolean;
  actuatorId: string;
  actuatorName: string
  onClose: (value: string) => void;
}

interface Sensor {
  id: string;
  name: string;
  sensorType: SensorType;
}

interface GroupData {
  actuatorId: string;
  groupName: string;
  sensors: Sensor[];
}

interface ApiResponse {
  data: {
    actuator_id: string;
    assigned_sensors: Sensor[];
    group_name: string;
    unassigned_sensors: Sensor[];
  };
}

function GroupDialog(props: GroupDialogProps) {
  // Get props from parent component.
  const { open, actuatorId, actuatorName, onClose } = props;

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

  const fetchGroupData = async () => {
    try {
      const response = await fetch(`${getGroupDataEndpoint}/${actuatorId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result: ApiResponse = await response.json();

        const data = result.data;

        if (Array.isArray(data.unassigned_sensors)) {
          const transformedData: GroupData = {
            actuatorId: data.actuator_id,
            groupName: data.group_name,
            sensors: data.assigned_sensors.map((sensor) => ({
              id: sensor[0],
              name: sensor[1],
              sensorType: sensor[2],
            } || []))
          };

          const availableSensorData: Sensor[] = data.unassigned_sensors.map((sensor) => ({
            id: sensor[0],
            name: sensor[1],
            sensorType: sensor[2],
          })) || [];

          setGroupData(transformedData);
          setAvailableSensors(availableSensorData);

          console.log(groupData)

        } else {
          // Handle the case where data.unassigned_sensors is not an array
          console.error("Unexpected data format:", data.unassigned_sensors);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }; // <-- Added this closing parenthesis


  useEffect(() => {
    if (open) {
      fetchGroupData();

      if (groupData !== null && groupData.groupName != "") {
        setFormName(groupData.groupName);
      }

    }
  }, [open]);

  useEffect(() => {
    // Set formName after groupData is updated
    if (groupData !== null) {
      setFormName(groupData.groupName);
    }
  }, [groupData]);

  // Return value to paren component on close.
  const handleClose = () => {
    onClose("");
  };

  const handleSave = () => {

    //TODO: Troubleshoot
    try {
      fetch(updateGroupEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actuatorId: groupData?.actuatorId,
          groupName: groupData?.groupName,
          sensors: groupData?.sensors
        }),
      });

      handleClose();

    } catch (error) {
      console.error("Error sending data:", error);
    }

  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;

    setFormName(newName);

    if (groupData){
      setGroupData((prevData) => {
        if (prevData) {
          return {
            ...prevData,
            groupName: newName,
          };
        } else {
          return {
            actuatorId: props.actuatorId,
            groupName: newName,
            sensors: [],
          };
        }
      });
    }

  };

  const handleClickCreateGroup = () => {
    setGroupData((prevData) => {
      if (prevData) {
        return {
          ...prevData,
          groupName: formName,
        };
      } else {
        return {
          actuatorId: props.actuatorId,
          groupName: formName,
          sensors: [],
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
          sensors: [...prevData.sensors, sensor],
        };
      }
      return null;
    });
  };

  const removeSensor = (sensor: Sensor) => {
    setAvailableSensors([sensor, ...availableSensors]);
    setGroupData((prevData): GroupData | null => {
      if (prevData) {
        const newSensors = prevData.sensors.filter(
          (s) => s.id !== sensor.id
        );
        return {
          ...prevData,
          sensors: newSensors,
        };
      }
      return null;
    });
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle className="text-center">
          Configure Group for Actuator {actuatorName}
        </DialogTitle>
        {!groupData || groupData.groupName == "" ? (
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
              {groupData.sensors.length > 0 &&
                groupData.sensors.map((sensor) => (
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
