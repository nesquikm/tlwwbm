import {
  createContext,
  type FC,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useProgram } from "./ProgramProvider";
import { PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";
import { BN } from "@coral-xyz/anchor";

const accountName = "config";

type ConfigData =
  | {
      admin: PublicKey;
      topicLockTime: BN;
      tFee: BN;
      cFee: BN;
      cFeeIncrement: BN;
      topicAuthorShare: number;
      lastCommentAuthorShare: number;
    }
  | null
  | undefined;

interface ConfigContextState {
  configData: ConfigData;
}

export const ConfigContext = createContext<ConfigContextState>(
  {} as ConfigContextState
);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: FC<ConfigProviderProps> = ({ children }) => {
  const { program } = useProgram();

  const [configPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from(accountName)],
    program.programId
  );

  const { connection } = useConnection();

  const [configData, setConfigData] = useState<ConfigData>(null);

  useEffect(() => {
    setConfigData(null);

    const fetchConfigData = async () => {
      try {
        const data = await program.account.config.fetch(configPDA);
        console.log("Fetched config data:", data);
        setConfigData(data);
      } catch (error) {
        console.error("Error fetching config data:", error);
        setConfigData(undefined);
      }
    };

    fetchConfigData();

    const subscriptionId = connection.onAccountChange(
      configPDA,
      (accountInfo) => {
        try {
          console.log("Changed config data:", accountInfo);
          const decodedData = program.coder.accounts.decode(
            accountName,
            accountInfo.data
          );
          setConfigData(decodedData);
        } catch (error) {
          console.error("Error decoding config data:", error);
        }
      }
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [connection]);

  return (
    <ConfigContext.Provider value={{ configData }}>
      {children}
    </ConfigContext.Provider>
  );
};
