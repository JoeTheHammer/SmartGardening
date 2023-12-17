import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

// Interface definition for this component.
export interface GroupDialogProps {
  open: boolean;
  actuatorId: string;
  onClose: (value: string) => void;
}

function GroupDialog(props: GroupDialogProps) {
  // Get props from parent component.
  const { open, actuatorId, onClose } = props;

  // Return value to paren component on close.
  const handleClose = () => {
    onClose("");
  };

  const handleSave = () => {
    console.log("Save clicked");
  };

  return (
    <React.Fragment>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Configure Group for Actuator{actuatorId}</DialogTitle>
        <DialogContent></DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default GroupDialog;
