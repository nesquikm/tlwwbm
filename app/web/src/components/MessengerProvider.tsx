import Button from "@mui/material/Button";
import { closeSnackbar, SnackbarKey, useSnackbar } from "notistack";
import { createContext, type FC, type ReactNode, useContext } from "react";

interface MessengerContextState {
  showError: (message: string, error: any) => void;
}

const MessengerContext = createContext<MessengerContextState>(
  {} as MessengerContextState
);

interface MessengerProviderProps {
  children: ReactNode;
}

export const MessengerProvider: FC<MessengerProviderProps> = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();

  const onShowErrorCallback = (message: string, error: any) => {
    console.error(message, error);

    const action = (snackbarId: SnackbarKey | undefined) => (
      <Button
        onClick={() => {
          closeSnackbar(snackbarId);
        }}
        sx={{ m: 2 }}
        variant="text"
        size="small"
      >
        Dismiss
      </Button>
    );
    const errorString = error.toString();
    enqueueSnackbar(message + ": " + errorString, {
      variant: "error",
      action,
      autoHideDuration: 5000,
    });
  };

  return (
    <MessengerContext.Provider value={{ showError: onShowErrorCallback }}>
      {children}
    </MessengerContext.Provider>
  );
};

// Custom hook to use the MessengerContext
export const useMessenger = () => {
  const context = useContext(MessengerContext);
  if (context === undefined) {
    throw new Error("useMessenger must be used within a MessengerProvider");
  }
  return context;
};
