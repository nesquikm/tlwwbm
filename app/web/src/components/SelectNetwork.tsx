import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";

// Yup, this is my QuickNode endpoint with free tier
const quicknodeMainNet = 'https://multi-fragrant-cherry.solana-mainnet.quiknode.pro/8347bb893478606bb2aa01d5c145dcbcd1e39540';

interface SelectNetworkProps {
  endpoint: string;
  setEndpoint: (endpoint: string) => void;
}

export default function SelectNetwork({ endpoint, setEndpoint }: SelectNetworkProps) {
  const handleChange = (event: SelectChangeEvent) => {
    setEndpoint(event.target.value);
  };

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
      <InputLabel>Network</InputLabel>
      <Select value={endpoint} label="Network" onChange={handleChange}>
        <MenuItem value={clusterApiUrl(WalletAdapterNetwork.Mainnet)}>Mainnet</MenuItem>
        <MenuItem value={quicknodeMainNet}>Mainnet (QuickNode)</MenuItem>
        <MenuItem value={clusterApiUrl(WalletAdapterNetwork.Devnet)}>Devnet</MenuItem>
        <MenuItem value={clusterApiUrl(WalletAdapterNetwork.Testnet)}>Testnet</MenuItem>
      </Select>
    </FormControl>
  );
}

export function getDefaultEndpoint() {
  return clusterApiUrl(WalletAdapterNetwork.Devnet);
}
