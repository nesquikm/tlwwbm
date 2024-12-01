import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Box from "@mui/material/Box";
import { BN } from "@coral-xyz/anchor";
import { formatDuration, formatSol } from "./helpers";
import { useConfig } from "./ConfigProvider";

export interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AboutDialog({ open, onClose }: AboutDialogProps) {
  const { configData } = useConfig();

  return (
    <Dialog onClose={onClose} open={open}>
      <Box>
        <DialogTitle>About the Game</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This is a Solana-based on-chain game where players compete to have
            the last word on various topics. Users can create topics by paying a
            fixed fee and writing an initial comment. Others can reply by
            replacing the existing comment, with the cost increasing for each
            replacement, creating a dynamic competition.
          </DialogContentText>
          <DialogContentText sx={{ mt: 1 }}>
            Each topic can hold only one active comment at a time. Topics can be
            locked permanently after a set period, and the last commenter earns
            a larger share of the accumulated fees. When this happens, the topic
            creator receives a share of the accumulated fees, the last commenter
            earns a larger share along with a thematic NFT (TBD), and the topic
            becomes a permanent part of the game history.
          </DialogContentText>
          <DialogContentText sx={{ mt: 1 }}>
            While the topic has no comments, the topic creator can delete it and
            receive a full refund. The game challenges players to strategically
            manage their spending, compete for rewards, and claim the ultimate
            prize of having the “last word.”
          </DialogContentText>
          <DialogContentText variant="h6">
            Game Mechanics: fees
          </DialogContentText>
          <DialogContentText variant="body2">
            Topic creation fee: {formatSol(configData?.tFee || new BN(0))} SOL.
          </DialogContentText>
          <DialogContentText variant="body2">
            Topic comment fee: {formatSol(configData?.cFee || new BN(0))} SOL.
          </DialogContentText>
          <DialogContentText variant="body2">
            Topic comment fee increment:{" "}
            {formatSol(configData?.cFeeIncrement || new BN(0))} SOL.
          </DialogContentText>
          <DialogContentText variant="body2">
            So, the first comment costs{" "}
            {formatSol(configData?.cFee || new BN(0))} SOL, the second costs{" "}
            {formatSol(
              configData?.cFee.add(configData?.cFeeIncrement || new BN(0)) ||
                new BN(0)
            )}{" "}
            SOL, and so on.
          </DialogContentText>
          <DialogContentText variant="body2">
            Topic lock time:{" "}
            {formatDuration(configData?.topicLockTime.toNumber() || 0)}.
          </DialogContentText>
          <DialogContentText variant="h6">
            Game Mechanics: rewards
          </DialogContentText>
          <DialogContentText variant="body2">
            Topic author reward: {(configData?.topicAuthorShare ?? 0) * 100}% of
            the raised fees.
          </DialogContentText>
          <DialogContentText variant="body2">
            Last comment author reward:{" "}
            {(configData?.lastCommentAuthorShare ?? 0) * 100}% of the raised
            fees.
          </DialogContentText>
          <DialogContentText variant="body2" sx={{ mt: 1 }}>
            Source code:{" "}
            <a
              href="https://github.com/nesquikm/tlwwbm"
              target="_blank"
              rel="noreferrer"
            >
              GitHub Repository
            </a>.
          </DialogContentText>
        </DialogContent>
      </Box>
    </Dialog>
  );
}
