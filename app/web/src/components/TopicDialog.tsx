import { useTopic, TopicProvider, TopicData } from "./TopicProvider";
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
  const { topicData, lockTopicData, deleteTopicData } =
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
          onDeleteTopicData={deleteTopicData}
          onLockTopicData={lockTopicData}
        />
      )}
    </Dialog>
  );
}

function TopicDialogContentFound({
  topicData,
  onDeleteTopicData,
  onLockTopicData,
}: {
  topicData: TopicData;
  onDeleteTopicData: () => void;
  onLockTopicData: () => void;
}) {
  const { publicKey } = useWallet();

  const userIsAuthor = publicKey?.equals(topicData.topicAuthor) ?? false;
  const isLocked = topicData.isLocked;
  const canBeDeleted = userIsAuthor && topicData.commentCount.eq(new BN(0));
  const canBeLocked =
    !isLocked &&
    publicKey != null &&
    topicData.canBeLockedAfter.lte(new BN(Date.now() / 1000));

  return (
    <Box>
      <DialogTitle>{topicData?.topicString}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Last Comment: {topicData?.lastCommentString}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {canBeLocked && (
          <Button onClick={onLockTopicData}>Lock Topic</Button>
        )}
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
