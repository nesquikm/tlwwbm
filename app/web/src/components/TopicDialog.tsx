import { useTopic, TopicProvider } from "./TopicProvider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";

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
  const { topicData } = useTopic();

  const open = topicString !== null;

  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>{topicData?.topicString}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Last Comment: {topicData?.lastCommentString}
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}
