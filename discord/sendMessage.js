const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const app = express();
app.use(express.json());

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.login(process.env.DISCORD_BOT_TOKEN);

// Route to send message to a Discord channel
async function sendMessage(channelId,message) {
    if (!channelId || !message) {
        return false;
    }

    try {
        const channel = await client.channels.fetch(channelId);

        if (!channel || !channel.isTextBased()) {
            return false;
        }

        await channel.send(message);  // Send message to the Discord channel
        return true;
    } catch (error) {
        console.error('Error sending message:', error);
        return false;
    }
}

module.exports = sendMessage;