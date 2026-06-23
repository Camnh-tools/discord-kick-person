require('dotenv').config()
const { REST, Routes } = require('discord.js');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

// ...
// for guild-based commands

function deleteCommand() {
    const rest = new REST().setToken(token);

    rest
        .delete(Routes.applicationGuildCommand(clientId, guildId, "1463364119842390189"))
        .then(() => console.log('Successfully deleted guild command'))
        .catch(console.error);
    // for global commands
    rest
        .delete(Routes.applicationCommand(clientId, "1463364119842390189"))
        .then(() => console.log('Successfully deleted application command'))
        .catch(console.error);
}
module.exports = deleteCommand