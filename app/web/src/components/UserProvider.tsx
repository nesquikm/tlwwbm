import {
  createContext,
  type FC,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";
import { useMessenger } from "./MessengerProvider";

// Define the type alias for userData
type UserData = { balance: BN };

interface UserContextState {
  userData: UserData | null;
}

const UserContext = createContext<UserContextState>({} as UserContextState);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { showError } = useMessenger();

  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    if (!publicKey) return;

    setUserData(null);

    const fetchUserData = async () => {
      try {
        connection.getBalance(publicKey).then((balance) => {
          console.log("Fetched user data balance:", balance);
          setUserData({ balance: new BN(balance) });
        });
      } catch (error) {
        showError("Error fetching user data:", error);
      }
    };

    fetchUserData();

    const subscriptionId = connection.onAccountChange(
      publicKey,
      (accountInfo) => {
        console.log("Changed user data:", accountInfo);
        setUserData({ balance: new BN(accountInfo.lamports) });
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
