import {
  useTopic,
  TopicProvider,
  TopicData,
  CommentTopicData,
} from "./TopicProvider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useWallet } from "@solana/wallet-adapter-react";
import DialogActions from "@mui/material/DialogActions";
import { BN } from "@coral-xyz/anchor";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import Typography from "@mui/material/Typography";
import { formatSol, getTopicInfoString } from "./helpers";
import { useConfig } from "./ConfigProvider";
import Grid from "@mui/material/Grid2";
import { useUser } from "./UserProvider";

export interface TopicDialogProps {
  topicString: string | null;
  onClose: () => void;
}

export default function TopicDialog({
  topicString,
  onClose,
}: TopicDialogProps) {
  return (
    <TopicProvider topicString={topicString}>
      <TopicDialogContent topicString={topicString} onClose={onClose} />
    </TopicProvider>
  );
}

function TopicDialogContent({ onClose, topicString }: TopicDialogProps) {
  const { topicData, lockTopicData, deleteTopicData, commentTopicData } =
    useTopic();

  const open = topicString !== null;

  return (
    <Dialog onClose={onClose} open={open}>
      {topicData === undefined ? (
        <TopicDialogContentNotFound />
      ) : topicData === null ? (
        <TopicDialogContentLoading />
      ) : (
        <TopicDialogContentFound
          topicData={topicData}
          onCommentTopicData={commentTopicData}
          onDeleteTopicData={deleteTopicData}
          onLockTopicData={lockTopicData}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
}

function TopicDialogContentFound({
  topicData,
  onCommentTopicData,
  onDeleteTopicData,
  onLockTopicData,
  onClose,
}: {
  topicData: TopicData;
  onCommentTopicData: (data: CommentTopicData) => Promise<boolean>;
  onDeleteTopicData: () => Promise<boolean>;
  onLockTopicData: () => Promise<boolean>;
  onClose: () => void;
}) {
  const { publicKey } = useWallet();
  const { configData } = useConfig();
  const { userData } = useUser();
  const [newCommentString, setNewCommentString] = useState("");
  const [busy, setBusy] = useState(false);

  const userIsAuthor = publicKey?.equals(topicData.topicAuthor) ?? false;
  const isLocked = topicData.isLocked;
  const canBeDeleted =
    userIsAuthor && topicData.commentCount.eq(new BN(0)) && !isLocked;
  const canBeLocked =
    !isLocked &&
    publicKey != null &&
    topicData.canBeLockedAfter.lte(new BN(Date.now() / 1000));
  const canBeCommented = publicKey !== null && !isLocked;

  const commentButtonDisabled = newCommentString.trim() === "";

  const commentCost =
    configData?.cFee
      ?.add(configData?.cFeeIncrement.mul(topicData.commentCount))
      .mul(new BN(topicData.feeMultiplier)) ?? new BN(0);

  function commentData() {
    setBusy(true);
    onCommentTopicData({ commentString: newCommentString.trim() }).then(
      (result) => {
        setBusy(false);
        if (result) {
          setNewCommentString("");
        }
      }
    );
  }

  function lockData() {
    setBusy(true);
    onLockTopicData().then(() => {
      setBusy(false);
    });
  }

  function deleteData() {
    setBusy(true);
    onDeleteTopicData().then((result) => {
      setBusy(false);
      if (result) {
        onClose();
      }
    });
  }

  function copyURL() {
    navigator.clipboard.writeText(window.location.href);
  }

  return (
    <Box sx={{ minWidth: 300 }}>
      <DialogTitle>
        <Grid container>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {" "}
            {topicData?.topicString}
          </Typography>
          <Button onClick={copyURL} disabled={busy}>
            Copy URL
          </Button>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Last Comment: {topicData?.lastCommentString}
        </DialogContentText>
        {canBeCommented && (
          <Box>
            <TextField
              fullWidth
              label="New comment"
              value={newCommentString}
              onChange={(e) => setNewCommentString(e.target.value)}
              sx={{ mt: 2, minWidth: 300 }}
              disabled={busy}
            />
            <Typography variant="body1" sx={{ mt: 2 }}>
              It will cost you {formatSol(commentCost)} SOL to comment this
              topic. Currently you have{" "}
              {formatSol(userData?.balance ?? new BN(0))} SOL.
            </Typography>
          </Box>
        )}
        {publicKey !== null && (
          <Box>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Last Comment Author is{" "}
              {topicData?.lastCommentAuthor.equals(publicKey) ? "" : "not "}you.
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              {getTopicInfoString(topicData)}
            </Typography>
          </Box>
        )}
      </DialogContent>
      {(canBeCommented || canBeLocked || canBeDeleted || busy) && (
        <DialogActions>
          {canBeCommented && (
            <Button
              variant="contained"
              onClick={commentData}
              disabled={commentButtonDisabled || busy}
            >
              Comment
            </Button>
          )}
          {canBeLocked && (
            <Button onClick={lockData} disabled={busy}>
              Lock Topic
            </Button>
          )}
          {canBeDeleted && (
            <Button onClick={deleteData} disabled={busy}>
              Delete Topic
            </Button>
          )}
          {busy && <CircularProgress size={32} sx={{ m: 2 }} />}
        </DialogActions>
      )}
    </Box>
  );
}

function TopicDialogContentLoading() {
  return <CircularProgress sx={{ m: 2 }} />;
}

function TopicDialogContentNotFound() {
  return (
    <Box>
      <DialogTitle>Topic Not Found</DialogTitle>
      <DialogContent>
        <DialogContentText>
          The topic you are looking for does not exist. It's possible that it
          was deleted or just in the process of being created.
        </DialogContentText>
      </DialogContent>
    </Box>
  );
}
