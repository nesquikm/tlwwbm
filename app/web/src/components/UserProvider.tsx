import {
  createContext,
  type FC,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

// Define the type alias for userData
type UserData = { balance: number } | null;

interface UserContextState {
  userData: UserData;
}

const UserContext = createContext<UserContextState>({} as UserContextState);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const [userData, setUserData] = useState<UserData>(null);

  useEffect(() => {
    if (!publicKey) return;

    setUserData(null);

    const fetchUserData = async () => {
      try {
        connection.getBalance(publicKey).then((balance) => {
          console.log("Fetched user data balance:", balance);
          setUserData({ balance });
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();

    const subscriptionId = connection.onAccountChange(
      publicKey,
      (accountInfo) => {
        console.log("Changed user data:", accountInfo);
        setUserData({ balance: accountInfo.lamports });
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

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
