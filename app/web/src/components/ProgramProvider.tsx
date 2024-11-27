import { createContext, useContext, type FC, type ReactNode } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { Program } from "@coral-xyz/anchor";
import { Tlwwbm } from "../../../../target/types/tlwwbm";
import idl from "../../../../target/idl/tlwwbm.json";

interface ProgramContextState {
  program: Program<Tlwwbm>;
}

export const ProgramContext = createContext<ProgramContextState>(
  {} as ProgramContextState
);

interface ProgramProviderProps {
  children: ReactNode;
}

export const ProgramProvider: FC<ProgramProviderProps> = ({ children }) => {
  const { connection } = useConnection();

  const program = new Program(idl as Tlwwbm, {
    connection,
  });

  return (
    <ProgramContext.Provider value={{ program }}>
      {children}
    </ProgramContext.Provider>
  );
};

// Custom hook to use the ProgramContext
export const useProgram = () => {
  const context = useContext(ProgramContext);
  if (context === undefined) {
    throw new Error("useProgram must be used within a ProgramProvider");
  }
  return context;
};
