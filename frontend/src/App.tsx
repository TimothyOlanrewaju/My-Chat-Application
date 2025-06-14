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

const apiKey = "y388kgj7k3jk";
const userId = "1368888";
const userName = "Smooth Tee Test App";
const userToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTM2ODg4OCJ9.zk_DkpT1bJI-RzHo_PQyc5ppVh80M83xQ3H9ZazGRGI";

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
