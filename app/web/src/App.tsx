import { useMemo } from "react";
import Button from "@mui/material/Button";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletDialogProvider, WalletMultiButton } from '@solana/wallet-adapter-material-ui';
import { clusterApiUrl } from "@solana/web3.js";
import SelectNetwork from "./components/SelectNetwork";

function App() {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;
  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [
    ],
    [network],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletDialogProvider>
          <Container>
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  The Last Word Will Be Mine!
                </Typography>
                <WalletMultiButton/>
                <SelectNetwork />
              </Toolbar>
            </AppBar>
            <Button variant="contained">Hello World</Button>
            <Box sx={{ bgcolor: "#FF0000", height: "10vh", width: "10vh" }} />
            <Box sx={{ bgcolor: "#00FF00", height: "10vh", width: "10vh" }} />

            <Box sx={{ bgcolor: "#FF0000", height: "10vh", width: "10vh" }} />
          </Container>
          </WalletDialogProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
