require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');

// Initialize Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

/*
// Log in the bot and wait for it to be ready
client.once('ready', () => {
    console.log('Bot is ready!');
});
*/

client.login(process.env.DISCORD_TOKEN);

async function createProjectChannel(projectName,id) {
    try {
        // Fetch the guild (server) where the channel should be created
        const guild = await client.guilds.fetch(process.env.DISCORD_GUILDID);

        // Check if guild.channels is defined
        if (!guild.channels) {
            throw new Error('Channels are not accessible. Check bot permissions.');
        }

        // Create a text channel with updated syntax for Discord.js v14
        const channel = await guild.channels.create({
            name: `${projectName.toLowerCase()}_${id}`,
            type: ChannelType.GuildText,  // Updated for Discord.js v14
            reason: `New project channel for ${projectName}`,
        });

        return channel.id; // Return the channel ID
    } catch (error) {
        console.error('Error creating project channel:', error);
        throw error;
    }
}

module.exports = createProjectChannel;
