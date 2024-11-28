import { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { formatSol } from "./helpers";
import { useTopic, TopicData } from "./TopicProvider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function TopicsPanel() {
  const { getTopics } = useTopic();

  const [topics, setTopics] = useState([] as TopicData[]);

  const fetchTopics = async () => {
    const topics = await getTopics();
    setTopics(topics.sort((a, b) => b.createdAt.cmp(a.createdAt)));
  };

  useEffect(() => {
    setTopics([]);

    fetchTopics();
  }, []);

  return (
    <Paper sx={{ mt: 2, pl: 2, pr: 2 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Topics
        </Typography>
        <IconButton aria-label="delete" onClick={fetchTopics}>
          <RefreshIcon />
        </IconButton>
      </Toolbar>
      <List sx={{ width: "100%" }}>
        {topics.map((topic) => TopicListItem(topic))}
      </List>
    </Paper>
  );
}

function TopicListItem(topic: TopicData) {
  const canBeLockedDate = topic.canBeLockedAfter.toNumber() * 1000;
  const canBeLockedString =
    Date.now() > canBeLockedDate
      ? "NOW"
      : new Date(canBeLockedDate).toLocaleString();

  const lockString = topic.isLocked
    ? "Locked"
    : "Can be locked: " + canBeLockedString;

  return (
    <Box key={topic.topicString}>
      <ListItem>
        <ListItemText
          primary={topic.topicString + " : " + topic.lastCommentString}
          secondary={
            "Fee Multiplier: " +
            topic.feeMultiplier.toString() +
            " - " +
            "Raised: " +
            formatSol(topic.raised) +
            " - " +
            "Comment Count: " +
            topic.commentCount.toString() +
            " - " +
            lockString
          }
        />
      </ListItem>
      <Divider />
    </Box>
  );
}
