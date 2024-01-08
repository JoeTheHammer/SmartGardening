import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Checkbox from "@mui/material/Checkbox";

import {MeasureValue} from "../enums";
import { TextField } from "@mui/material";
import {API_URL} from "../constants.ts";

const getThresholdDataEndpoint = API_URL + "/threshold/get";
const updateThresholdDataEndpoint = API_URL + "/threshold/update";

interface ApiResponse {
  data: Array<string | Array<string | null>>;
}

// Interface definition for this component.
export interface ThresholdDialogProps {
  open: boolean;
  actuatorId: string;
  actuatorName: string;
  onClose: (value: string) => void;
}

interface ThresholdData {
  measureType: MeasureValue;
  active: boolean;
  threshold: number;
  isLower: number;
}

function ThresholdDialog(props: ThresholdDialogProps) {
  // Get props from parent component.
  const { open, actuatorId, actuatorName, onClose } = props;
  const [thresholdData, setThresholdData] = useState<ThresholdData[] | null>(
    null
  );

  const fetchThresholdData = async () => {
    try {
      const response = await fetch(`${getThresholdDataEndpoint}/${actuatorId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result: ApiResponse = await response.json();


      const transformedData: {
        measureType: MeasureValue;
        active: boolean;
        threshold: number;
        isLower: number;
      }[] = result.data ? result.data.map((row) => {
        return {

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          measureType: row['measureType'],

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          active: row['threshold'] != null,

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          threshold: !row['threshold'] ? 0 : row['threshold'],

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          isLower: row['isLower'],
        };
      }) : [];


      setThresholdData([...transformedData]);

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    // Load and set initial threshold values and set data if it exists in the db.
    // Also, set active to true if data exists.
    if (open) {
      fetchThresholdData();

    }
  }, [open]);

  // Return value to paren component on close.
  const handleClose = () => {
    onClose("");
  };

  const handleSave = () => {

    try {
      fetch(updateThresholdDataEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: actuatorId,
          thresholdData: thresholdData,
        }),
      });

      handleClose();

    } catch (error) {
      console.error("Error sending data:", error);
    }

  };

  const handleCheckboxChange = (threshold: ThresholdData) => {
    setThresholdData((prevData) => {
      if (prevData) {
        // Find the index of the threshold in the array
        const index = prevData.findIndex(
          (item) => item.measureType === threshold.measureType
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
          threshold: Number(event.target.value),
        };

        return updatedThresholdData;
      }

      return prevData;
    });
  };



  const handleDropdownChange = (
      event: React.ChangeEvent<{ value: unknown }>,
      index: number
  ) => {
    setThresholdData((prevData) => {
      if (prevData) {
        // Update the value in the specific threshold
        const updatedThresholdData = [...prevData];
        updatedThresholdData[index] = {
          ...updatedThresholdData[index],
          isLower: Number(event.target.value),
        };

        return updatedThresholdData;
      }

      return prevData;
    });
  };

  return (
    <React.Fragment>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Thresholds for Actuator {actuatorName}</DialogTitle>
        <br></br>
        {thresholdData &&
          thresholdData.length > 0 &&
          thresholdData.map((threshold, index) => (
            <DialogContent key={threshold.measureType.toString()}>
              <div
                  key={threshold.measureType.toString()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
              >
                <div style={{flex: 1}}>
                  <strong>{threshold.measureType.toString()}</strong>
                </div>
                <Checkbox
                    checked={threshold.active}
                    onChange={() => handleCheckboxChange(threshold)}
                />

                <TextField
                    value={threshold.threshold}
                    onChange={(event) => handleNameChange(event, index)}
                    disabled={!threshold.active}
                    inputProps={{type: 'number'}}
                />
                <select
                    value={threshold.isLower ? "1" : "0"}
                    onChange={(event) => handleDropdownChange(event, index)}
                >
                  <option value="1">Lower</option>
                  <option value="0">Higher</option>
                </select>

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
