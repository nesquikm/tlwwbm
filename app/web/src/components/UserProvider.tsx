import {
  createContext,
  type FC,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

interface UserContextState {
  userData: { balance: number } | null;
}

export const UserContext = createContext<UserContextState>({} as UserContextState);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const [userData, setUserData] = useState<{ balance: number } | null>(null);

  useEffect(() => {
    if (!publicKey) return;

    setUserData(null);

    const fetchAdminData = async () => {
      try {
        connection.getBalance(publicKey).then((balance) => {
          console.log("Set admin data balance:", balance);
          setUserData({ balance });
        });
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };

    fetchAdminData();

    const subscriptionId = connection.onAccountChange(
      publicKey,
      (accountInfo) => {
        try {
          console.log("Account data changed:", accountInfo);
          setUserData({ balance: accountInfo.lamports });
        } catch (error) {
          console.error("Error decoding account data:", error);
        }
      }
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [publicKey, connection]);

  return (
    <UserContext.Provider value={{ userData }}>{children}</UserContext.Provider>
  );
};
