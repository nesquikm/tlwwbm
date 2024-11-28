import { useState } from "react";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useWallet } from "@solana/wallet-adapter-react";
import { formatSol } from "./helpers";
import { useConfig } from "./ConfigProvider";
import { useTopic } from "./TopicProvider";
import TextField from "@mui/material/TextField";
import { BN } from "@coral-xyz/anchor";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";

const maxFeeMultiplier = 100;

export default function CreateTopicPanel() {
  const { publicKey } = useWallet();
  const { configData } = useConfig();
  const { createTopicData } = useTopic();

  const [topicString, setTopicString] = useState("");
  const [commentString, setCommentString] = useState("");
  const [feeMultiplier, setFeeMultiplier] = useState(new BN(1));

  if (!publicKey) return null;

  if (configData === null) {
    return null;
  }

  function createData() {
    createTopicData({
      topicString: topicString.trim(),
      lastCommentString: commentString.trim(),
      feeMultiplier: feeMultiplier,
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
        />
        <TextField
          fullWidth
          sx={{ mt: 2 }}
          label="Comment"
          value={commentString}
          onChange={(e) => setCommentString(e.target.value)}
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
        />
        <Typography variant="body1" sx={{ mt: 2 }}>
          It will cost you{" "}
          {formatSol(configData?.tFee?.mul(new BN(feeMultiplier)) ?? new BN(0))}{" "}
          SOL to create this topic.
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          First comment will cost{" "}
          {formatSol(configData?.cFee?.mul(new BN(feeMultiplier)) ?? new BN(0))}{" "}
          SOL
          Then each next comment will cost{" "}
          {formatSol(
            configData?.cFeeIncrement?.mul(new BN(feeMultiplier)) ?? new BN(0)
          )}{" "}
          SOL more.
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2, mb: 2 }}
          onClick={createData}
          disabled={topicString === "" || commentString === ""}
        >
          Create
        </Button>
      </Paper>
  );
}
