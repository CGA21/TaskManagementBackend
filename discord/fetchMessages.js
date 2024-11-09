// Import necessary modules
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // Required to read messages
    ],
});

client.login(process.env.DISCORD_BOT_TOKEN);

async function fetchMessages(channelId, limit = 50) {
    try {
        const channel = await client.channels.fetch(channelId);
        const messages = await channel.messages.fetch({ limit });

        // Format messages to a simple array for sending to frontend
        return messages.map(msg => ({
            author: msg.author.username,
            content: msg.content,
            timestamp: msg.createdAt,
        }));
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
}
module.exports = fetchMessages;