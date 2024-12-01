import { useState } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AboutDialog from "./AboutDialog";

export default function AboutPanel() {
  const [open, setOpen] = useState(false);

  function onAboutDialogClose() {
    setOpen(false);
  }

  function moreInfo() {
    setOpen(true);
  }

  return (
    <Paper sx={{ mt: 2, p:2 }}>
        <Typography variant="subtitle2" component="div">
          This is a small Solana-based game where players compete to have the
          last word on various topics. Users can create topics, pay to replace
          comments, and earn rewards when topics lock after a timeout. With
          growing costs for each comment and unique mechanics, the game blends
          strategy, greed, and fun!
        </Typography>
        <Button onClick={moreInfo}>
          More Info
        </Button>
        <AboutDialog open={open} onClose={onAboutDialogClose} />
    </Paper>
  );
}
