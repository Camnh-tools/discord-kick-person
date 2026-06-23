const {kickNoRole, kickSpecificRoleScb, kickNoRoleScb} = require('./kick-no-role-logic')
const config = require('../config');
const kickWithSpecificRole = require('./kick-with-role-logic');

async function switchInteractionCommand(interaction) {
    const {command} = interaction
    if (command.name == config.commands.KICK_NO_ROLE) {
        await kickNoRole(interaction)
    }

    else if (command.name == config.commands.KICK_ROLE) {
        const role = interaction.options.getRole('role');
        await kickWithSpecificRole(interaction, role)
    }
}


module.exports.scbCommands = [kickSpecificRoleScb, kickNoRoleScb]

module.exports.switchInteractionCommand = switchInteractionCommand