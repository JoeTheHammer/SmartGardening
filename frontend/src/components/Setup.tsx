import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Settings } from "@mui/icons-material";

function Setup() {
  const newDevices = [
    {
      id: "1",
      name: null,
      type: null,
      measureType: null,
      amount: null,
    },
    {
      id: "2",
      name: null,
      type: null,
      measureType: null,
      amount: null,
    },
    // Add more objects as needed
  ];

  return (
    <>
      <h2 className="text-center">Setup new Devices</h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          height: "100vh",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400, bgcolor: "background.paper" }}>
          <List>
            {newDevices.map((newDevice) => (
              <ListItem key={newDevice.id}>
                <ListItemButton
                  onClick={() => handleConfigureClick(newDevice.id)}
                >
                  <ListItemIcon>
                    <Settings></Settings>
                  </ListItemIcon>
                  <ListItemText primary={"Configure Device: " + newDevice.id} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </div>
    </>
  );
}

function handleConfigureClick(id: string) {
  // Handle the "Configure" button click for the given ID
  console.log(`Configure clicked for ID: ${id}`);
}

export default Setup;
