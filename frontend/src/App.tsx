import { ThemeProvider, createTheme } from "@mui/material/styles";
import "./App.css";
import MenuBar from "./components/MenuBar";
import Dashboard from "./components/Dashboard";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Setup from "./components/Setup";
import Actuators from "./components/Actuators";
import Sensors from "./components/Sensors";

const theme = createTheme({
  palette: {
    primary: {
      main: "#006400", // Dark Green color
    },
  },
});

function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <Router>
          <MenuBar></MenuBar>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/actuators" element={<Actuators />} />
            <Route path="/sensors" element={<Sensors />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </>
  );
}

export default App;
