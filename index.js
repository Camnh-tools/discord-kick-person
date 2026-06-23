require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const scb = require('./commands');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,           // Required for basic bot operation
        GatewayIntentBits.GuildMessages,    // Allows bot to see message events
        GatewayIntentBits.MessageContent,   // Allows bot to read the text inside messages
        GatewayIntentBits.GuildMembers     // Allows bot to access guild member information
    ]
});

client.on('ready', async () => {
  // Register slash commands when bot starts up
  const commands  = scb.scbCommands.map(command => command.toJSON());

  // Register the commands with Discord's API
  await client.application.commands.set(commands);
  console.log("Slash commands registered.");
});

//interaction create
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  scb.switchInteractionCommand(interaction)
});

// Use an environment variable or keep this private!
client.login(process.env.DISCORD_TOKEN);