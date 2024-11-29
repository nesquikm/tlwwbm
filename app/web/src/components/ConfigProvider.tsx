import {
  createContext,
  type FC,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "./ProgramProvider";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useMessenger } from "./MessengerProvider";

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
  initConfigData: () => void;
  deleteConfigData: () => void;
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
  const { showError } = useMessenger();

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
        showError("Error fetching config data:", error);
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
          showError("Error decoding config data:", error);
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
      showError("Error setting config data:", error);
    }
  };

  const initConfigDataCallback = async () => {
    try {
      const transaction = await program.methods
        .configInit()
        .accounts({
          authority: publicKey!,
        })
        .transaction();
      const transactionSignature = await sendTransaction(
        transaction,
        connection
      );
      console.log(`Config data initialized: ${transactionSignature}`);
    } catch (error) {
      showError("Error initializing config data:", error);
    }
  };

  const deleteConfigDataCallback = async () => {
    try {
      const transaction = await program.methods
        .configDelete()
        .accounts({
          authority: publicKey!,
        })
        .transaction();
      const transactionSignature = await sendTransaction(
        transaction,
        connection
      );
      console.log(`Config data deleted: ${transactionSignature}`);
    } catch (error) {
      showError("Error deleting config data:", error);
    }
  };

  return (
    <ConfigContext.Provider
      value={{
        configData,
        updateConfigData: updateConfigDataCallback,
        initConfigData: initConfigDataCallback,
        deleteConfigData: deleteConfigDataCallback,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

// Custom hook to use the ConfigContext
export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};
