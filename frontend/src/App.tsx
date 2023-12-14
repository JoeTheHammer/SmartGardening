import { ThemeProvider, createTheme } from "@mui/material/styles";
import "./App.css";
import MenuBar from "./components/MenuBar";

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
        <MenuBar></MenuBar>
        <h1>Welcome to the App!</h1>
      </ThemeProvider>
    </>
  );
}

export default App;
