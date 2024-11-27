import { useContext } from "react";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useWallet } from "@solana/wallet-adapter-react";
import { formatSol } from "./helpers";
import { useUser } from "./UserProvider";
import { ConfigContext } from "./ConfigProvider";

export default function AdminPanel() {
  const { publicKey } = useWallet();

  const { userData } = useUser();
  const { configData } = useContext(ConfigContext);

  if (!publicKey) return null;

  console.log("Config data:", configData);

  return (
    <Paper>
      <Toolbar>
        <Typography variant="subtitle1" component="div" sx={{ flexGrow: 1 }}>
          Admin Panel
        </Typography>
        <Typography variant="subtitle2" component="div">
          Balance{": "}
          {userData ? formatSol(userData.balance) : "Loading..."}
        </Typography>
      </Toolbar>
    </Paper>
  );
}
