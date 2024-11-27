import {
  createContext,
  type FC,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "./ProgramProvider";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

const accountName = "config";

type ConfigData = {
  admin: PublicKey;
  topicLockTime: BN;
  tFee: BN;
  cFee: BN;
  cFeeIncrement: BN;
  topicAuthorShare: number;
  lastCommentAuthorShare: number;
};

type UpdateConfigData = {
  topicLockTime: BN;
  tFee: BN;
  cFee: BN;
  cFeeIncrement: BN;
  topicAuthorShare: number;
  lastCommentAuthorShare: number;
};

interface ConfigContextState {
  configData: ConfigData | null | undefined;
  updateConfigData: (configData: UpdateConfigData) => void;
}

export const ConfigContext = createContext<ConfigContextState>(
  {} as ConfigContextState
);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: FC<ConfigProviderProps> = ({ children }) => {
  const { sendTransaction, publicKey } = useWallet();
  const { program } = useProgram();

  const [configPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from(accountName)],
    program.programId
  );

  const { connection } = useConnection();

  const [configData, setConfigData] = useState<ConfigData | null | undefined>(
    null
  );

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

  const updateConfigDataCallback = async (data: UpdateConfigData) => {
    try {
      const transaction = await program.methods
        .configSet(
          data.topicLockTime,
          data.tFee,
          data.cFee,
          data.cFeeIncrement,
          data.topicAuthorShare,
          data.lastCommentAuthorShare
        )
        .accounts({
          authority: publicKey!,
        })
        .transaction();
      const transactionSignature = await sendTransaction(
        transaction,
        connection
      );
      console.log(`Config data changed: ${transactionSignature}`);
    } catch (error) {
      console.error("Error setting config data:", error);
    }
  };

  return (
    <ConfigContext.Provider
      value={{ configData, updateConfigData: updateConfigDataCallback }}
    >
      {children}
    </ConfigContext.Provider>
  );
};
