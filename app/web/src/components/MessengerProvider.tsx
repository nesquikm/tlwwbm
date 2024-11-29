import Button from "@mui/material/Button";
import { closeSnackbar, SnackbarKey, useSnackbar } from "notistack";
import { createContext, type FC, type ReactNode, useContext } from "react";


const ERROR_AUTOHIDE_DURATION = 5000;
const MESSAGE_AUTOHIDE_DURATION = 5000;

interface MessengerContextState {
  showError: (message: string, error: any) => void;
  showMessage: (message: string) => void;
}

const MessengerContext = createContext<MessengerContextState>(
  {} as MessengerContextState
);

interface MessengerProviderProps {
  children: ReactNode;
}

export const MessengerProvider: FC<MessengerProviderProps> = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();

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

  const onShowErrorCallback = (message: string, error: any) => {
    console.error(message, error);

    const errorString = error.toString();
    enqueueSnackbar(message + ": " + errorString, {
      variant: "error",
      action,
      autoHideDuration: ERROR_AUTOHIDE_DURATION,
    });
  };

  const onShowMessageCallback = (message: string) => {
    enqueueSnackbar(message, {
      variant: "success",
      autoHideDuration: MESSAGE_AUTOHIDE_DURATION,
      action,
    });
  }

  return (
    <MessengerContext.Provider value={{ showError: onShowErrorCallback, showMessage: onShowMessageCallback }}>
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
