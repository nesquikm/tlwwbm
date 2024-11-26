import { useState } from "react";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

export default function SelectNetwork() {
  const [age, setNetwork] = useState('Mainnet-beta');

  const handleChange = (event: SelectChangeEvent) => {
    setNetwork(event.target.value);
  };

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
      <InputLabel id="select-network">Network</InputLabel>
      <Select
        value={age}
        label="Network"
        onChange={handleChange}
      >
        <MenuItem value={"Mainnet-beta"}>Mainnet-beta</MenuItem>
        <MenuItem value={"Devnet"}>Devnet</MenuItem>
        <MenuItem value={"Testnet"}>Testnet</MenuItem>
      </Select>
    </FormControl>
  );
}
