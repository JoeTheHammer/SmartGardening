import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Checkbox from "@mui/material/Checkbox";

import { MeasureValue, getMeasureValueFromString } from "../enums";
import { TextField } from "@mui/material";

// Interface definition for this component.
export interface ThresholdDialogProps {
  open: boolean;
  actuatorId: string;
  onClose: (value: string) => void;
}

interface ThresholdData {
  measureValue: MeasureValue;
  active: boolean;
  value: number;
}

function ThresholdDialog(props: ThresholdDialogProps) {
  // Get props from parent component.
  const { open, actuatorId, onClose } = props;
  const [thresholdData, setThresholdData] = useState<ThresholdData[] | null>(
    null
  );

  useEffect(() => {
    // Load and set initial threshold values and set data if it exists in the db.
    // Also, set active to true if data exists.
    if (open) {
      console.log("INIT THRESHOLD DIALOG!");
      const initialThresholdData: ThresholdData[] = Object.values(
        MeasureValue
      ).map((measureValue) => ({
        measureValue,
        active: false,
        value: 0,
      }));
      setThresholdData(initialThresholdData);
    }
  }, [open]);

  // Return value to paren component on close.
  const handleClose = () => {
    onClose("");
  };

  const handleSave = () => {
    console.log("Save clicked");
  };

  const handleCheckboxChange = (threshold: ThresholdData) => {
    setThresholdData((prevData) => {
      if (prevData) {
        // Find the index of the threshold in the array
        const index = prevData.findIndex(
          (item) => item.measureValue === threshold.measureValue
        );

        if (index !== -1) {
          // Update the specific threshold in the array
          const updatedThresholdData = [...prevData];
          updatedThresholdData[index] = {
            ...threshold,
            active: !threshold.active,
          };

          return updatedThresholdData;
        }
      }

      return prevData;
    });
  };

  const handleNameChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    setThresholdData((prevData) => {
      if (prevData) {
        // Update the value in the specific threshold
        const updatedThresholdData = [...prevData];
        updatedThresholdData[index] = {
          ...updatedThresholdData[index],
          value: Number(event.target.value),
        };

        return updatedThresholdData;
      }

      return prevData;
    });
  };

  return (
    <React.Fragment>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Thresholds for Actuator{actuatorId}</DialogTitle>
        <br></br>
        {thresholdData &&
          thresholdData.length > 0 &&
          thresholdData.map((threshold, index) => (
            <DialogContent key={threshold.measureValue.toString()}>
              <div
                key={threshold.measureValue.toString()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <strong>{threshold.measureValue.toString()}</strong>
                </div>
                <Checkbox
                  checked={threshold.active}
                  onChange={() => handleCheckboxChange(threshold)}
                />

                <TextField
                  label="Enter value"
                  value={threshold.value}
                  onChange={(event) => handleNameChange(event, index)}
                  disabled={!threshold.active}
                />
              </div>
            </DialogContent>
          ))}
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default ThresholdDialog;
