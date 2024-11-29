import { useState } from "react";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useWallet } from "@solana/wallet-adapter-react";
import { formatSol, getTopicUrl } from "./helpers";
import { useConfig } from "./ConfigProvider";
import { useTopic } from "./TopicProvider";
import TextField from "@mui/material/TextField";
import { BN } from "@coral-xyz/anchor";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import Grid from "@mui/material/Grid2";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router";
import { useUser } from "./UserProvider";

const maxFeeMultiplier = 100;

export default function CreateTopicPanel() {
  const { publicKey } = useWallet();
  const { configData } = useConfig();
  const { createTopicData } = useTopic();
  const { userData } = useUser();
  let navigate = useNavigate();

  const [topicString, setTopicString] = useState("");
  const [commentString, setCommentString] = useState("");
  const [feeMultiplier, setFeeMultiplier] = useState(new BN(1));
  const [busy, setBusy] = useState(false);

  if (!publicKey) return null;

  if (configData === null) {
    return null;
  }

  function createData() {
    const newTopicString = topicString.trim();
    const newCommentString = commentString.trim();
    setBusy(true);
    createTopicData({
      topicString: newTopicString,
      lastCommentString: newCommentString,
      feeMultiplier: feeMultiplier,
    }).then((result) => {
      setBusy(false);
      if (result) {
        setTopicString("");
        setCommentString("");
        navigate(getTopicUrl(newTopicString));
      }
    });
  }

  return (
    <Paper sx={{ mt: 2, pl: 2, pr: 2 }}>
      <Toolbar>
        <Typography variant="h6">Create Topic</Typography>
      </Toolbar>
      <TextField
        fullWidth
        label="Topic"
        value={topicString}
        onChange={(e) => setTopicString(e.target.value)}
        disabled={busy}
      />
      <TextField
        fullWidth
        sx={{ mt: 2 }}
        label="Comment"
        value={commentString}
        onChange={(e) => setCommentString(e.target.value)}
        disabled={busy}
      />
      <Typography variant="body2" sx={{ mt: 2 }}>
        Fee Multiplier: {feeMultiplier.toString()}
      </Typography>
      <Slider
        aria-label="Fee Multiplier"
        value={feeMultiplier.toNumber()}
        valueLabelDisplay="auto"
        shiftStep={1}
        step={1}
        min={1}
        max={maxFeeMultiplier}
        marks
        onChange={(_, value) => setFeeMultiplier(new BN(value))}
        disabled={busy}
      />
      <Typography variant="body1" sx={{ mt: 2 }}>
        It will cost you{" "}
        {formatSol(configData?.tFee?.mul(new BN(feeMultiplier)) ?? new BN(0))}{" "}
        SOL to create this topic.
        Currently you have{" "}
        {formatSol(userData?.balance ?? new BN(0))} SOL.
      </Typography>
      <Typography variant="body2" sx={{ mt: 2 }}>
        First comment will cost{" "}
        {formatSol(configData?.cFee?.mul(new BN(feeMultiplier)) ?? new BN(0))}{" "}
        SOL Then each next comment will cost{" "}
        {formatSol(
          configData?.cFeeIncrement?.mul(new BN(feeMultiplier)) ?? new BN(0)
        )}{" "}
        SOL more.
      </Typography>
      <Grid container>
        <Button
          variant="contained"
          sx={{ mt: 2, mb: 2 }}
          onClick={createData}
          disabled={topicString === "" || commentString === "" || busy}
        >
          Create
        </Button>
        {busy && <CircularProgress size={32} sx={{ m: 2 }} />}
      </Grid>
    </Paper>
  );
}
