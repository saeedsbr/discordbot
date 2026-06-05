import { Client, GatewayIntentBits, Events, Partials, Message } from 'discord.js';
import dotenv from 'dotenv';
import http from 'http';

// Load environment variables from .env file
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages,
  ],
  partials: [Partials.Channel]
});

client.once(Events.ClientReady, (c) => {
  console.log(`✅ Bot is online! Logged in as ${c.user.tag}`);
});

client.on(Events.MessageCreate, async (message: Message) => {
  if (message.author.bot) return; 

  if (message.channel.isDMBased()) {
    console.log(`📩 Received DM from ${message.author.tag}: ${message.content}`);
    
    try {
      const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
      if (N8N_WEBHOOK_URL) {
        const body = {
          type: 'direct_message',
          userId: message.author.id,
          message: message.content
        };

        await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
      } else {
        console.warn('ON_DIRECT_MESSAGE_RECEIVED_URL is not defined in environment.');
      }

      console.log(`✉️ Replied to ${message.author.tag}`);
    } catch (error) {
      console.error('❌ Error sending reply:', error);
    }
  } else if (message.mentions.has(client.user!.id)) {
    console.log(`💬 Mentioned in channel by ${message.author.tag}: ${message.content}`);

    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
    if (N8N_WEBHOOK_URL) {
      const body = {
        type: 'channel_mention',
        userId: message.author.id,
        message: message.content,
        channelId: message.channel.id,
      };

      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
    } else {
      console.warn('ON_DIRECT_MESSAGE_RECEIVED_URL is not defined in environment.');
    }
    
    try {
      console.log(`✉️ Replied to ${message.author.tag} in channel`);
    } catch (error) {
      console.error('❌ Error sending reply:', error);
    }
  }
});

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
  console.error('❌ Error: DISCORD_BOT_TOKEN is not defined in .env file');
  process.exit(1);
}

client.login(token);

const port = Number(process.env.PORT || 3000);

http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Discord bot is running\n');
}).listen(port, () => {
  console.log(`Health server listening on port ${port}`);
});
