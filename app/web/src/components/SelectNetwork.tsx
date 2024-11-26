import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

interface SelectNetworkProps {
  network: WalletAdapterNetwork;
  setNetwork: (network: WalletAdapterNetwork) => void;
}

export default function SelectNetwork({ network, setNetwork }: SelectNetworkProps) {
  const handleChange = (event: SelectChangeEvent) => {
    setNetwork(event.target.value as WalletAdapterNetwork);
  };

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
      <InputLabel id="select-network">Network</InputLabel>
      <Select value={network} label="Network" onChange={handleChange}>
        <MenuItem value={WalletAdapterNetwork.Mainnet}>Mainnet</MenuItem>
        <MenuItem value={WalletAdapterNetwork.Devnet}>Devnet</MenuItem>
        <MenuItem value={WalletAdapterNetwork.Testnet}>Testnet</MenuItem>
      </Select>
    </FormControl>
  );
}
