const { SlashCommandBuilder } = require("discord.js");
const config = require("../config");

/**
 * Kick no role
 * @param {*} interaction
 * @returns
 */
async function kickNoRole(interaction) {
  // Optional: only allow members with Kick permission to run this
  if (!interaction.memberPermissions?.has("KickMembers")) {
    return interaction.reply({
      content: "You don't have permission to use this command.",
      ephemeral: true,
    });
  }

  // Defer because this can take longer than 3 seconds
  await interaction.deferReply({ ephemeral: true });

  const guild = interaction.guild;
  if (!guild) {
    return interaction.editReply("This command can only be used in a server.");
  }

  // Fetch all members (note: requires GUILD_MEMBERS intent)
  const members = await guild.members.fetch();

  // Members with only specific role
  let membersWithRole = members.filter((m) => m.roles.cache.size === 1);

  if (membersWithRole.size === 0) {
    return interaction.editReply("Everyone has at least one role!");
  }

  let kicked = 0;
  let failed = 0;

  for (const member of membersWithRole.values()) {
    // skip yourself / bot owner if you want (optional)
    if (!member.kickable) {
      failed++;
      continue;
    }

    try {
      await member.kick();
      kicked++;
      console.log(`Kicked member: ${member.displayName} ✅`);
      console.log(`=======`);
    } catch (err) {
      failed++;
      console.log(err);
    }
  }

  return interaction.editReply(
    `Done.\n✅ Kicked: ${kicked}\n❌ Failed/Not kickable: ${failed}\nTotal matched: ${membersWithRole.size}`,
  );
}

module.exports = {
  kickNoRole,
  kickNoRoleScb,
};
