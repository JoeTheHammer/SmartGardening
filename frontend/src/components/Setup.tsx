import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Settings, Refresh } from "@mui/icons-material";
import { useEffect, useState } from "react";
import SetupDeviceDialog, {
  SetupDeviceDialogProps,
} from "./SetupDeviceDialog.tsx";
import { API_URL } from "../constants";

interface ApiResponse {
  data: Array<Array<string | null>>;
}

interface NewDevice {
  id: string | null;
}

function Setup() {
  const getNewDevicesEndpoint = API_URL + "/device/new";

  const [newDevices, setNewDevices] = useState<Array<NewDevice> | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch(getNewDevicesEndpoint);
      const result: ApiResponse = await response.json();

      const transformedData: NewDevice[] = result.data.map((row) => ({
        id: row[0] || null,
      }));

      setNewDevices(transformedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const refreshList = () => {
    fetchData();
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleConfigureClick = (id: string | null) => {
    setSelectedDeviceId(id);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    refreshList(); //Refresh page after it was closed
  };

  const configureDialogProps: SetupDeviceDialogProps = {
    open: isDialogOpen,
    id: selectedDeviceId, // Provide an empty string as a default value
    initialName: "",
    initialDeviceType: null,
    initialSensorType: null,
    initialMeasureAmount: "",
    onClose: handleCloseDialog,
  };

  return (
    <>
      <h2 className="text-center">Setup new devices</h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {newDevices === null || newDevices.length == 0 ? (
          <div>
            <h4 className="text-center">No new devices available!</h4>
          </div>
        ) : (
          <></>
        )}
        <Box sx={{ width: "100%", maxWidth: 400, bgcolor: "background.paper" }}>
          <List>
            {newDevices !== null && newDevices.length > 0 ? (
              newDevices.map((newDevice) => (
                <ListItem key={newDevice.id}>
                  <ListItemButton
                    onClick={() => handleConfigureClick(newDevice.id)}
                  >
                    <ListItemIcon>
                      <Settings></Settings>
                    </ListItemIcon>
                    <ListItemText
                      primary={"Configure Device: " + newDevice.id}
                    />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <></>
            )}
            <ListItem key={"refresh-button"}>
              <ListItemButton onClick={() => refreshList()}>
                <ListItemIcon>
                  <Refresh></Refresh>
                </ListItemIcon>
                <ListItemText primary={"Refresh"} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </div>
      <SetupDeviceDialog {...configureDialogProps} />
    </>
  );
}

export default Setup;
