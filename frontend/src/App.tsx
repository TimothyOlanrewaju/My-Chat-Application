import { useState, useEffect } from "react";
import type { User, Channel as StreamChannel } from "stream-chat";
import {
  useCreateChatClient,
  Chat,
  Channel,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import ChannelHeader from "./ChannelHeader";
import CustomMessageInput from "./CustomMessageInput";
import "stream-chat-react/dist/css/v2/index.css";
import AIStateIndicator from "./AIStateIndicator";

const apiKey = "xxxxxxxxxxxx";
const userId = "xxxxxxxxx";
const userName = "John Doe";
const userToken =
  "xxxxxxxxxxxxxxxxxxxxxxxxx.exxxxxxxJ9.zkxxxxJI-RzHo_PQyc5ppxxxxxxxxRGI";

const user: User = {
  id: userId,
  name: userName,
  image: `https://getstream.io/random_png/?name=${userName}`,
};

const App = () => {
  const [channel, setChannel] = useState<StreamChannel>();
  const client = useCreateChatClient({
    apiKey,
    tokenOrProvider: userToken,
    userData: user,
  });

  useEffect(() => {
    if (!client) return;
    const channel = client.channel("messaging", "my_channelll", {
      members: [userId],
    });

    setChannel(channel);
  }, [client]);

  if (!client) return <div>Setting up client & connection...</div>;

  return (
    <Chat client={client}>
      <Channel channel={channel}>
        <Window>
          <ChannelHeader />
          <MessageList />
          <AIStateIndicator />
          <MessageInput Input={CustomMessageInput} />
        </Window>
        <Thread />
      </Channel>
    </Chat>
  );
};

export default App;
