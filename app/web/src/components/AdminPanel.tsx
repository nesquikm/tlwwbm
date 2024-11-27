import { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { formatSol } from "./helpers";

export default function AdminPanel() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [adminData, setAdminData] = useState<{ balance: number | null }>({ balance: null });

  useEffect(() => {
    if (!publicKey) return;

    setAdminData({ balance: null });

    const fetchAdminData = async () => {
      try {
        connection.getBalance(publicKey).then((balance) => {
          console.log('Set admin data balance:', balance);
          setAdminData({ balance });
        });

      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };

    fetchAdminData();

    // Subscribe to account change
    const subscriptionId = connection.onAccountChange(
      publicKey,
      (accountInfo) => {
        try {
          console.log("Account data changed:", accountInfo);
          setAdminData({ balance: accountInfo.lamports });
        } catch (error) {
          console.error("Error decoding account data:", error);
        }
      }
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [publicKey, connection]);

  if (!publicKey) return null;

  return (
    <Paper>
      <Toolbar>
        <Typography variant="subtitle1" component="div" sx={{ flexGrow: 1 }}>
          Admin Panel
        </Typography>
        <Typography variant="subtitle2" component="div">
          Balance: {adminData.balance ? formatSol(adminData.balance) : "Loading..."}
        </Typography>
      </Toolbar>
    </Paper>
  );
}
