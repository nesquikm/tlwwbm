import { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useWallet } from "@solana/wallet-adapter-react";
import { formatSol, LAMPORTS_PER_SOL } from "./helpers";
import { useUser } from "./UserProvider";
import { useConfig } from "./ConfigProvider";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid2";
import { BN } from "@coral-xyz/anchor";
import Button from "@mui/material/Button";

export default function AdminPanel() {
  const { publicKey } = useWallet();

  const { userData } = useUser();
  const { configData, updateConfigData, initConfigData, deleteConfigData } = useConfig();

  const [tFee, setTFee] = useState(configData?.tFee ?? new BN(0));
  const [cFee, setCFee] = useState(configData?.cFee ?? new BN(0));
  const [cFeeIncrement, setCFeeIncrement] = useState(
    configData?.cFeeIncrement ?? new BN(0)
  );
  const [topicAuthorShare, setTopicAuthorShare] = useState(
    configData?.topicAuthorShare ?? 0
  );
  const [lastCommentAuthorShare, setLastCommentAuthorShare] = useState(
    configData?.lastCommentAuthorShare ?? 0
  );
  const [topicLockTime, setTopicLockTime] = useState(
    configData?.topicLockTime ?? new BN(0)
  );

  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    setTFee(configData?.tFee ?? new BN(0));
    setCFee(configData?.cFee ?? new BN(0));
    setCFeeIncrement(configData?.cFeeIncrement ?? new BN(0));
    setTopicAuthorShare(configData?.topicAuthorShare ?? 0);
    setLastCommentAuthorShare(configData?.lastCommentAuthorShare ?? 0);
    setTopicLockTime(configData?.topicLockTime ?? new BN(0));
  }, [configData]);

  if (!publicKey) return null;

  if (configData === null) {
    return null;
  }

  if (configData?.admin.equals(publicKey) === false) {
    return null;
  }

  function updateData() {
    updateConfigData({
      tFee: tFee,
      cFee: cFee,
      cFeeIncrement: cFeeIncrement,
      topicAuthorShare: topicAuthorShare,
      lastCommentAuthorShare: lastCommentAuthorShare,
      topicLockTime: topicLockTime,
    });
  }

  function deleteData() {
    deleteConfigData();
  }

  function initData() {
    initConfigData();
  }

  if (configData === undefined) {
    return (
      <Paper sx={{ mt: 2 }}>
        <Button onClick={initData} sx={{ m: 2 }} variant="outlined">
          Init config
        </Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ mt: 2 }}>
      <Toolbar>
        <Typography variant="subtitle1" component="div" sx={{ flexGrow: 1 }}>
          Admin Panel
        </Typography>
        <Typography variant="subtitle2" component="div">
          Balance{": "}
          {userData ? formatSol(userData.balance) : "Loading..."}
        </Typography>
      </Toolbar>
      <Grid container spacing={1} sx={{ pl: 2, pr: 2 }}>
        <TextField
          label="tFee"
          type="string"
          value={formatSol(tFee)}
          onChange={(e) =>
            setTFee(new BN(Number(e.target.value) * LAMPORTS_PER_SOL))
          }
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          helperText={showIfDiffers(
            formatSol(tFee),
            formatSol(configData.tFee)
          )}
        />
        <TextField
          label="cFee"
          type="string"
          value={formatSol(cFee)}
          onChange={(e) =>
            setCFee(new BN(Number(e.target.value) * LAMPORTS_PER_SOL))
          }
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          helperText={showIfDiffers(
            formatSol(cFee),
            formatSol(configData.cFee)
          )}
        />
        <TextField
          label="cFeeIncrement"
          type="string"
          value={formatSol(cFeeIncrement)}
          onChange={(e) =>
            setCFeeIncrement(new BN(Number(e.target.value) * LAMPORTS_PER_SOL))
          }
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          helperText={showIfDiffers(
            formatSol(cFeeIncrement),
            formatSol(configData.cFeeIncrement)
          )}
        />
      </Grid>
      <Grid container spacing={1} sx={{ pt: 2, pl: 2, pr: 2 }}>
        <TextField
          label="Topic author share"
          type="number"
          value={topicAuthorShare}
          onChange={(e) => setTopicAuthorShare(Number(e.target.value))}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          helperText={showIfDiffers(
            topicAuthorShare,
            configData.topicAuthorShare
          )}
        />
        <TextField
          label="Last comment author share"
          type="number"
          value={lastCommentAuthorShare}
          onChange={(e) => setLastCommentAuthorShare(Number(e.target.value))}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          helperText={showIfDiffers(
            lastCommentAuthorShare,
            configData.lastCommentAuthorShare
          )}
        />
        <TextField
          label="Topic lock time"
          type="number"
          value={topicLockTime}
          onChange={(e) => setTopicLockTime(new BN(Number(e.target.value)))}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          helperText={showIfDiffers(topicLockTime, configData.topicLockTime)}
        />
      </Grid>
      <Grid container spacing={1} sx={{ pt: 2, pl: 2, pr: 2 }}>
        <TextField
          label="fuse (DeLeTe)"
          type="string"
          onChange={(e) =>
            setCanDelete(e.target.value === "DeLeTe" ? true : false)
          }
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
        />
        <Button onClick={deleteData} variant="outlined" disabled={!canDelete}>
          Delete config
        </Button>
      </Grid>
      <Button sx={{ m: 2 }} onClick={updateData} variant="contained">
        Update
      </Button>
    </Paper>
  );
}

function showIfDiffers(
  value: number | BN | string | undefined,
  configValue: number | BN | string | undefined
) {
  if (value === configValue) return null;
  return "Was " + configValue;
}
