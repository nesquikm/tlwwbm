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
}: {
  topicData: TopicData;
  onCommentTopicData: (data: CommentTopicData) => void;
  onDeleteTopicData: () => void;
  onLockTopicData: () => void;
}) {
  const { publicKey } = useWallet();
  const { configData } = useConfig();
  const [newCommentString, setNewCommentString] = useState("");

  const userIsAuthor = publicKey?.equals(topicData.topicAuthor) ?? false;
  const isLocked = topicData.isLocked;
  const canBeDeleted = userIsAuthor && topicData.commentCount.eq(new BN(0));
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

  return (
    <Box>
      <DialogTitle>{topicData?.topicString}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Last Comment: {topicData?.lastCommentString}
        </DialogContentText>
        {canBeCommented && (
          <Box>
            <TextField
              fullWidth
              label="New comment"
              onChange={(e) => setNewCommentString(e.target.value)}
              sx={{ mt: 2, minWidth: 300 }}
            />
            <Typography variant="body1" sx={{ mt: 2 }}>
              It will cost you {formatSol(commentCost)} SOL to comment this
              topic.
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
      <DialogActions>
        {canBeCommented && (
          <Button
            variant="contained"
            onClick={() =>
              onCommentTopicData({ commentString: newCommentString.trim() })
            }
            disabled={commentButtonDisabled}
          >
            Comment
          </Button>
        )}
        {canBeLocked && <Button onClick={onLockTopicData}>Lock Topic</Button>}
        {canBeDeleted && (
          <Button onClick={onDeleteTopicData}>Delete Topic</Button>
        )}
      </DialogActions>
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
          The topic you are looking for does not exist.
        </DialogContentText>
      </DialogContent>
    </Box>
  );
}
