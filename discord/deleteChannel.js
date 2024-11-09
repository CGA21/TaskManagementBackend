const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ],
});

client.login(process.env.DISCORD_BOT_TOKEN);

async function deleteChannel(channelId) {
    try {
        const channel = await client.channels.fetch(channelId);
        await channel.delete();  // Deletes the channel
        //console.log(`Channel ${channel.name} deleted successfully.`);
    } catch (error) {
        console.error('Error deleting channel:', error);
    }
}

module.exports = deleteChannel;