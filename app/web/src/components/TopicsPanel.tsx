import { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { getTopicInfoString, getTopicUrl } from "./helpers";
import { useTopic, TopicData } from "./TopicProvider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import ListItemButton from "@mui/material/ListItemButton";
import { useLocation, useNavigate } from "react-router";
import TopicDialog from "./TopicDialog";

export default function TopicsPanel() {
  const { getTopics } = useTopic();
  let location = useLocation();
  let navigate = useNavigate();

  const [topics, setTopics] = useState([] as TopicData[]);
  const [activeTopic, setActiveTopic] = useState(null as string | null);

  const fetchTopics = async () => {
    const topics = await getTopics();
    setTopics(topics.sort((a, b) => b.createdAt.cmp(a.createdAt)));
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const topic = params.get("topic");
    setActiveTopic(topic);
    console.log(`Location changed: ${topic}`);
  }, [location]);

  useEffect(() => {
    setTopics([]);

    fetchTopics();
  }, []);

  function onTopicDialogClose() {
    navigate("");
  }

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
      <TopicDialog topicString={activeTopic} onClose={onTopicDialogClose} />
    </Paper>
  );

  function showTopic(topic: TopicData) {
    navigate(getTopicUrl(topic.topicString));
  }

  function TopicListItem(topic: TopicData) {
    return (
      <Box key={topic.topicString}>
        <ListItem disablePadding>
          <ListItemButton onClick={() => showTopic(topic)}>
            <ListItemText
              primary={topic.topicString + " : " + topic.lastCommentString}
              secondary={getTopicInfoString(topic)}
            />
          </ListItemButton>
        </ListItem>
        <Divider />
      </Box>
    );
  }
}
