import { useMemo, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletDialogProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-material-ui";
import SelectNetwork, { getDefaultEndpoint } from "./components/SelectNetwork";
import AdminPanel from "./components/AdminPanel";
import { UserProvider } from "./components/UserProvider";
import { ProgramProvider } from "./components/ProgramProvider";
import { ConfigProvider } from "./components/ConfigProvider";
import CreateTopicPanel from "./components/CreateTopicPanel";
import { TopicProvider } from "./components/TopicProvider";
import TopicsPanel from "./components/TopicsPanel";
import { SnackbarProvider } from "notistack";
import { MessengerProvider } from "./components/MessengerProvider";

function App() {
  const [endpoint, setEndpoint] = useState(getDefaultEndpoint());
  const wallets = useMemo(() => [], [endpoint]);

  console.log("Selected endpoint", endpoint);

  return (
    <SnackbarProvider>
      <MessengerProvider>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletDialogProvider>
              <UserProvider>
                <ProgramProvider>
                  <ConfigProvider>
                    <Container>
                      <AppBar position="static">
                        <Toolbar>
                          <Typography
                            variant="h6"
                            component="div"
                            sx={{ flexGrow: 1 }}
                          >
                            The Last Word Will Be Mine!
                          </Typography>
                          <WalletMultiButton />
                          <SelectNetwork
                            endpoint={endpoint}
                            setEndpoint={setEndpoint}
                          />
                        </Toolbar>
                      </AppBar>
                      <AdminPanel />
                      <TopicProvider topicString={null}>
                        <CreateTopicPanel />
                        <TopicsPanel />
                      </TopicProvider>
                    </Container>
                  </ConfigProvider>
                </ProgramProvider>
              </UserProvider>
            </WalletDialogProvider>
          </WalletProvider>
        </ConnectionProvider>
      </MessengerProvider>
    </SnackbarProvider>
  );
}

export default App;
