import Button from "@mui/material/Button";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import SelectNetwork from "./components/SelectNetwork";

function App() {
  return (
    <Container>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          The Last Word Will Be Mine!
          </Typography>
          <Button color="inherit">Login</Button>
          <SelectNetwork/>
        </Toolbar>
      </AppBar>
      <Button variant="contained">Hello World</Button>
      <Box sx={{ bgcolor: "#FF0000", height: "10vh", width: "10vh" }} />
      <Box sx={{ bgcolor: "#00FF00", height: "10vh", width: "10vh" }} />

      <Box sx={{ bgcolor: "#FF0000", height: "10vh", width: "10vh" }} />
    </Container>
  );
}

export default App;
